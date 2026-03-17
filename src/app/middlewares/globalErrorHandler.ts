import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { IErrorResponse, IErrorSource } from "../interfaces/error.interface";
import { Prisma } from "../../../prisma/generated/prisma/client";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "../errorHelpers/prismaErrorHandler";
import status from "http-status";
import { zodErrorHandler } from "../errorHelpers/zodErrorHandler";
import AppError from "../errorHelpers/AppError";
import z from "zod";

export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') {
        console.error('Global Error Handler:', err);
    }

    let errorSources: IErrorSource[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';
    let stack: string | undefined = undefined;

     if(err instanceof Prisma.PrismaClientKnownRequestError){
        const simplifiedError = handlePrismaClientKnownRequestError(err);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;
    } else if(err instanceof Prisma.PrismaClientUnknownRequestError){
        const simplifiedError = handlePrismaClientUnknownError(err);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;
    } else if(err instanceof Prisma.PrismaClientValidationError){
        const simplifiedError = handlePrismaClientValidationError(err)
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        const simplifiedError = handlerPrismaClientRustPanicError();
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;
    } else if(err instanceof Prisma.PrismaClientInitializationError){
        const simplifiedError = handlerPrismaClientInitializationError(err);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;
    } else if (err instanceof z.ZodError) {
        const simplifiedError = zodErrorHandler(err);
        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack;

    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ]
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ]
    }


    const errorResponse: IErrorResponse = {
        statusCode,
        success: false,
        message: message,
        errorSources,
        stack: envVars.NODE_ENV === 'development' ? stack : undefined,
    }

    res.status(statusCode).json(errorResponse);
}
