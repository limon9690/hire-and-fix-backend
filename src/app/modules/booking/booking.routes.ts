import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { BookingControllers } from "./booking.controller";
import { bookingValidationSchemas } from "./booking.validation";

const router = Router();

router.post(
    "/",
    auth(Role.USER),
    validateRequest(bookingValidationSchemas.createBookingSchema),
    BookingControllers.createBooking
);

export const BookingRoutes = router;
