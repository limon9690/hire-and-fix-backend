import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { EmployeeRoutes } from "../modules/employee/employee.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { ServiceCategoryRoutes } from "../modules/serviceCategory/serviceCategory.routes";
import { VendorRoutes } from "../modules/vendor/vendor.routes";

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/bookings', BookingRoutes);
router.use('/employees', EmployeeRoutes);
router.use('/reviews', ReviewRoutes);
router.use('/service-categories', ServiceCategoryRoutes);
router.use('/vendors', VendorRoutes);

export const AppRoutes = router;
