"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerFormSchema, customerFormInputSchema, type CustomerFormInput, personalInfoSchema, addressInfoSchema } from "../lib/schemas";
import { customerRepository } from "../lib/customerRepository";
import { z } from "zod";

type Step = 0 | 1 | 2;

const personalDefaults: z.infer<typeof personalInfoSchema> = {
  name: "",
  email: "",
  phone: "",
};

const addressDefaults: z.infer<typeof addressInfoSchema> = {
  billingAddress: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "" },
  copyBillingToShipping: false,
  shippingAddress: { line1: "", line2: "", city: "", state: "", postalCode: "", country: "" },
};

export function CustomerForm({ onCreated }: { onCreated?: () => void }) {
  const [step, setStep] = useState<Step>(0);

  const methods = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormInputSchema),
    defaultValues: {
      personal: personalDefaults,
      addressInfo: addressDefaults,
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = methods;

  const copyBillingToShipping = watch("addressInfo.copyBillingToShipping");

  useEffect(() => {
    if (copyBillingToShipping) {
      const billing = watch("addressInfo.billingAddress");
      setValue("addressInfo.shippingAddress", billing, { shouldValidate: false });
    }
  }, [copyBillingToShipping, setValue, watch]);

  const next = async () => {
    if (step === 0) {
      const ok = await trigger("personal");
      if (!ok) return;
    }
    if (step === 1) {
      const ok = await trigger("addressInfo");
      if (!ok) return;
    }
    setStep((s) => (Math.min(2, s + 1) as Step));
  };
 
  const prev = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const onSubmit = async (data: CustomerFormInput) => {
    const output = customerFormSchema.parse(data);
    await customerRepository.add(output);
    methods.reset();
    setStep(0);
    onCreated?.();
  };

  return (
    <div className="w-full max-w-3xl m-auto border border-gray-300 rounded-md p-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-xl font-semibold">Create New Customer</h2>

          {/* Steps */}
          <ol className="flex items-center gap-2 text-sm">
            {[
              { id: 0, label: "Personal" },
              { id: 1, label: "Addresses" },
              { id: 2, label: "Review" },
            ].map((s) => (
              <li key={s.id} className={`px-3 py-1 rounded-full border ${step === s.id ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"}`}>
                {s.label}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name *</label>
                <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("personal.name")} />
                {errors?.personal?.name && <p className="text-red-600 text-sm">{String(errors.personal.name.message)}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" type="email" {...register("personal.email")} />
                  {errors?.personal?.email && <p className="text-red-600 text-sm">{String(errors.personal.email.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="+1 555 123 4567" {...register("personal.phone")} />
                  {errors?.personal?.phone && <p className="text-red-600 text-sm">{String(errors.personal.phone.message)}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500">Provide either email or phone. Email is checked asynchronously for duplicates.</p>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="font-medium">Billing Address</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Line 1" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.line1")} />
                  <input placeholder="Line 2" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.line2")} />
                  <input placeholder="City" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.city")} />
                  <input placeholder="State" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.state")} />
                  <input placeholder="Postal Code" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.postalCode")} />
                  <input placeholder="Country" className="rounded-md border px-3 py-2" {...register("addressInfo.billingAddress.country")} />
                </div>
              </fieldset>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" {...register("addressInfo.copyBillingToShipping", { value: false })} />
                <span className="text-sm">Shipping same as billing</span>
              </label>
              <fieldset className="space-y-3">
                <legend className="font-medium">Shipping Address</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Line 1" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.line1")} />
                  <input placeholder="Line 2" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.line2")} />
                  <input placeholder="City" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.city")} />
                  <input placeholder="State" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.state")} />
                  <input placeholder="Postal Code" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.postalCode")} />
                  <input placeholder="Country" className="rounded-md border px-3 py-2" {...register("addressInfo.shippingAddress.country")} />
                </div>
              </fieldset>
              {errors?.addressInfo && <p className="text-red-600 text-sm">Please complete address details</p>}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <p className="text-sm text-gray-600">Review details and submit.</p>
              <pre className="bg-gray-50 border rounded-md p-3 text-xs overflow-auto">{JSON.stringify(methods.getValues(), null, 2)}</pre>
            </section>
          )}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={prev} disabled={step === 0} className="rounded-md border px-4 py-2 disabled:opacity-50">
              Back
            </button>
            {step < 2 ? (
              <button type="button" onClick={next} className="rounded-md bg-blue-600 text-white px-4 py-2">
                Next
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="rounded-md bg-green-600 text-white px-4 py-2 disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Create Customer"}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default CustomerForm;


