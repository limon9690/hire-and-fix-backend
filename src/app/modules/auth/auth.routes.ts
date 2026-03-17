import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidationSchemas } from "./auth.validation";

const router = Router();

router.post("/register-user", validateRequest(authValidationSchemas.registerUserSchema), AuthController.registerUser);

router.post("/register-vendor", validateRequest(authValidationSchemas.registerVendorSchema), AuthController.registerVendor);

export const AuthRoutes = router;