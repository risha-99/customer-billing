"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRepository, type Customer } from "../lib/customerRepository";
import { invoiceRepository } from "../lib/invoiceRepository";
import { invoiceInputSchema, computeTotals } from "../lib/invoiceSchemas";

type InvoiceInput = ReturnType<typeof invoiceInputSchema._type>;

export default function InvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const form = useForm<any>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: {
      customerId: "",
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      status: "unpaid",
      items: [{ description: "", quantity: 1, price: 0, taxRate: 10 }],
    },
    mode: "onBlur",
  });

  const { control, register, watch, handleSubmit, formState: { errors, isSubmitting }, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    customerRepository.getAll().then(setCustomers);
  }, []);

  const items = watch("items") as any[];
  const totals = useMemo(() => computeTotals(items || []), [items]);

  const onSubmit = async (data: any) => {
    const { subtotal, taxTotal, grandTotal } = computeTotals(data.items);
    await invoiceRepository.add({ ...data, subtotal, taxTotal, grandTotal });
    reset();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen p-8 sm:p-12 mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-semibold">Create New Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Customer *</label>
            <select className="mt-1 w-full rounded-md border px-3 py-2" {...register("customerId")}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-red-600 text-sm">{String(errors.customerId.message)}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Invoice Date *</label>
            <input type="date" className="mt-1 w-full rounded-md border px-3 py-2" {...register("date")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Due Date *</label>
            <input type="date" className="mt-1 w-full rounded-md border px-3 py-2" {...register("dueDate")} />
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Items</h3>
            <button type="button" className="rounded-md bg-blue-600 text-white px-3 py-1" onClick={() => append({ description: "", quantity: 1, price: 0, taxRate: 10 })}>+ Add Item</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-md">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-2 border-b">Item Name *</th>
                  <th className="p-2 border-b">Price *</th>
                  <th className="p-2 border-b">Tax Rate (%) *</th>
                  <th className="p-2 border-b">Qty *</th>
                  <th className="p-2 border-b">Total</th>
                  <th className="p-2 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, idx) => {
                  const row = items?.[idx] || { quantity: 0, price: 0, taxRate: 0 };
                  const rowSubtotal = (row.quantity || 0) * (row.price || 0);
                  const rowTax = rowSubtotal * (row.taxRate || 0) / 100;
                  const rowTotal = rowSubtotal + rowTax;
                  return (
                    <tr key={f.id} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 border-b">
                        <input className="w-full rounded-md border px-2 py-1" placeholder="Service or product name" {...register(`items.${idx}.description` as const)} />
                        {errors.items?.[idx]?.description && <p className="text-red-600 text-xs">Required</p>}
                      </td>
                      <td className="p-2 border-b w-28">
                        <input type="number" step="0.01" className="w-full rounded-md border px-2 py-1" {...register(`items.${idx}.price` as const, { valueAsNumber: true })} />
                      </td>
                      <td className="p-2 border-b w-32">
                        <select className="w-full rounded-md border px-2 py-1" {...register(`items.${idx}.taxRate` as const, { valueAsNumber: true })}>
                          {[0, 5, 10, 18].map((t) => (
                            <option key={t} value={t}>{t}%</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 border-b w-20">
                        <input type="number" className="w-full rounded-md border px-2 py-1" {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })} />
                      </td>
                      <td className="p-2 border-b w-28">${rowTotal.toFixed(2)}</td>
                      <td className="p-2 border-b w-12 text-right">
                        <button type="button" className="text-red-600" onClick={() => remove(idx)}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-md border p-3">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Total Tax:</span><span>${totals.taxTotal.toFixed(2)}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold"><span>Grand Total:</span><span>${totals.grandTotal.toFixed(2)}</span></div>
          </div>
          <div className="flex items-end justify-end">
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 text-white px-4 py-2 disabled:opacity-50">Create Invoice</button>
          </div>
        </section>
      </form>

      <InvoicesForCustomer key={refreshKey} customerId={watchCustomerId(form)} />
    </div>
  );
}

function watchCustomerId(form: any): string | undefined {
  try {
    return form.watch("customerId");
  } catch {
    return undefined;
  }
}

function InvoicesForCustomer({ customerId }: { customerId?: string }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    if (!customerId) {
      setInvoices([]);
      return;
    }
    invoiceRepository.getByCustomer(customerId).then(setInvoices);
  }, [customerId]);

  if (!customerId) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Recent Invoices</h3>
      {invoices.length === 0 ? (
        <p className="text-sm text-gray-600">No invoices yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-md">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-2 border-b">Invoice #</th>
                <th className="p-2 border-b">Date</th>
                <th className="p-2 border-b">Total</th>
                <th className="p-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 border-b">{inv.id.slice(-7)}</td>
                  <td className="p-2 border-b">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="p-2 border-b">${Number(inv.grandTotal).toFixed(2)}</td>
                  <td className="p-2 border-b">
                    <span className={`text-xs px-2 py-1 rounded-full ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


