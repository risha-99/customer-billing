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

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
          Customer Directory
        </h3>
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-500 font-medium">No customers yet</p>
            <p className="text-gray-400 text-sm">Create your first customer above to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">{c.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {c.email ? (
                        <span className="text-sm">{c.email}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No email</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {c.phone ? (
                        <span className="text-sm">{c.phone}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No phone</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2"></span>
                        Active
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

export default CustomerList;


