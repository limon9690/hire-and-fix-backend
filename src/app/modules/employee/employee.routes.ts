import { Router } from "express";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { EmployeeControllers } from "./employee.controller";
import { employeeValidationSchemas } from "./employee.validation";

const router = Router();

router.get("/", EmployeeControllers.getAllEmployees);

router.patch(
    "/me",
    auth(Role.EMPLOYEE),
    validateRequest(employeeValidationSchemas.updateMyProfileSchema),
    EmployeeControllers.updateMyProfile
);

router.get("/my", auth(Role.VENDOR), EmployeeControllers.getMyEmployees);

router.patch(
    "/my/:id",
    auth(Role.VENDOR),
    validateRequest(employeeValidationSchemas.updateEmployeeSchema),
    EmployeeControllers.updateMyEmployee
);

router.delete("/my/:id", auth(Role.VENDOR), EmployeeControllers.deleteMyEmployee);

router.get("/:id", EmployeeControllers.getEmployeeDetails);

export const EmployeeRoutes = router;
