import z from "zod";

const createBookingSchema = z.object({
    employeeId: z
        .string({
            error: "Employee is required"
        })
        .trim()
        .min(1, "Employee is required"),
    startTime: z.string({
        error: "Start time is required"
    }).datetime({
        offset: true,
        error: "Start time must be a valid ISO datetime with timezone offset"
    }),
    endTime: z.string({
        error: "End time is required"
    }).datetime({
        offset: true,
        error: "End time must be a valid ISO datetime with timezone offset"
    }),
    serviceAddress: z
        .string({
            error: "Service address is required"
        })
        .trim()
        .min(1, "Service address is required"),
    note: z
        .string()
        .trim()
        .optional()
}).superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (!(endTime > startTime)) {
        ctx.addIssue({
            code: "custom",
            path: ["endTime"],
            message: "End time must be after start time"
        });
    }
});

export type TCreateBookingPayload = z.infer<typeof createBookingSchema>;

export const bookingValidationSchemas = {
    createBookingSchema
};
