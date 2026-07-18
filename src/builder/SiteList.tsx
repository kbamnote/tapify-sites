"use client";

/**
 * "My Websites" — the builder's home screen.
 *
 * Runs entirely in the browser because that is the only place the Tapify
 * session cookie exists (see client-api.ts). Signed-out users get a real login
 * link rather than an empty list, and creating a site here is what finally makes
 * /builder/<siteId> usable — until now only the demo fixture worked.
 */

import { useCallback, useEffect, useState } from "react";
import {
  listSites,
  createSite,
  slugify,
  isValidSlug,
  NotSignedInError,
  ApiError,
  LOGIN_URL,
  type SiteSummary,
} from "./client-api";
import type { IndustryRecipe } from "./schema-types";

type Status = "loading" | "ready" | "signed-out" | "error";

export default function SiteList({ industries }: { industries: IndustryRecipe[] }) {
  const [status, setStatus] = useState<Status>("loading");
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setSites(await listSites());
      setStatus("ready");
    } catch (e) {
      if (e instanceof NotSignedInError) return setStatus("signed-out");
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading") {
    return <Shell><p className="text-xs text-slate-500">Loading your websites…</p></Shell>;
  }

  if (status === "signed-out") {
    return (
      <Shell>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm font-semibold text-slate-900">Sign in to continue</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
            Use your existing Tapify account — the same email and password you already use.
          </p>
          <a
            href={LOGIN_URL}
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Sign in to Tapify
          </a>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 block w-full text-[11px] text-slate-500 hover:text-slate-900 hover:underline"
          >
            I&apos;ve signed in — retry
          </button>
        </div>
        <DemoLink />
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-semibold text-rose-800">Could not load your websites</p>
          <p className="mt-1 text-[11px] text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
        <DemoLink />
      </Shell>
    );
  }

  return (
    <Shell>
      {creating ? (
        <CreateForm
          industries={industries}
          onCancel={() => setCreating(false)}
          onCreated={(site) => {
            window.location.href = `/builder/${site.id}`;
          }}
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              My websites {sites.length ? `(${sites.length})` : ""}
            </h2>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700"
            >
              + New website
            </button>
          </div>

          {!sites.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No websites yet</p>
              <p className="mt-1 text-xs text-slate-500">Create your first one — it takes about a minute.</p>
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
              >
                + New website
              </button>
            </div>
          ) : (
            <ul className="space-y-2">
              {sites.map((s) => (
                <li key={s.id}>
                  <a
                    href={`/builder/${s.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-900"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {s.slug}.tapify.co.in
                        {s.industry ? ` · ${s.industry}` : ""}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        s.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {s.status === "published" ? "Live" : "Draft"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <DemoLink />
    </Shell>
  );
}

/* ------------------------------------------------------------------ pieces */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-xl font-bold text-slate-900">Tapify Website Builder</h1>
        <p className="mt-0.5 text-xs text-slate-500">Build a full website — no code.</p>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function DemoLink() {
  return (
    <p className="pt-2 text-center text-[11px] text-slate-400">
      Just exploring?{" "}
      <a href="/builder/demo" className="font-semibold text-slate-600 hover:underline">
        Try the demo editor
      </a>{" "}
      — nothing is saved.
    </p>
  );
}

function CreateForm({
  industries,
  onCancel,
  onCreated,
}: {
  industries: IndustryRecipe[];
  onCancel: () => void;
  onCreated: (site: SiteSummary) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [industry, setIndustry] = useState(industries[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the address in sync with the name until the user edits it themselves.
  const effectiveSlug = slugTouched ? slug : slugify(name);
  const slugOk = effectiveSlug === "" || isValidSlug(effectiveSlug);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { site } = await createSite({
        name: name.trim(),
        slug: effectiveSlug || undefined,
        industry: industry || undefined,
      });
      onCreated(site);
    } catch (err) {
      if (err instanceof NotSignedInError) {
        setError("Your session expired. Please sign in again.");
      } else if (err instanceof ApiError) {
        setError([err.message, ...err.details].filter(Boolean).slice(0, 2).join(" · "));
      } else {
        setError("Could not create the website.");
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-bold text-slate-900">New website</h2>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="name" className="mb-1 block text-[11px] font-semibold text-slate-700">
            Business name *
          </label>
          <input
            id="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Impulsse Career Institutions"
            className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-[11px] font-semibold text-slate-700">
            Web address
          </label>
          <div className="flex items-center gap-1">
            <input
              id="slug"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="impulsse"
              className={`w-full rounded-md border px-2.5 py-2 text-xs outline-none focus:border-slate-900 ${
                slugOk ? "border-slate-300" : "border-rose-400"
              }`}
            />
            <span className="shrink-0 text-[11px] text-slate-500">.tapify.co.in</span>
          </div>
          {!slugOk && (
            <p className="mt-1 text-[10px] text-rose-600">
              Use 3–63 characters: a–z, 0–9 and hyphens, not starting or ending with a hyphen.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="mb-1 block text-[11px] font-semibold text-slate-700">
            Industry
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
          >
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            Picks the sections and starting content that suit your business. You can change everything after.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">{error}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy || !name.trim() || !slugOk}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40"
        >
          {busy ? "Creating…" : "Create website"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
