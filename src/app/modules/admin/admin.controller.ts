import { Request, Response } from "express";
import status from "http-status";
import { BookingStatus, PaymentStatus, Role } from "../../../../prisma/generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { parseQueryOptions } from "../../utils/queryHelpers";
import { AdminServices } from "./admin.service";
import { TUpdateUserStatusPayload, TUpdateVendorApprovalPayload } from "./admin.validation";

const getEnumQueryValue = <T extends string>(value: unknown, enumValues: readonly T[]) => {
    if (typeof value !== "string") {
        return undefined;
    }

    return enumValues.includes(value as T) ? (value as T) : undefined;
};

const getDashboardSummary = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getDashboardSummary();

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: result
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["name", "email", "createdAt", "updatedAt"]
    });

    const searchTerm = typeof req.query.searchTerm === "string"
        ? req.query.searchTerm.trim()
        : undefined;
    const role = getEnumQueryValue(
        req.query.role,
        Object.values(Role) as Role[]
    );
    const isActive = typeof req.query.isActive === "string"
        ? req.query.isActive === "true"
            ? true
            : req.query.isActive === "false"
                ? false
                : undefined
        : undefined;

    const result = await AdminServices.getAllUsers(queryOptions, {
        searchTerm: searchTerm || undefined,
        role,
        isActive
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "startTime", "endTime", "bookingStatus", "paymentStatus", "totalPrice"]
    });

    const bookingStatus = getEnumQueryValue(
        req.query.bookingStatus,
        Object.values(BookingStatus) as BookingStatus[]
    );

    const paymentStatus = getEnumQueryValue(
        req.query.paymentStatus,
        Object.values(PaymentStatus) as PaymentStatus[]
    );

    const result = await AdminServices.getAllBookings(queryOptions, {
        bookingStatus,
        paymentStatus
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "status", "amount", "paidAt"]
    });

    const paymentStatus = getEnumQueryValue(
        req.query.status,
        Object.values(PaymentStatus) as PaymentStatus[]
    );

    const result = await AdminServices.getAllPayments(queryOptions, {
        status: paymentStatus
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getPaymentDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Payment retrieved successfully",
        data: result
    });
});

const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getBookingDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Booking retrieved successfully",
        data: result
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getSingleUser(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User retrieved successfully",
        data: result
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.updateUserStatus(
        req.params.id as string,
        req.body as TUpdateUserStatusPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    });
});

const updateVendorApproval = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.updateVendorApproval(
        req.params.id as string,
        req.body as TUpdateVendorApprovalPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor approval status updated successfully",
        data: result
    });
});

export const AdminControllers = {
    getDashboardSummary,
    getAllUsers,
    getAllBookings,
    getAllPayments,
    getPaymentDetails,
    getBookingDetails,
    getSingleUser,
    updateUserStatus,
    updateVendorApproval
};
