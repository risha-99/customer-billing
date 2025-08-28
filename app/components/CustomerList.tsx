"use client";

import { useEffect, useState } from "react";
import { customerRepository, type Customer } from "../lib/customerRepository";

export function CustomerList({ refreshKey }: { refreshKey?: number }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const load = async () => {
    const all = await customerRepository.getAll();
    setCustomers(all);
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  if (customers.length === 0) {
    return <p className="text-sm text-gray-600">No customers yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-md">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Email</th>
            <th className="p-2 border-b">Phone</th>
            <th className="p-2 border-b">Created</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2 border-b">{c.name}</td>
              <td className="p-2 border-b">{c.email || "—"}</td>
              <td className="p-2 border-b">{c.phone || "—"}</td>
              <td className="p-2 border-b">{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;


