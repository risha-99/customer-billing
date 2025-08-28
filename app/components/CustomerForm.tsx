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
    try {
      const output = await customerFormSchema.parseAsync(data);
      await customerRepository.add(output);
      methods.reset();
      setStep(0);
      onCreated?.();
    } catch (error) {
      console.error('Form validation error:', error);
      // The form validation errors will be handled by React Hook Form
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Customer</h2>
            
            {/* Steps */}
            <div className="flex items-center gap-4">
              {[
                { id: 0, label: "Personal Information", icon: "👤" },
                { id: 1, label: "Address Details", icon: "📍" },
                { id: 2, label: "Review & Submit", icon: "✓" },
              ].map((s) => (
                <div key={s.id} className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  step === s.id 
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                    : step > s.id
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                }`}>
                  <span className="mr-2">{s.icon}</span>
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {step === 0 && (
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Personal Information
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Enter customer's full name"
                    {...register("personal.name")} 
                  />
                  {errors?.personal?.name && <p className="text-red-600 text-sm flex items-center mt-1">
                    <span className="mr-1">⚠️</span>{String(errors.personal.name.message)}
                  </p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      type="email" 
                      placeholder="customer@example.com"
                      {...register("personal.email")} 
                    />
                    {errors?.personal?.email && <p className="text-red-600 text-sm flex items-center mt-1">
                      <span className="mr-1">⚠️</span>{String(errors.personal.email.message)}
                    </p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input 
                      className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder="+1 (555) 123-4567" 
                      {...register("personal.phone")} 
                    />
                    {errors?.personal?.phone && <p className="text-red-600 text-sm flex items-center mt-1">
                      <span className="mr-1">⚠️</span>{String(errors.personal.phone.message)}
                    </p>}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 flex items-center">
                    <span className="mr-2">💡</span>
                    Provide either email or phone number. Email addresses are checked for duplicates automatically.
                  </p>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Address Information
              </h3>
              
              {/* Billing Address */}
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏢</span>
                  Billing Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Address Line 1" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.line1")} 
                  />
                  <input 
                    placeholder="Address Line 2 (Optional)" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.line2")} 
                  />
                  <input 
                    placeholder="City" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.city")} 
                  />
                  <input 
                    placeholder="State/Province" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.state")} 
                  />
                  <input 
                    placeholder="Postal/Zip Code" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.postalCode")} 
                  />
                  <input 
                    placeholder="Country" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.billingAddress.country")} 
                  />
                </div>
              </div>

              {/* Copy Address Toggle */}
              <div className="flex items-center">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    {...register("addressInfo.copyBillingToShipping", { value: false })} 
                  />
                  <span className="text-sm font-medium text-gray-700">Use billing address for shipping</span>
                </label>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📦</span>
                  Shipping Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Address Line 1" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.line1")} 
                  />
                  <input 
                    placeholder="Address Line 2 (Optional)" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.line2")} 
                  />
                  <input 
                    placeholder="City" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.city")} 
                  />
                  <input 
                    placeholder="State/Province" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.state")} 
                  />
                  <input 
                    placeholder="Postal/Zip Code" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.postalCode")} 
                  />
                  <input 
                    placeholder="Country" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    {...register("addressInfo.shippingAddress.country")} 
                  />
                </div>
              </div>
              {errors?.addressInfo && <p className="text-red-600 text-sm flex items-center">
                <span className="mr-1">⚠️</span>Please complete address details
              </p>}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Review & Submit
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 border">
                <p className="text-sm text-gray-600 mb-4 flex items-center">
                  <span className="mr-2">👀</span>
                  Please review all information before creating the customer profile.
                </p>
                <div className="bg-white rounded-lg p-4 border">
                  <pre className="text-xs text-gray-700 overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(methods.getValues(), null, 2)}
                  </pre>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={prev} 
              disabled={step === 0} 
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span className="mr-2">←</span>
              Back
            </button>
            {step < 2 ? (
              <button 
                type="button" 
                onClick={next} 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Next
                <span className="ml-2">→</span>
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✓</span>
                    Create Customer
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default CustomerForm;


