import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.number().min(1, "Min 1"),
  price: z.number().min(0, "Min 0"),
  taxRate: z.number().min(0).max(100),
});

export const invoiceInputSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  date: z.string().min(1, "Required"),
  dueDate: z.string().min(1, "Required"),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  status: z.enum(["paid", "unpaid"]),
});

export const computeTotals = (items: Array<{ quantity?: number; price?: number; taxRate?: number }>) => {
  const subtotal = items.reduce((s, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    return s + (qty * price);
  }, 0);
  
  const taxTotal = items.reduce((s, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    const taxRate = Number(it.taxRate) || 0;
    return s + ((qty * price * taxRate) / 100);
  }, 0);
  
  const grandTotal = subtotal + taxTotal;
  return { subtotal, taxTotal, grandTotal };
};


