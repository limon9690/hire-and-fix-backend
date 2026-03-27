import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { buildPaginationMeta, TQueryOptions } from "../../utils/queryHelpers";
import { TCreateServiceCategoryPayload, TUpdateServiceCategoryPayload } from "./serviceCategory.validation";

const createServiceCategory = async (payload: TCreateServiceCategoryPayload) => {
    const existingServiceCategory = await prisma.serviceCategory.findUnique({
        where: {
            name: payload.name
        }
    });

    if (existingServiceCategory) {
        throw new AppError(status.CONFLICT, "Service category already exists");
    }

    const serviceCategory = await prisma.serviceCategory.create({
        data: {
            name: payload.name,
            description: payload.description
        }
    });

    return serviceCategory;
};

const getAllServiceCategories = async (queryOptions: TQueryOptions, searchTerm?: string) => {
    const whereClause = searchTerm
        ? {
            OR: [
                {
                    name: {
                        contains: searchTerm,
                        mode: "insensitive" as const
                    }
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: "insensitive" as const
                    }
                }
            ]
        }
        : {};

    const [serviceCategories, total] = await Promise.all([
        prisma.serviceCategory.findMany({
            where: whereClause,
            skip: queryOptions.skip,
            take: queryOptions.limit,
            orderBy: {
                [queryOptions.sortBy]: queryOptions.sortOrder
            }
        }),
        prisma.serviceCategory.count({
            where: whereClause
        })
    ]);

    return {
        data: serviceCategories,
        meta: buildPaginationMeta(total, queryOptions.page, queryOptions.limit)
    };
};

const getServiceCategoryDetails = async (id: string) => {
    const serviceCategory = await prisma.serviceCategory.findUnique({
        where: {
            id
        }
    });

    if (!serviceCategory) {
        throw new AppError(status.NOT_FOUND, "Service category not found");
    }

    return serviceCategory;
};

const updateServiceCategory = async (id: string, payload: TUpdateServiceCategoryPayload) => {
    const existingServiceCategory = await prisma.serviceCategory.findUnique({
        where: {
            id
        }
    });

    if (!existingServiceCategory) {
        throw new AppError(status.NOT_FOUND, "Service category not found");
    }

    if (payload.name) {
        const duplicateServiceCategory = await prisma.serviceCategory.findUnique({
            where: {
                name: payload.name
            }
        });

        if (duplicateServiceCategory && duplicateServiceCategory.id !== id) {
            throw new AppError(status.CONFLICT, "Service category name already exists");
        }
    }

    const updatedServiceCategory = await prisma.serviceCategory.update({
        where: {
            id
        },
        data: {
            name: payload.name,
            description: payload.description
        }
    });

    return updatedServiceCategory;
};

const deleteServiceCategory = async (id: string) => {
    const existingServiceCategory = await prisma.serviceCategory.findUnique({
        where: {
            id
        }
    });

    if (!existingServiceCategory) {
        throw new AppError(status.NOT_FOUND, "Service category not found");
    }

    const deletedServiceCategory = await prisma.serviceCategory.delete({
        where: {
            id
        }
    });

    return deletedServiceCategory;
};

export const ServiceCategoryServices = {
    createServiceCategory,
    getAllServiceCategories,
    getServiceCategoryDetails,
    updateServiceCategory,
    deleteServiceCategory
};
