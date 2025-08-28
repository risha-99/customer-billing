import { z } from "zod";
import { customerRepository } from "./customerRepository";

export const addressSchema = z.object({
  line1: z.string().min(1, "Required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  postalCode: z.string().min(3, "Invalid"),
  country: z.string().min(1, "Required"),
});

// Cross-field rule: if email exists, phone becomes optional and vice-versa
export const personalInfoSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email({ message: "Invalid email" }).optional().or(z.literal("")),
    phone: z
      .string()
      .regex(/^\+?[0-9 ()-]{7,}$/i, "Invalid phone number")
      .optional()
      .or(z.literal("")),
  })
  .refine((val) => Boolean(val.email) || Boolean(val.phone), {
    message: "Provide email or phone",
    path: ["email"],
  })
  .superRefine(async (val, ctx) => {
    if (val.email) {
      const existing = await customerRepository.findByEmail(val.email);
      if (existing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email already exists",
          path: ["email"],
        });
      }
    }
  });

export const addressInfoSchema = z.object({
  billingAddress: addressSchema,
  copyBillingToShipping: z.boolean(),
  shippingAddress: addressSchema,
});

export const customerFormInputSchema = z.object({
  personal: personalInfoSchema,
  addressInfo: addressInfoSchema,
});

export const customerFormSchema = customerFormInputSchema.transform((data) => {
    const shipping = data.addressInfo.copyBillingToShipping
      ? data.addressInfo.billingAddress
      : data.addressInfo.shippingAddress;
    return {
      name: data.personal.name,
      email: data.personal.email || undefined,
      phone: data.personal.phone || undefined,
      billingAddress: data.addressInfo.billingAddress,
      shippingAddress: shipping,
    };
  });

export type CustomerFormInput = z.infer<typeof customerFormInputSchema>;
export type CustomerFormOutput = z.output<typeof customerFormSchema>;


