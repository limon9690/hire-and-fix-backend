import status from "http-status";
import { BookingStatus, PaymentStatus, Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta, TQueryOptions } from "../../utils/queryHelpers";
import {
    TCreateBookingPayload,
    TUpdateBookingStatusByEmployeePayload,
    TUpdateBookingStatusByVendorPayload
} from "./booking.validation";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
    BookingStatus.PENDING,
    BookingStatus.ACCEPTED,
    BookingStatus.IN_PROGRESS
];

const VENDOR_BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.ACCEPTED, BookingStatus.REJECTED],
    [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
    [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.CANCELLED]: []
};

const EMPLOYEE_BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [],
    [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS],
    [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
    [BookingStatus.COMPLETED]: [],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.CANCELLED]: []
};

const bookingIncludeConfig = {
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
    },
    payment: true,
    review: true
} as const;

const BOOKING_WINDOW_START_MINUTES = 9 * 60;
const BOOKING_WINDOW_END_MINUTES = 17 * 60;

type TGetMyBookingsFilters = {
    bookingStatus?: BookingStatus;
    paymentStatus?: PaymentStatus;
};

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
        include: bookingIncludeConfig
    });

    return booking;
};

const getMyBookings = async (
    userId: string,
    role: Role,
    queryOptions: TQueryOptions,
    filters: TGetMyBookingsFilters
) => {
    let whereClause: {
        userId?: string;
        vendorId?: string;
        employeeId?: string;
        bookingStatus?: BookingStatus;
        paymentStatus?: PaymentStatus;
    } = {};

    if (role === Role.USER) {
        whereClause.userId = userId;
    } else if (role === Role.VENDOR) {
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: {
                userId
            }
        });

        if (!vendorProfile) {
            throw new AppError(status.NOT_FOUND, "Vendor profile not found");
        }

        whereClause.vendorId = vendorProfile.id;
    } else if (role === Role.EMPLOYEE) {
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: {
                userId
            }
        });

        if (!employeeProfile || employeeProfile.isDeleted) {
            throw new AppError(status.NOT_FOUND, "Employee profile not found");
        }

        whereClause.employeeId = employeeProfile.id;
    } else {
        throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
    }

    whereClause = {
        ...whereClause,
        ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus })
    };

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where: whereClause,
            include: bookingIncludeConfig,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.booking.count({
            where: whereClause
        })
    ]);

    return {
        data: bookings,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getBookingDetails = async (bookingId: string, userId: string, role: Role) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: bookingIncludeConfig
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (role === Role.ADMIN) {
        return booking;
    }

    if (role === Role.USER) {
        if (booking.userId !== userId) {
            throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
        }

        return booking;
    }

    if (role === Role.VENDOR) {
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: {
                userId
            }
        });

        if (!vendorProfile) {
            throw new AppError(status.NOT_FOUND, "Vendor profile not found");
        }

        if (booking.vendorId !== vendorProfile.id) {
            throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
        }

        return booking;
    }

    if (role === Role.EMPLOYEE) {
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: {
                userId
            }
        });

        if (!employeeProfile || employeeProfile.isDeleted) {
            throw new AppError(status.NOT_FOUND, "Employee profile not found");
        }

        if (booking.employeeId !== employeeProfile.id) {
            throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
        }

        return booking;
    }

    throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
};

const cancelBooking = async (bookingId: string, userId: string) => {
    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: bookingIncludeConfig
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (booking.userId !== userId) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from cancelling this booking");
    }

    if (
        booking.bookingStatus === BookingStatus.COMPLETED ||
        booking.bookingStatus === BookingStatus.CANCELLED
    ) {
        throw new AppError(status.BAD_REQUEST, "This booking cannot be cancelled");
    }

    if (new Date() >= booking.startTime) {
        throw new AppError(status.BAD_REQUEST, "Booking can only be cancelled before service start time");
    }

    const cancelledBooking = await prisma.booking.update({
        where: {
            id: booking.id
        },
        data: {
            bookingStatus: BookingStatus.CANCELLED
        },
        include: bookingIncludeConfig
    });

    return cancelledBooking;
};

const updateBookingStatusByVendor = async (
    vendorUserId: string,
    bookingId: string,
    payload: TUpdateBookingStatusByVendorPayload
) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: bookingIncludeConfig
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (booking.vendorId !== vendorProfile.id) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from updating this booking");
    }

    const targetStatus = payload.bookingStatus;
    const currentStatus = booking.bookingStatus;

    if (targetStatus === currentStatus) {
        throw new AppError(status.BAD_REQUEST, "Booking is already in the requested status");
    }

    const allowedNextStatuses = VENDOR_BOOKING_STATUS_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(targetStatus)) {
        throw new AppError(
            status.BAD_REQUEST,
            `Invalid status transition from ${currentStatus} to ${targetStatus}`
        );
    }

    const now = new Date();

    if (targetStatus === BookingStatus.IN_PROGRESS && now < booking.startTime) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot start before service start time");
    }

    if (
        targetStatus === BookingStatus.COMPLETED &&
        booking.paymentStatus !== PaymentStatus.SUCCESSFUL
    ) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot be completed before payment is successful");
    }

    if (targetStatus === BookingStatus.COMPLETED && now < booking.endTime) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot be completed before service end time");
    }

    const updatedBooking = await prisma.booking.update({
        where: {
            id: booking.id
        },
        data: {
            bookingStatus: targetStatus
        },
        include: bookingIncludeConfig
    });

    return updatedBooking;
};

const updateBookingStatusByEmployee = async (
    employeeUserId: string,
    bookingId: string,
    payload: TUpdateBookingStatusByEmployeePayload
) => {
    const employeeProfile = await prisma.employeeProfile.findUnique({
        where: {
            userId: employeeUserId
        }
    });

    if (!employeeProfile || employeeProfile.isDeleted) {
        throw new AppError(status.NOT_FOUND, "Employee profile not found");
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId
        },
        include: bookingIncludeConfig
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    if (booking.employeeId !== employeeProfile.id) {
        throw new AppError(status.FORBIDDEN, "You are forbidden from updating this booking");
    }

    const targetStatus = payload.bookingStatus;
    const currentStatus = booking.bookingStatus;

    if (targetStatus === currentStatus) {
        throw new AppError(status.BAD_REQUEST, "Booking is already in the requested status");
    }

    const allowedNextStatuses = EMPLOYEE_BOOKING_STATUS_TRANSITIONS[currentStatus];

    if (!allowedNextStatuses.includes(targetStatus)) {
        throw new AppError(
            status.BAD_REQUEST,
            `Invalid status transition from ${currentStatus} to ${targetStatus}`
        );
    }

    const now = new Date();

    if (targetStatus === BookingStatus.IN_PROGRESS && now < booking.startTime) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot start before service start time");
    }

    if (
        targetStatus === BookingStatus.COMPLETED &&
        booking.paymentStatus !== PaymentStatus.SUCCESSFUL
    ) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot be completed before payment is successful");
    }

    if (targetStatus === BookingStatus.COMPLETED && now < booking.endTime) {
        throw new AppError(status.BAD_REQUEST, "Booking cannot be completed before service end time");
    }

    const updatedBooking = await prisma.booking.update({
        where: {
            id: booking.id
        },
        data: {
            bookingStatus: targetStatus
        },
        include: bookingIncludeConfig
    });

    return updatedBooking;
};

export const BookingServices = {
    createBooking,
    getMyBookings,
    getBookingDetails,
    cancelBooking,
    updateBookingStatusByVendor,
    updateBookingStatusByEmployee
};
