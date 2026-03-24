import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { Role } from "../../../../prisma/generated/prisma/enums";

export type TJwtPayload = {
    userId: string;
    email: string;
    role: Role;
};

export const generateAccessToken = (payload: TJwtPayload) => {
    return jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: envVars.JWT_ACCESS_EXPIRES_IN
    } as SignOptions);
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, envVars.JWT_ACCESS_SECRET) as TJwtPayload;
};

export const setAuthCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none"
    });
};

export const clearAuthCookie = (res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: envVars.NODE_ENV === "production",
        sameSite: "none"
    });
};
