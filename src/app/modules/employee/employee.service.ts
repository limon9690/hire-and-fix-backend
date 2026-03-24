import status from "http-status";
import { BookingStatus } from "../../../../prisma/generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta, TQueryOptions } from "../../utils/queryHelpers";
import { TUpdateEmployeePayload, TUpdateMyProfilePayload } from "./employee.validation";

const employeeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true
} as const;

const employeeVendorSelect = {
    id: true,
    vendorName: true,
    logo: true,
    phone: true,
    address: true,
    isApproved: true,
    isActive: true
} as const;

const employeeDetailsInclude = {
    user: {
        select: employeeUserSelect
    },
    vendor: {
        select: employeeVendorSelect
    },
    serviceCategory: true
} as const;

type TEmployeeListFilters = {
    searchTerm?: string;
    serviceCategoryId?: string;
};

const getAllEmployees = async (
    queryOptions: TQueryOptions,
    filters: TEmployeeListFilters = {}
) => {
    const whereClause = {
        isDeleted: false,
        isActive: true,
        ...(filters.serviceCategoryId ? { serviceCategoryId: filters.serviceCategoryId } : {}),
        ...(filters.searchTerm
            ? {
                OR: [
                    {
                        user: {
                            name: {
                                contains: filters.searchTerm,
                                mode: "insensitive" as const
                            }
                        }
                    },
                    {
                        serviceCategory: {
                            name: {
                                contains: filters.searchTerm,
                                mode: "insensitive" as const
                            }
                        }
                    },
                    {
                        bio: {
                            contains: filters.searchTerm,
                            mode: "insensitive" as const
                        }
                    }
                ]
            }
            : {})
    };

    const [employees, total] = await Promise.all([
        prisma.employeeProfile.findMany({
            where: whereClause,
            include: employeeDetailsInclude,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.employeeProfile.count({
            where: whereClause
        })
    ]);

    return {
        data: employees,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getEmployeeDetails = async (id: string) => {
    const employee = await prisma.employeeProfile.findFirst({
        where: {
            id,
            isDeleted: false
        },
        include: employeeDetailsInclude
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    return employee;
};

const getMyEmployees = async (vendorUserId: string, queryOptions: TQueryOptions) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    const whereClause = {
        vendorId: vendorProfile.id,
        isDeleted: false
    };

    const [employees, total] = await Promise.all([
        prisma.employeeProfile.findMany({
            where: whereClause,
            include: employeeDetailsInclude,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.employeeProfile.count({
            where: whereClause
        })
    ]);

    return {
        data: employees,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const deleteMyEmployee = async (vendorUserId: string, employeeId: string) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    const employee = await prisma.employeeProfile.findFirst({
        where: {
            id: employeeId,
            vendorId: vendorProfile.id
        }
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    if (employee.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Employee is already deleted");
    }

    const activeBooking = await prisma.booking.findFirst({
        where: {
            employeeId: employee.id,
            bookingStatus: {
                in: [
                    BookingStatus.PENDING,
                    BookingStatus.ACCEPTED,
                    BookingStatus.IN_PROGRESS
                ]
            }
        }
    });

    if (activeBooking) {
        throw new AppError(status.BAD_REQUEST, "Employee cannot be deleted while having active bookings");
    }

    const deletedEmployee = await prisma.employeeProfile.update({
        where: {
            id: employee.id
        },
        data: {
            isDeleted: true,
            isActive: false
        },
        include: employeeDetailsInclude
    });

    return deletedEmployee;
};

const updateMyEmployee = async (
    vendorUserId: string,
    employeeId: string,
    payload: TUpdateEmployeePayload
) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: {
            userId: vendorUserId
        }
    });

    if (!vendorProfile) {
        throw new AppError(status.NOT_FOUND, "Vendor profile not found");
    }

    const employee = await prisma.employeeProfile.findFirst({
        where: {
            id: employeeId,
            vendorId: vendorProfile.id
        },
        include: {
            user: true
        }
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    if (employee.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Deleted employee cannot be updated");
    }

    if (payload.email) {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: payload.email.toLowerCase()
            }
        });

        if (existingUser && existingUser.id !== employee.userId) {
            throw new AppError(status.CONFLICT, "Email already exists");
        }
    }

    if (payload.serviceCategoryId) {
        const serviceCategory = await prisma.serviceCategory.findUnique({
            where: {
                id: payload.serviceCategoryId
            }
        });

        if (!serviceCategory) {
            throw new AppError(status.NOT_FOUND, "Service category not found");
        }
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
        if (payload.name || payload.email) {
            await tx.user.update({
                where: {
                    id: employee.userId
                },
                data: {
                    ...(payload.name && { name: payload.name }),
                    ...(payload.email && { email: payload.email.toLowerCase() })
                }
            });
        }

        return tx.employeeProfile.update({
            where: {
                id: employee.id
            },
            data: {
                ...(payload.serviceCategoryId && { serviceCategoryId: payload.serviceCategoryId }),
                ...(payload.profilePhoto && { profilePhoto: payload.profilePhoto }),
                ...(payload.bio && { bio: payload.bio }),
                ...(payload.address && { address: payload.address }),
                ...(payload.phone && { phone: payload.phone }),
                ...(payload.hourlyRate !== undefined && { hourlyRate: payload.hourlyRate }),
                ...(payload.experienceYears !== undefined && { experienceYears: payload.experienceYears }),
                ...(payload.isActive !== undefined && { isActive: payload.isActive })
            },
            include: employeeDetailsInclude
        });
    });

    return updatedEmployee;
};

const updateMyProfile = async (
    employeeUserId: string,
    payload: TUpdateMyProfilePayload
) => {
    const employee = await prisma.employeeProfile.findUnique({
        where: {
            userId: employeeUserId
        },
        include: {
            user: true
        }
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee profile not found");
    }

    if (employee.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Deleted employee cannot be updated");
    }

    const updatedEmployee = await prisma.employeeProfile.update({
        where: {
            id: employee.id
        },
        data: {
            ...(payload.profilePhoto && { profilePhoto: payload.profilePhoto }),
            ...(payload.bio && { bio: payload.bio }),
            ...(payload.address && { address: payload.address }),
            ...(payload.phone && { phone: payload.phone })
        },
        include: employeeDetailsInclude
    });

    return updatedEmployee;
};

export const EmployeeServices = {
    getAllEmployees,
    getEmployeeDetails,
    getMyEmployees,
    deleteMyEmployee,
    updateMyEmployee,
    updateMyProfile
};
