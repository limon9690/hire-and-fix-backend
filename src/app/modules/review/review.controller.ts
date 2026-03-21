import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewServices } from "./review.service";
import { TCreateReviewPayload, TUpdateReviewPayload } from "./review.validation";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewServices.createReview(
        req.user.userId,
        req.body as TCreateReviewPayload
    );

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Review created successfully",
        data: result
    });
});

const getReviewsByEmployee = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewServices.getReviewsByEmployee(req.params.employeeId as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Reviews retrieved successfully",
        data: result
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewServices.updateReview(
        req.user.userId,
        req.params.id as string,
        req.body as TUpdateReviewPayload
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Review updated successfully",
        data: result
    });
});

export const ReviewControllers = {
    createReview,
    getReviewsByEmployee,
    updateReview
};
