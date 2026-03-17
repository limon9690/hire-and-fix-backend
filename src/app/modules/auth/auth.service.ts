import bcrypt from "bcrypt";
import status from "http-status";
import { Role } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TCreateEmployeePayload, TLoginPayload, TUserRegisterPayload, TVendorRegisterPayload } from "./auth.validation";
import { envVars } from "../../config/env";
import { generateAccessToken } from "./auth.utils";


const registerUser = async (payload: TUserRegisterPayload) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email.toLowerCase()
        }
    });

    if (existingUser) {
        throw new AppError(status.CONFLICT, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);

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

const registerVendor = async (payload: TVendorRegisterPayload) => {
    const normalizedEmail = payload.email.toLowerCase();

    return prisma.$transaction(async (tx) => {
        const [existingUser, existingVendorProfile] = await Promise.all([
            tx.user.findUnique({
                where: {
                    email: normalizedEmail
                }
            }),
            tx.vendorProfile.findUnique({
                where: {
                    vendorName: payload.vendorName
                }
            })
        ]);

        if (existingUser) {
            throw new AppError(status.CONFLICT, "Email already exists");
        }

        if (existingVendorProfile) {
            throw new AppError(status.CONFLICT, "Vendor name already exists");
        }

        const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);

        const user = await tx.user.create({
            data: {
                name: payload.name,
                email: normalizedEmail,
                password: hashedPassword,
                role: Role.VENDOR
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

        const vendorProfile = await tx.vendorProfile.create({
            data: {
                userId: user.id,
                vendorName: payload.vendorName,
                logo: payload.logo,
                phone: payload.phone,
                description: payload.description,
                address: payload.address
            },
            select: {
                id: true,
                userId: true,
                vendorName: true,
                logo: true,
                phone: true,
                description: true,
                address: true,
                isApproved: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return {
            ...user,
            vendorProfile
        };
    });
};

const createEmployee = async (vendorUserId: string, payload: TCreateEmployeePayload) => {
    const normalizedEmail = payload.email.toLowerCase();

    return prisma.$transaction(async (tx) => {
        const [vendorProfile, existingUser, serviceCategory] = await Promise.all([
            tx.vendorProfile.findUnique({
                where: {
                    userId: vendorUserId
                }
            }),
            tx.user.findUnique({
                where: {
                    email: normalizedEmail
                }
            }),
            tx.serviceCategory.findUnique({
                where: {
                    id: payload.serviceCategoryId
                }
            })
        ]);

        if (!vendorProfile) {
            throw new AppError(status.NOT_FOUND, "Vendor profile not found");
        }

        if (existingUser) {
            throw new AppError(status.CONFLICT, "Email already exists");
        }

        if (!serviceCategory) {
            throw new AppError(status.NOT_FOUND, "Service category not found");
        }

        const hashedPassword = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS);

        const user = await tx.user.create({
            data: {
                name: payload.name,
                email: normalizedEmail,
                password: hashedPassword,
                role: Role.EMPLOYEE
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

        const employeeProfile = await tx.employeeProfile.create({
            data: {
                userId: user.id,
                vendorId: vendorProfile.id,
                serviceCategoryId: payload.serviceCategoryId,
                profilePhoto: payload.profilePhoto,
                bio: payload.bio,
                address: payload.address,
                phone: payload.phone,
                hourlyRate: payload.hourlyRate,
                experienceYears: payload.experienceYears
            },
            include: {
                serviceCategory: true
            }
        });

        return {
            ...user,
            employeeProfile
        };
    });
};

const login = async (payload: TLoginPayload) => {
    const normalizedEmail = payload.email.toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        }
    });

    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }

    // check if the user is active or if it's a vendor, check if the vendor profile is approved and active or if it's an employee, check if the employee profile is active and not delted
    if (user.role === Role.USER) {
        const profile = await prisma.userProfile.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!profile || !profile.isActive) {
            throw new AppError(status.UNAUTHORIZED, "User account is inactive");
        }
    }


    if (user.role === Role.VENDOR) {
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!vendorProfile || !vendorProfile.isApproved) {
            throw new AppError(status.UNAUTHORIZED, "Vendor account is not approved yet");
        }

        if (!vendorProfile.isActive) {
            throw new AppError(status.UNAUTHORIZED, "Vendor account is inactive");
        }
    }

    if (user.role === Role.EMPLOYEE) {
        const employeeProfile = await prisma.employeeProfile.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!employeeProfile || employeeProfile.isDeleted) {
            throw new AppError(status.UNAUTHORIZED, "Employee account is deleted");
        }

        if (!employeeProfile.isActive) {
            throw new AppError(status.UNAUTHORIZED, "Employee account is inactive");
        }
    }

    const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordMatched) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
    });

    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    };
};

const logout = async () => {
    return null;
};

const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            profile: true,
            vendorProfile: true,
            employeeProfile: true
        }
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const baseUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
    };

    if (user.role === Role.USER) {
        return {
            ...baseUser,
            profile: user.profile
        };
    }

    if (user.role === Role.VENDOR) {
        return {
            ...baseUser,
            profile: user.vendorProfile
        };
    }

    if (user.role === Role.EMPLOYEE) {
        return {
            ...baseUser,
            profile: user.employeeProfile
        };
    }

    return {
        ...baseUser,
        profile: null
    };
};

export const AuthServices = {
    registerUser,
    registerVendor,
    createEmployee,
    login,
    logout,
    getMe
};
