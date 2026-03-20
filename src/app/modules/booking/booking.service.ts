import status from "http-status";
import { BookingStatus, PaymentStatus, Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TCreateBookingPayload } from "./booking.validation";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
    BookingStatus.PENDING,
    BookingStatus.ACCEPTED,
    BookingStatus.IN_PROGRESS
];

const BOOKING_WINDOW_START_MINUTES = 9 * 60;
const BOOKING_WINDOW_END_MINUTES = 17 * 60;

const getMinutesFromIsoLocalTime = (isoDateTime: string) => {
    const timeMatch = isoDateTime.match(/T(\d{2}):(\d{2})/);

    if (!timeMatch) {
        return null;
    }

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    return (hours * 60) + minutes;
};

const getIsoLocalDatePart = (isoDateTime: string) => {
    const dateMatch = isoDateTime.match(/^(\d{4}-\d{2}-\d{2})T/);
    return dateMatch ? dateMatch[1] : null;
};

const createBooking = async (userId: string, payload: TCreateBookingPayload) => {
    const startTime = new Date(payload.startTime);
    const endTime = new Date(payload.endTime);

    const startDatePart = getIsoLocalDatePart(payload.startTime);
    const endDatePart = getIsoLocalDatePart(payload.endTime);

    if (!startDatePart || !endDatePart || startDatePart !== endDatePart) {
        throw new AppError(status.BAD_REQUEST, "Start time and end time must be on the same date");
    }

    const startMinutes = getMinutesFromIsoLocalTime(payload.startTime);
    const endMinutes = getMinutesFromIsoLocalTime(payload.endTime);

    if (startMinutes === null || endMinutes === null) {
        throw new AppError(status.BAD_REQUEST, "Invalid time format");
    }

    if (startMinutes < BOOKING_WINDOW_START_MINUTES || startMinutes >= BOOKING_WINDOW_END_MINUTES) {
        throw new AppError(status.BAD_REQUEST, "Start time must be between 9:00 AM and 5:00 PM");
    }

    if (endMinutes <= BOOKING_WINDOW_START_MINUTES || endMinutes > BOOKING_WINDOW_END_MINUTES) {
        throw new AppError(status.BAD_REQUEST, "End time must be between 9:00 AM and 5:00 PM");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user || user.role !== Role.USER) {
        throw new AppError(status.FORBIDDEN, "Only users can create bookings");
    }

    const employee = await prisma.employeeProfile.findFirst({
        where: {
            id: payload.employeeId,
            isDeleted: false,
            isActive: true
        },
        include: {
            vendor: true
        }
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    if (!employee.vendor.isActive || !employee.vendor.isApproved) {
        throw new AppError(status.BAD_REQUEST, "Employee vendor is not available for booking");
    }

    const conflictingBooking = await prisma.booking.findFirst({
        where: {
            employeeId: employee.id,
            bookingStatus: {
                in: ACTIVE_BOOKING_STATUSES
            },
            AND: [
                {
                    startTime: {
                        lt: endTime
                    }
                },
                {
                    endTime: {
                        gt: startTime
                    }
                }
            ]
        }
    });

    if (conflictingBooking) {
        throw new AppError(status.CONFLICT, "This employee is unavailable for the selected time");
    }

    const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (durationInHours <= 0) {
        throw new AppError(status.BAD_REQUEST, "Invalid booking duration");
    }

    const totalPrice = Number((Number(employee.hourlyRate) * durationInHours).toFixed(2));

    const booking = await prisma.booking.create({
        data: {
            userId,
            vendorId: employee.vendorId,
            employeeId: employee.id,
            startTime,
            endTime,
            serviceAddress: payload.serviceAddress,
            note: payload.note,
            totalPrice,
            bookingStatus: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING
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
            vendor: {
                select: {
                    id: true,
                    vendorName: true,
                    logo: true,
                    phone: true,
                    address: true,
                    isApproved: true,
                    isActive: true
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
            }
        }
    });

    return booking;
};

export const BookingServices = {
    createBooking
};
