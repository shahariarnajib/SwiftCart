"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, User, Phone, MapPin, ShoppingBag, Eye, Calendar } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  ordersCount: number;
  totalSpent: number;
  createdAt: string | Date;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string | Date;
  }>;
}

export function CustomersClient({ initialCustomers }: { initialCustomers: CustomerRecord[] }) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View customer purchase histories, telephone contacts, and lifetime value
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name, phone number, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">City / Area</th>
                <th className="px-6 py-3.5">Total Orders</th>
                <th className="px-6 py-3.5">Lifetime Spend</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Recent Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-600 font-bold">{c.phone}</td>

                    <td className="px-6 py-4 text-slate-600">
                      {c.city ? (
                        <span>
                          {c.city}
                          {c.area ? `, ${c.area}` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-800 text-[11px]">
                        {c.ordersCount} {c.ordersCount === 1 ? "order" : "orders"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-black text-slate-900">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    <td className="px-6 py-4 text-slate-400">{formatDate(c.createdAt)}</td>

                    <td className="px-6 py-4 text-right">
                      {c.recentOrders.length > 0 ? (
                        <Link
                          href={`/admin/orders?q=${c.recentOrders[0].orderNumber}`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold"
                        >
                          <span>{c.recentOrders[0].orderNumber}</span>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
