import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingServices } from "./booking.service";
import { TCreateBookingPayload } from "./booking.validation";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const result = await BookingServices.createBooking(
        req.user.userId,
        req.body as TCreateBookingPayload
    );

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Booking created successfully",
        data: result
    });
});

export const BookingControllers = {
    createBooking
};
