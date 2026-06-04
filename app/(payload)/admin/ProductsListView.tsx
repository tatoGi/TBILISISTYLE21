import type { AdminViewServerProps } from "payload";
import { listProducts, totalStock } from "@/lib/products";
import { AdminShell, ListJsTable, PageHeader, type ListColumn, type ListRow } from "./_ui";

export const dynamic = "force-dynamic";

const columns: ListColumn[] = [
  { key: "title", label: "Product" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", align: "right" },
  { key: "stock", label: "Stock", align: "right" },
  { key: "flags", label: "Flags" },
  { key: "status", label: "Status" },
];

const statusTone: Record<string, ListRow["status"]> = {
  draft: { label: "Draft", tone: "slate" },
  active: { label: "Active", tone: "success" },
  sold_out: { label: "Sold out", tone: "danger" },
};

export default async function ProductsListView(props: AdminViewServerProps) {
  const products = await listProducts();
  const rows: ListRow[] = products.map((product) => ({
    id: product.id,
    cells: {
      category: product.category || "-",
      flags: product.isVip ? "VIP" : "",
      price: `${product.priceGel.toLocaleString("en-US")} GEL`,
      status: statusTone[product.status]?.label ?? product.status,
      stock: String(totalStock(product.sizes)),
      title: product.title,
    },
    flags: product.isVip ? [{ label: "VIP", tone: "warning" }] : [],
    status: statusTone[product.status] ?? { label: product.status, tone: "slate" },
  }));

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Products" }]}>
      <div className="ts21-admin-view">
      <PageHeader
        eyebrow="Shop"
        title="Products"
        description="List.js style add, edit and remove controls for merch catalog CRUD."
      />
      <ListJsTable
        addHref="/admin/collections/products/create"
        addLabel="Add product"
        columns={columns}
        deleteKind="product"
        editHrefBase="/admin/collections/products"
        emptyDescription="Add merch products and stock by size in the Payload editor."
        emptyTitle="No products yet"
        rows={rows}
        title="Products"
      />
      </div>
    </AdminShell>
  );
}
