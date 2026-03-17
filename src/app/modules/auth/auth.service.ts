import bcrypt from "bcrypt";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TUserRegisterPayload } from "./auth.validation";



const registerUser = async (payload: TUserRegisterPayload) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email.toLowerCase()
        }
    });

    if (existingUser) {
        throw new AppError(status.CONFLICT, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email.toLowerCase(),
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
};

export const AuthServices = {
    registerUser
};
