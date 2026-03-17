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

const registerVendorSchema = registerUserSchema.extend({
    vendorName: z
        .string({
            error: "Vendor name is required"
        })
        .trim()
        .min(1, "Vendor name is required"),
    logo: z
        .string()
        .trim()
        .url("Logo must be a valid URL")
        .optional(),
    phone: z
        .string({
            error: "Phone is required"
        })
        .trim()
        .min(1, "Phone is required")
        .max(20, "Phone must be at most 20 characters"),
    description: z
        .string({
            error: "Description is required"
        })
        .trim()
        .min(1, "Description is required"),
    address: z
        .string({
            error: "Address is required"
        })
        .trim()
        .min(1, "Address is required")
});

export type TUserRegisterPayload = z.infer<typeof registerUserSchema>;
export type TVendorRegisterPayload = z.infer<typeof registerVendorSchema>;

export const authValidationSchemas = {
    registerUserSchema,
    registerVendorSchema,
}
