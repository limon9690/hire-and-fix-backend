import z from "zod";

const createReviewSchema = z.object({
    bookingId: z
        .string({
            error: "Booking is required"
        })
        .trim()
        .min(1, "Booking is required"),
    rating: z
        .number({
            error: "Rating is required"
        })
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5"),
    comment: z
        .string()
        .trim()
        .optional()
});

const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5")
        .optional(),
    comment: z
        .string()
        .trim()
        .optional()
}).refine(
    (data) => data.rating !== undefined || data.comment !== undefined,
    {
        message: "At least one field is required to update"
    }
);

export type TCreateReviewPayload = z.infer<typeof createReviewSchema>;
export type TUpdateReviewPayload = z.infer<typeof updateReviewSchema>;

export const reviewValidationSchemas = {
    createReviewSchema,
    updateReviewSchema
};
