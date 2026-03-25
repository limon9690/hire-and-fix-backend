import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { parseQueryOptions } from "../../utils/queryHelpers";
import { sendResponse } from "../../utils/sendResponse";
import { EmployeeServices } from "./employee.service";
import { TUpdateEmployeePayload, TUpdateMyProfilePayload } from "./employee.validation";

const getAllEmployees = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "hourlyRate", "experienceYears", "isActive"]
    });

    const searchTerm = typeof req.query.searchTerm === "string"
        ? req.query.searchTerm.trim()
        : undefined;
    const serviceCategoryId = typeof req.query.serviceCategoryId === "string"
        ? req.query.serviceCategoryId
        : undefined;

    const result = await EmployeeServices.getAllEmployees(queryOptions, {
        searchTerm: searchTerm || undefined,
        serviceCategoryId
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employees retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getEmployeeDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.getEmployeeDetails(req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee retrieved successfully",
        data: result
    });
});

const getMyEmployees = catchAsync(async (req: Request, res: Response) => {
    const queryOptions = parseQueryOptions(req.query as Record<string, unknown>, {
        defaultLimit: 10,
        maxLimit: 100,
        defaultSortBy: "createdAt",
        allowedSortFields: ["createdAt", "updatedAt", "hourlyRate", "experienceYears", "isActive"]
    });

    const searchTerm = typeof req.query.searchTerm === "string"
        ? req.query.searchTerm.trim()
        : undefined;
    const serviceCategoryId = typeof req.query.serviceCategoryId === "string"
        ? req.query.serviceCategoryId
        : undefined;
    const isActive = typeof req.query.isActive === "string"
        ? req.query.isActive === "true"
            ? true
            : req.query.isActive === "false"
                ? false
                : undefined
        : undefined;

    const result = await EmployeeServices.getMyEmployees(req.user.userId, queryOptions, {
        searchTerm: searchTerm || undefined,
        serviceCategoryId,
        isActive
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Vendor employees retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const deleteMyEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.deleteMyEmployee(req.user.userId, req.params.id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee deleted successfully",
        data: result
    });
});

const updateMyEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.updateMyEmployee(
        req.user.userId,
        req.params.id as string,
        req.body as TUpdateEmployeePayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Employee updated successfully",
        data: result
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await EmployeeServices.updateMyProfile(
        req.user.userId,
        req.body as TUpdateMyProfilePayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    });
});

export const EmployeeControllers = {
    getAllEmployees,
    getEmployeeDetails,
    getMyEmployees,
    deleteMyEmployee,
    updateMyEmployee,
    updateMyProfile
};
