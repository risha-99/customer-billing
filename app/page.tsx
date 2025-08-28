"use client";

import { useState } from "react";
import CustomerForm from "./components/CustomerForm";
import CustomerList from "./components/CustomerList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Create and manage customer profiles with billing and shipping information</p>
        </div>

        {/* Customer Form Card */}
        <CustomerForm onCreated={() => setRefreshKey((k) => k + 1)} />
        
        {/* Customer List Card */}
        <CustomerList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
