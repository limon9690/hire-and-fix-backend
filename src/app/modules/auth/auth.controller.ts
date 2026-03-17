import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { TUserRegisterPayload } from "./auth.validation";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

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

export const AuthController = {
    registerUser
};