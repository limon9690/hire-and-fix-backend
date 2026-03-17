import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role } from "../../../prisma/generated/prisma/enums";
import AppError from "../errorHelpers/AppError";
import { verifyAccessToken } from "../modules/auth/auth.utils";

export const auth = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const bearerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : undefined;

        const token = req.cookies?.accessToken || bearerToken;

        if (!token) {
            throw new AppError(status.UNAUTHORIZED, "You are not authorized");
        }

        const decoded = verifyAccessToken(token);

        req.user = decoded;

        if (roles.length > 0 && !roles.includes(decoded.role)) {
            throw new AppError(status.FORBIDDEN, "You are forbidden from accessing this resource");
        }

        next();
    };
};
