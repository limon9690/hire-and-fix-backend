import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.createCheckoutSession(
        req.params.bookingId as string,
        req.user.userId
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result
    });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || Array.isArray(signature)) {
        throw new AppError(status.BAD_REQUEST, "Missing Stripe signature");
    }

    if (!Buffer.isBuffer(req.body)) {
        throw new AppError(status.BAD_REQUEST, "Invalid webhook payload");
    }

    const result = await PaymentServices.handleStripeWebhook(req.body, signature);

    res.status(status.OK).json(result);
});

export const PaymentControllers = {
    createCheckoutSession,
    handleStripeWebhook
};
