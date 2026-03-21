import status from "http-status";
import { BookingStatus, Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TCreateReviewPayload, TUpdateReviewPayload } from "./review.validation";

const createReview = async (userId: string, payload: TCreateReviewPayload) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || user.role !== Role.USER) {
        throw new AppError(status.FORBIDDEN, "Only users can create reviews");
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: payload.bookingId
        }
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (booking.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from reviewing this booking");
    }

    if (booking.bookingStatus !== BookingStatus.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "You can only review completed bookings");
    }

    const existingReview = await prisma.review.findUnique({
        where: {
            bookingId: booking.id
        }
    });

    if (existingReview) {
        throw new AppError(status.CONFLICT, "You have already reviewed this booking");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            employeeId: booking.employeeId,
            bookingId: booking.id,
            rating: payload.rating,
            comment: payload.comment
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    serviceCategory: true
                }
            },
            booking: true
        }
    });

    return review;
};

const getReviewsByEmployee = async (employeeId: string) => {
    const employee = await prisma.employeeProfile.findUnique({
        where: {
            id: employeeId
        }
    });

    if (!employee || employee.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    const [reviews, reviewStats] = await Promise.all([
        prisma.review.findMany({
            where: {
                employeeId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                booking: {
                    select: {
                        id: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        }),
        prisma.review.aggregate({
            where: {
                employeeId
            },
            _avg: {
                rating: true
            },
            _count: {
                _all: true
            }
        })
    ]);

    return {
        averageRating: Number((reviewStats._avg.rating ?? 0).toFixed(2)),
        totalReviews: reviewStats._count._all,
        reviews
    };
};

const updateReview = async (userId: string, reviewId: string, payload: TUpdateReviewPayload) => {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId
        },
        include: {
            booking: true
        }
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    if (review.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from updating this review");
    }

    if (review.booking.bookingStatus !== BookingStatus.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "You can only update reviews for completed bookings");
    }

    const updatedReview = await prisma.review.update({
        where: {
            id: review.id
        },
        data: {
            ...(payload.rating !== undefined && { rating: payload.rating }),
            ...(payload.comment !== undefined && { comment: payload.comment })
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    serviceCategory: true
                }
            },
            booking: true
        }
    });

    return updatedReview;
};

export const ReviewServices = {
    createReview,
    getReviewsByEmployee,
    updateReview
};
