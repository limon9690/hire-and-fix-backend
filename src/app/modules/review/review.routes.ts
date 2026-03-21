import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewControllers } from "./review.controller";
import { reviewValidationSchemas } from "./review.validation";

const router = Router();

router.get(
    "/employee/:employeeId",
    ReviewControllers.getReviewsByEmployee
);

router.post(
    "/",
    auth(Role.USER),
    validateRequest(reviewValidationSchemas.createReviewSchema),
    ReviewControllers.createReview
);

router.patch(
    "/:id",
    auth(Role.USER),
    validateRequest(reviewValidationSchemas.updateReviewSchema),
    ReviewControllers.updateReview
);

export const ReviewRoutes = router;
