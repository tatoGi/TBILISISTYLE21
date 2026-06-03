import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listProductOrders } from "@/lib/product-orders";
import { AdminShell } from "../_components/AdminShell";

export const metadata: Metadata = {
  title: "Product Orders | Admin",
};

export const dynamic = "force-dynamic";

function formatDate(value?: string | Date) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusTone: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  collected: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
};

export default async function AdminProductOrdersPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  // Show paid + collected (real buyers); skip never-completed pending/failed.
  const orders = await listProductOrders({
    status: { in: ["paid", "collected"] },
  });

  const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <AdminShell title="Product Orders" eyebrow="Shop">
      <section className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Revenue" value={`${revenue} ₾`} />
          <Stat
            label="To collect"
            value={String(orders.filter((o) => o.status === "paid").length)}
          />
        </div>

        {orders.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {order.productTitle}
                    </td>
                    <td className="px-4 py-3 font-bold uppercase text-slate-700">
                      {order.size}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{order.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{order.email}</div>
                      <div>{order.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {order.amount} ₾
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          statusTone[order.status] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(order.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-slate-700">No product orders yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Paid merch purchases will appear here.
            </p>
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
