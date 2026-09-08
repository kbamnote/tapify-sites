"use client";

/**
 * Catalogue panel — the shop's products, held in one place.
 *
 * Before this, a product lived inside whichever section displayed it. The same
 * dress on the home page and on its category page were two independent copies:
 * the owner changed the price in one, missed the other, and the site disagreed
 * with itself. Here each product exists ONCE (doc.catalog.products) and sections
 * point at it by id, so one edit reaches every page it appears on.
 *
 * The editor for a product is NOT written out here — it is generated from the
 * `products` manifest's `items` repeater, which is the exact shape a product
 * card renders from. Add a field to that manifest and it shows up here too.
 */

import { useMemo, useState } from "react";
import { useBuilder } from "./store";
import { Field } from "./fields";
import { mediaSrc } from "./client-api";
import type { FieldDef } from "./schema-types";
import type { CatalogProduct } from "@/lib/types";

/** Where each product is used, so nothing is deleted blind. */
function useUsage(): Map<string, { page: string; section: string }[]> {
  const doc = useBuilder((s) => s.doc);
  const manifests = useBuilder((s) => s.manifests);
  return useMemo(() => {
    const out = new Map<string, { page: string; section: string }[]>();
    for (const page of doc?.pages ?? []) {
      for (const s of page.sections) {
        const refs = s.props?.itemRefs;
        if (!Array.isArray(refs)) continue;
        for (const r of refs) {
          if (typeof r !== "string") continue;
          if (!out.has(r)) out.set(r, []);
          out.get(r)!.push({ page: page.title || page.slug, section: manifests[s.type]?.label ?? s.type });
        }
      }
    }
    return out;
  }, [doc, manifests]);
}

export default function CatalogPanel() {
  const doc = useBuilder((s) => s.doc);
  const manifests = useBuilder((s) => s.manifests);
  const addProduct = useBuilder((s) => s.addCatalogProduct);
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const usage = useUsage();

  /**
   * The product editor's fields, borrowed from the products manifest so the two
   * can never drift. `slug` is dropped: a catalogue product's detail-page
   * address is still derived per section, and exposing it here would suggest one
   * product can have several addresses.
   */
  const fields: FieldDef[] = useMemo(() => {
    const items = manifests["products"]?.props.find((p) => p.key === "items");
    return (items?.fields ?? []).filter((f) => f.key !== "slug");
  }, [manifests]);

  if (!doc) return null;
  const products = doc.catalog?.products ?? [];
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? products.filter((p) => String(p.title ?? "").toLowerCase().includes(needle))
    : products;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <p className="text-sm font-bold text-slate-900">Catalogue</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          Your products, stored once. Add a product here, then show it on any page from that
          section&rsquo;s <span className="font-semibold">Items</span> panel — change the price here and
          every page updates.
        </p>
      </div>

      {!fields.length && (
        <p className="m-3 rounded border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-800">
          The Products section manifest hasn&rsquo;t loaded, so there is nothing to build the product
          form from. Reload the editor.
        </p>
      )}

      {products.length > 6 && (
        <div className="shrink-0 border-b border-slate-200 px-3 py-2">
          <input
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-slate-900"
            placeholder={`Search ${products.length} products…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!products.length && (
          <p className="px-3 py-6 text-center text-[11px] leading-relaxed text-slate-400">
            No products yet.
            <br />
            Add your first one below.
          </p>
        )}

        {shown.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            fields={fields}
            usedIn={usage.get(p.id) ?? []}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
          />
        ))}

        {!!needle && !shown.length && (
          <p className="px-3 py-6 text-center text-[11px] text-slate-400">No product matches “{q}”.</p>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200 px-3 py-2.5">
        <button
          type="button"
          disabled={!fields.length}
          onClick={() => {
            const id = addProduct();
            if (id) {
              setQ("");
              setOpenId(id);
            }
          }}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-40"
        >
          + Add product
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- a row */

function ProductRow({
  product,
  fields,
  usedIn,
  open,
  onToggle,
}: {
  product: CatalogProduct;
  fields: FieldDef[];
  usedIn: { page: string; section: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  const setField = useBuilder((s) => s.setCatalogField);
  const remove = useBuilder((s) => s.removeCatalogProduct);
  const duplicate = useBuilder((s) => s.duplicateCatalogProduct);
  const move = useBuilder((s) => s.moveCatalogProduct);
  const [confirming, setConfirming] = useState(false);

  const img = typeof product.image === "string" ? product.image : undefined;
  const pages = Array.from(new Set(usedIn.map((u) => u.page)));

  return (
    <div className="border-b border-slate-200">
      <div className="flex items-center gap-2 px-3 py-2">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc(img)} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded bg-slate-100" />
        )}
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <p className="truncate text-[12px] font-semibold text-slate-800">
            {(product.title as string) || "Untitled product"}
          </p>
          <p className="truncate text-[10px] text-slate-500">
            {(product.price as string) || "No price"}
            {" · "}
            {usedIn.length ? `on ${pages.length} page${pages.length > 1 ? "s" : ""}` : "not shown anywhere yet"}
          </p>
        </button>
        <button type="button" onClick={() => move(product.id, -1)}
          className="px-1 text-[11px] text-slate-400 hover:text-slate-900" title="Move up">↑</button>
        <button type="button" onClick={() => move(product.id, 1)}
          className="px-1 text-[11px] text-slate-400 hover:text-slate-900" title="Move down">↓</button>
        <button type="button" onClick={onToggle}
          className={`px-1 text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}>+</button>
      </div>

      {open && (
        <div className="space-y-3 bg-slate-50 px-3 pb-4 pt-1">
          {fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              siblings={product as Record<string, unknown>}
              value={product[f.key]}
              onChange={(v) => setField(product.id, f.key, v)}
            />
          ))}

          <div className="rounded-md border border-slate-200 bg-white p-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Shown on</p>
            {usedIn.length ? (
              <ul className="mt-1 space-y-0.5">
                {usedIn.map((u, i) => (
                  <li key={i} className="text-[11px] text-slate-600">
                    {u.page} <span className="text-slate-400">· {u.section}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                Nowhere yet. Select a Products or Services section and add it there.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => duplicate(product.id)}
              className="text-[11px] font-semibold text-slate-600 hover:underline">Duplicate</button>

            {confirming ? (
              <>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="rounded bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white"
                >
                  {usedIn.length
                    ? `Delete and remove from ${usedIn.length} place${usedIn.length > 1 ? "s" : ""}`
                    : "Delete"}
                </button>
                <button type="button" onClick={() => setConfirming(false)}
                  className="text-[11px] text-slate-500 hover:underline">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirming(true)}
                className="ml-auto text-[11px] font-semibold text-rose-600 hover:underline">Delete</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
