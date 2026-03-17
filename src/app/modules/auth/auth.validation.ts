import z from "zod";

const registerUserSchema = z.object({
    name: z
        .string({
            error: "Full name is required"
        })
        .trim()
        .min(1, "Full name is required"),
    email: z
        .string({
            error: "Email is required"
        })
        .trim()
        .min(1, "Email is required")
        .email("Email must be valid"),
    password: z
        .string({
            error: "Password is required"
        })
        .min(1, "Password is required")
        .min(8, "Password must meet minimum length 8")
});


export type TUserRegisterPayload = z.infer<typeof registerUserSchema>;

export const authValidationSchemas = {
    registerUserSchema,
}
