import status from "http-status";
import { BookingStatus, PaymentStatus } from "../../../../prisma/generated/prisma/enums";
import Stripe from "stripe";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";

const createCheckoutSession = async (bookingId: string, userId: string) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        }
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (booking.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from paying for this booking");
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
        throw new AppError(status.BAD_REQUEST, "Cancelled booking cannot be paid");
    }

    if (
        booking.bookingStatus === BookingStatus.COMPLETED ||
        booking.bookingStatus === BookingStatus.REJECTED
    ) {
        throw new AppError(status.BAD_REQUEST, "This booking is not payable");
    }

    if (booking.paymentStatus === PaymentStatus.SUCCESSFUL) {
        throw new AppError(status.BAD_REQUEST, "This booking has already been paid");
    }

    const amount = Number(booking.totalPrice);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new AppError(status.BAD_REQUEST, "Invalid booking amount");
    }

    const amountInCents = Math.round(amount * 100);

    const payment = await prisma.$transaction(async (tx) => {
        const upsertedPayment = await tx.payment.upsert({
            where: {
                bookingId: booking.id
            },
            update: {
                amount,
                paymentMethod: "STRIPE",
                status: PaymentStatus.PENDING
            },
            create: {
                bookingId: booking.id,
                amount,
                paymentMethod: "STRIPE",
                status: PaymentStatus.PENDING
            }
        });

        await tx.booking.update({
            where: {
                id: booking.id
            },
            data: {
                paymentStatus: PaymentStatus.PENDING
            }
        });

        return upsertedPayment;
    });

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: envVars.STRIPE_CURRENCY,
                    product_data: {
                        name: `Booking Payment (${booking.id})`
                    },
                    unit_amount: amountInCents
                }
            }
        ],
        success_url: envVars.CLIENT_SUCCESS_URL,
        cancel_url: envVars.CLIENT_CANCEL_URL,
        client_reference_id: booking.id,
        metadata: {
            bookingId: booking.id,
            userId: booking.userId,
            paymentId: payment.id
        }
    });

    if (!session.url) {
        throw new AppError(status.BAD_REQUEST, "Failed to create checkout session");
    }

    const updatedPayment = await prisma.payment.update({
        where: {
            id: payment.id
        },
        data: {
            transactionId: session.id
        }
    });

    return {
        checkoutUrl: session.url,
        sessionId: session.id,
        payment: updatedPayment
    };
};

const updatePaymentStateFromCheckoutSession = async (
    session: Stripe.Checkout.Session,
    targetStatus: PaymentStatus
) => {
    const paymentId = session.metadata?.paymentId;

    const payment = paymentId
        ? await prisma.payment.findUnique({
            where: {
                id: paymentId
            }
        })
        : await prisma.payment.findFirst({
            where: {
                transactionId: session.id
            }
        });

    if (!payment) {
        return;
    }

    if (payment.status === PaymentStatus.SUCCESSFUL) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: {
                id: payment.id
            },
            data: {
                status: targetStatus,
                paidAt: targetStatus === PaymentStatus.SUCCESSFUL ? new Date() : null
            }
        });

        await tx.booking.update({
            where: {
                id: payment.bookingId
            },
            data: {
                paymentStatus: targetStatus
            }
        });
    });
};

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            envVars.STRIPE_WEBHOOK_SECRET
        );
    } catch {
        throw new AppError(status.BAD_REQUEST, "Invalid Stripe webhook signature");
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await updatePaymentStateFromCheckoutSession(session, PaymentStatus.SUCCESSFUL);
            break;
        }
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await updatePaymentStateFromCheckoutSession(session, PaymentStatus.FAILED);
            break;
        }
        default:
            break;
    }

    return {
        received: true
    };
};

export const PaymentServices = {
    createCheckoutSession,
    handleStripeWebhook
};
