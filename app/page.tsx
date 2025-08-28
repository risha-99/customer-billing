"use client";

import { useState } from "react";
import CustomerForm from "./components/CustomerForm";
import CustomerList from "./components/CustomerList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="min-h-screen p-8 sm:p-12 space-y-10">
      <CustomerForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <section className="space-y-3 m-auto w-[1200px]">
        <h3 className="text-lg font-semibold">Customers</h3>
        <CustomerList refreshKey={refreshKey} />
      </section>
    </div>
  );
}
