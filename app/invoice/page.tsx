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
    mode: "onChange",
  });

  const { control, register, watch, handleSubmit, formState: { errors, isSubmitting }, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    customerRepository.getAll().then(setCustomers);
  }, []);

  const watchedItems = watch("items");
  const totals = useMemo(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) return { subtotal: 0, taxTotal: 0, grandTotal: 0 };
    // Allow partial entries during typing - just filter out completely empty items
    const validItems = watchedItems.filter(item => 
      item && typeof item === 'object'
    );
    return computeTotals(validItems);
  }, [watchedItems]);

  const onSubmit = async (data: any) => {
    const { subtotal, taxTotal, grandTotal } = computeTotals(data.items);
    await invoiceRepository.add({ ...data, subtotal, taxTotal, grandTotal });
    const selectedCustomerId = data.customerId;
    reset();
    form.setValue("customerId", selectedCustomerId);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-2">Generate and manage customer invoices with itemized billing</p>
        </div>

        {/* Invoice Form Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Invoice Details Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Invoice Details
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Customer *</label>
                  <select className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" {...register("customerId")}>
                    <option value="">Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-red-600 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>{String(errors.customerId.message)}
                  </p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Invoice Date *</label>
                    <input type="date" className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" {...register("date")} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                    <input type="date" className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" {...register("dueDate")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  type="button" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                  onClick={() => append({ description: "", quantity: 1, price: 0, taxRate: 10 })}
                >
                  <span className="mr-2">+</span> Add Item
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Invoice Items
                </h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Item Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-32">Price ($)</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-28">Tax (%)</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-24">Qty</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 w-32">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fields.map((f, idx) => {
                        const row = watchedItems?.[idx] || { quantity: 0, price: 0, taxRate: 0 };
                        const rowSubtotal = (Number(row.quantity) || 0) * (Number(row.price) || 0);
                        const rowTax = rowSubtotal * (Number(row.taxRate) || 0) / 100;
                        const rowTotal = rowSubtotal + rowTax;
                        return (
                          <tr key={f.id} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <input 
                                className="w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Service or product name" 
                                {...register(`items.${idx}.description` as const)} 
                              />
                              {errors.items?.[idx]?.description && <p className="text-red-600 text-xs mt-1">Required</p>}
                            </td>
                            <td className="py-4 px-4">
                              <input 
                                type="number" 
                                step="0.01" 
                                className="w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="0.00"
                                {...register(`items.${idx}.price` as const, { valueAsNumber: true })} 
                              />
                            </td>
                            <td className="py-4 px-4">
                              <select className="w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register(`items.${idx}.taxRate` as const, { valueAsNumber: true })}>
                                {[0, 5, 10, 18, 25].map((t) => (
                                  <option key={t} value={t}>{t}%</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 px-4">
                              <input 
                                type="number" 
                                min="1"
                                className="w-full rounded-md border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })} 
                              />
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-900">${rowTotal.toFixed(2)}</td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                type="button" 
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors cursor-pointer" 
                                onClick={() => remove(idx)}
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Invoice Summary & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Totals Card */}
              <div className="lg:w-96">
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                    Invoice Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Total Tax:</span>
                      <span className="font-medium">${totals.taxTotal.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">${totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📋</span>
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Recent Invoices Card */}
        <InvoicesForCustomer key={refreshKey} customerId={watchCustomerId(form)} />
      </div>
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  useEffect(() => {
    customerRepository.getAll().then(setCustomers);
  }, []);
  
  useEffect(() => {
    if (!customerId) {
      setInvoices([]);
      return;
    }
    invoiceRepository.getByCustomer(customerId).then(setInvoices);
  }, [customerId]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  if (!customerId) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
          Recent Invoices
        </h3>
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <p className="text-gray-500 font-medium">No invoices yet</p>
            <p className="text-gray-400 text-sm">Create your first invoice above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm font-medium text-gray-900">
                        #{inv.id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getCustomerName(inv.customerId)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(inv.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">
                        ${Number(inv.grandTotal).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        inv.status === "paid" 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          inv.status === "paid" ? "bg-green-600" : "bg-yellow-600"
                        }`}></span>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


