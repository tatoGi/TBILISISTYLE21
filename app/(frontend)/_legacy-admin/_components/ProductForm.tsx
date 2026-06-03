"use client";

import { useState } from "react";
import type { Product, ProductSize, ProductStatus } from "@/lib/products";
import { createProduct, deleteProduct, updateProduct } from "../actions";

const statuses: { value: ProductStatus; label: string; tone: string }[] = [
  { value: "draft", label: "Draft", tone: "bg-slate-100 text-slate-700" },
  { value: "active", label: "Active", tone: "bg-emerald-100 text-emerald-700" },
  { value: "sold_out", label: "Sold out", tone: "bg-rose-100 text-rose-700" },
];

const DEFAULT_SIZES: ProductSize[] = [
  { size: "S", quantity: 0 },
  { size: "M", quantity: 0 },
  { size: "L", quantity: 0 },
  { size: "XL", quantity: 0 },
];

export function ProductForm({ product }: { product?: Product }) {
  const action = product ? updateProduct : createProduct;
  const isEdit = !!product;

  const [sizes, setSizes] = useState<ProductSize[]>(
    product?.sizes?.length ? product.sizes : DEFAULT_SIZES
  );

  function updateSize(index: number, patch: Partial<ProductSize>) {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function addSize() {
    setSizes((prev) => [...prev, { size: "", quantity: 0 }]);
  }

  function removeSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  // Only persist rows that have a non-empty size label.
  const sizesPayload = JSON.stringify(
    sizes
      .map((s) => ({ size: s.size.trim().toUpperCase(), quantity: s.quantity }))
      .filter((s) => s.size)
  );

  return (
    <form
      action={action}
      className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="sizes" value={sizesPayload} />

      <div className="grid gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {isEdit ? "Edit product" : "Basic details"}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Title"
          name="title"
          defaultValue={product?.title}
          placeholder="e.g. Festival T-Shirt"
          required
        />
        <Field
          label="Price (GEL)"
          name="priceGel"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.priceGel ?? 0}
          required
        />
        <Field
          label="Category"
          name="category"
          defaultValue={product?.category}
          placeholder="e.g. Apparel, Accessory"
        />
        <Field
          label="Image URL"
          name="imageUrl"
          type="url"
          defaultValue={product?.imageUrl}
          placeholder="https://… or /images/shirt.jpeg"
        />
      </div>

      {/* VIP badge */}
      <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
        <input
          type="checkbox"
          name="isVip"
          defaultChecked={product?.isVip}
          className="h-4 w-4 accent-amber-500"
        />
        <span className="text-sm font-bold text-amber-700">
          VIP product (premium badge)
        </span>
      </label>

      {/* Sizes + per-size stock */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sizes &amp; stock <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={addSize}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <PlusIcon />
            Add size
          </button>
        </div>

        <div className="grid gap-2">
          {sizes.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={row.size}
                onChange={(e) => updateSize(index, { size: e.target.value })}
                placeholder="Size (S, M, L…)"
                className="h-10 w-32 rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
              <input
                type="number"
                min={0}
                value={row.quantity}
                onChange={(e) =>
                  updateSize(index, {
                    quantity: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  })
                }
                placeholder="Qty"
                className="h-10 w-28 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
              <span className="text-xs text-slate-400">in stock</span>
              <button
                type="button"
                onClick={() => removeSize(index)}
                aria-label="Remove size"
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {sizes.length === 0 ? (
            <p className="text-sm text-slate-500">
              Add at least one size with its stock quantity.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <label key={s.value} className="cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s.value}
                defaultChecked={(product?.status ?? "draft") === s.value}
                className="peer sr-only"
              />
              <span
                className={`inline-flex items-center rounded-full border-2 border-transparent px-3 py-1.5 text-xs font-semibold ${s.tone} peer-checked:border-current peer-checked:shadow-sm`}
              >
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={product?.description}
          rows={4}
          placeholder="Material, fit, what's included…"
          className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          {isEdit ? (
            <>
              <PencilIcon />
              Save changes
            </>
          ) : (
            <>
              <PlusIcon />
              Add product
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      <input
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <form action={deleteProduct}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 shadow-sm transition hover:border-rose-400 hover:bg-rose-50"
      >
        <TrashIcon />
        Delete
      </button>
    </form>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
