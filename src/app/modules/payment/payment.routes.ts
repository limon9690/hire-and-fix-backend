import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { PaymentControllers } from "./payment.controller";

const router = Router();

router.post(
    "/checkout-session/:bookingId",
    auth(Role.USER),
    PaymentControllers.createCheckoutSession
);

export const PaymentRoutes = router;
