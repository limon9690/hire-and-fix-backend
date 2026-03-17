import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { AuthController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { authValidationSchemas } from "./auth.validation";

const router = Router();

router.post("/register-user", validateRequest(authValidationSchemas.registerUserSchema), AuthController.registerUser);

router.post("/register-vendor", validateRequest(authValidationSchemas.registerVendorSchema), AuthController.registerVendor);

router.post("/login", validateRequest(authValidationSchemas.loginSchema), AuthController.login);

router.post("/logout", auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN), AuthController.logout);

router.get("/me", auth(Role.USER, Role.VENDOR, Role.EMPLOYEE, Role.ADMIN), AuthController.getMe);

export const AuthRoutes = router;
