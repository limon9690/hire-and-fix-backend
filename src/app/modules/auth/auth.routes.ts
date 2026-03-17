import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidationSchemas } from "./auth.validation";

const router = Router();

router.post("/register-user", validateRequest(authValidationSchemas.registerUserSchema), AuthController.registerUser);

export const AuthRoutes = router;