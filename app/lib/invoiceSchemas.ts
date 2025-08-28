import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number({ coerce: true }).min(1, "Min 1"),
  price: z.number({ coerce: true }).min(0, "Min 0"),
  taxRate: z.number({ coerce: true }).min(0).max(100).default(0),
});

export const invoiceInputSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  date: z.string().min(1, "Required"),
  dueDate: z.string().min(1, "Required"),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  status: z.enum(["paid", "unpaid"]).default("unpaid"),
});

export const computeTotals = (items: z.infer<typeof invoiceItemSchema>[]) => {
  const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
  const taxTotal = items.reduce((s, it) => s + (it.quantity * it.price * (it.taxRate || 0)) / 100, 0);
  const grandTotal = subtotal + taxTotal;
  return { subtotal, taxTotal, grandTotal };
};


