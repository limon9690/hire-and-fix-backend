import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { TLoginPayload, TUserRegisterPayload, TVendorRegisterPayload } from "./auth.validation";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { clearAuthCookie, setAuthCookie } from "./auth.utils";

const registerUser = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const result = await AuthServices.registerUser(payload as TUserRegisterPayload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const registerVendor = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const result = await AuthServices.registerVendor(payload as TVendorRegisterPayload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Vendor registered successfully",
        data: result,
    });
});

const login = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const result = await AuthServices.login(payload as TLoginPayload);

    setAuthCookie(res, result.accessToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: result.user,
    });
});

const logout = catchAsync(async (req : Request, res : Response) => {
    await AuthServices.logout();

    clearAuthCookie(res);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.getMe(req.user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

export const AuthController = {
    registerUser,
    registerVendor,
    login,
    logout,
    getMe
};
