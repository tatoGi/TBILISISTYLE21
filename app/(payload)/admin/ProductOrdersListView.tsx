import type { AdminViewServerProps } from "payload";
import { listProductOrders } from "@/lib/product-orders";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "buyer", label: "Buyer" },
  { key: "email", label: "Email" },
  { key: "product", label: "Product" },
  { key: "paidAt", label: "Paid at" },
  { key: "amount", label: "Amount", align: "right" },
  { key: "status", label: "Status" },
];

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB");
}

function statusFor(value: string): NonNullable<ListRow["status"]> {
  if (value === "paid") return { label: "Paid", tone: "success" };
  if (value === "collected") return { label: "Collected", tone: "info" };
  if (value === "failed") return { label: "Failed", tone: "danger" };
  if (value === "pending") return { label: "Pending", tone: "warning" };
  return { label: value || "Unknown", tone: "slate" };
}

export default async function ProductOrdersListView(props: AdminViewServerProps) {
  const orders = await listProductOrders();
  const rows: ListRow[] = orders.map((order) => {
    const status = statusFor(order.status);

    return {
      id: order.id,
      cells: {
        amount: `${order.amount.toLocaleString("en-US")} GEL`,
        buyer: order.name || "-",
        email: order.email || "-",
        paidAt: formatDate(order.paidAt ?? order.createdAt),
        product: `${order.productTitle}${order.size ? ` (${order.size})` : ""}`,
        status: status.label,
      },
      status,
    };
  });

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Product Orders" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Orders"
        title="Product Orders"
        description="Merch order list with List.js style filtering and sorting."
      />
      <ListJsTable
        columns={columns}
        editHrefBase="/admin/collections/productOrders"
        emptyTitle="No product orders yet"
        rows={rows}
        title="Product orders"
      />
      </div>
    </AdminShell>
  );
}
