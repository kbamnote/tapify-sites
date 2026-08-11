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
  deleteSite,
  changeSlug,
  listUsers,
  slugify,
  isValidSlug,
  NotSignedInError,
  ApiError,
  LOGIN_URL,
  type SiteSummary,
  type UserSummary,
} from "./client-api";
import type { IndustryRecipe } from "./schema-types";

type Status = "loading" | "ready" | "signed-out" | "error";

/** Sentinel value in the "Assign to client" picker meaning "make a new login". */
const NEW_CLIENT = "__new__";

export default function SiteList({ industries }: { industries: IndustryRecipe[] }) {
  const [status, setStatus] = useState<Status>("loading");
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await listSites();
      setSites(res.sites);
      setCanCreate(res.canCreate);
      setCanDelete(res.canDelete);
      setStatus("ready");
    } catch (e) {
      if (e instanceof NotSignedInError) return setStatus("signed-out");
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }, []);

  const remove = useCallback(async (site: SiteSummary) => {
    if (!window.confirm(`Delete "${site.name}" permanently? This cannot be undone.`)) return;
    setDeletingId(site.id);
    try {
      await deleteSite(site.id);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not delete the website.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // Renaming is destructive-adjacent: the address changes instantly. The old one
  // keeps working as a 301, and the confirm says so — otherwise nobody would
  // dare click it on a site whose QR codes are already printed.
  const rename = useCallback(async (site: SiteSummary) => {
    const input = window.prompt(
      `New web address for "${site.name}".\n\n` +
        `Current: ${site.slug}.tapify.co.in\n\n` +
        `The old address will keep working — it redirects here permanently, so printed QR codes and business cards are safe.`,
      site.slug
    );
    if (input === null) return;

    const next = slugify(input.trim().toLowerCase());
    if (next === site.slug) return;
    if (!isValidSlug(next)) {
      window.alert("Use 3–63 characters: a–z, 0–9 and hyphens, not starting or ending with a hyphen.");
      return;
    }

    setRenamingId(site.id);
    try {
      const res = await changeSlug(site.id, next);
      setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, slug: res.slug } : s)));
      window.alert(`Address updated to ${res.slug}.tapify.co.in\n\n${res.previous_slug}.tapify.co.in now redirects here.`);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not change the address.");
    } finally {
      setRenamingId(null);
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

  // Client-side filter: one box matches the client, the website and its address,
  // so you can type whatever you remember. The list is a per-user set, never big
  // enough to need a server-side search.
  const q = query.trim().toLowerCase();
  const visible = q
    ? sites.filter((s) =>
        [s.name, s.slug, s.industry, s.owner_name, s.owner_email].some((v) =>
          (v ?? "").toLowerCase().includes(q)
        )
      )
    : sites;

  return (
    <Shell wide={!creating}>
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
              {canCreate ? "All websites" : "My website"}{" "}
              {sites.length ? (q ? `(${visible.length} of ${sites.length})` : `(${sites.length})`) : ""}
            </h2>
            {canCreate && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700"
              >
                + New website
              </button>
            )}
          </div>

          {sites.length > 3 && (
            <div className="relative mb-3 max-w-sm">
              <label htmlFor="siteSearch" className="sr-only">
                Search websites
              </label>
              <input
                id="siteSearch"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search client, website, address or industry…"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs outline-none placeholder:text-slate-400 focus:border-slate-900"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
              >
                ⌕
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  title="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-1.5 text-sm leading-none text-slate-400 hover:text-slate-900"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {!sites.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              {canCreate ? (
                <>
                  <p className="text-sm font-semibold text-slate-800">No websites yet</p>
                  <p className="mt-1 text-xs text-slate-500">Create one and assign it to a client — it takes about a minute.</p>
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    + New website
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">No website assigned yet</p>
                  <p className="mt-1 text-xs text-slate-500">Your website will appear here once our team sets it up for you.</p>
                </>
              )}
            </div>
          ) : !visible.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No matches</p>
              <p className="mt-1 text-xs text-slate-500">
                Nothing matches “{query.trim()}”. Try a client name, website name or web address.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 text-[11px] font-semibold text-slate-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((s) => {
                const live = s.status === "published";
                const client = s.owner_name || s.owner_email;
                return (
                  <li key={s.id}>
                    {/* A card rather than one big link: it carries several actions,
                        and nesting buttons inside an <a> is invalid. */}
                    <article className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-400">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                          {s.name}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            live ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {live ? "Live" : "Draft"}
                        </span>
                      </div>

                      {/* Shown to everyone who can see the site: a client only ever
                          sees their own, and the backend enforces owner-or-staff. */}
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="min-w-0 truncate text-[11px] text-slate-500">
                          {s.slug}.tapify.co.in
                        </p>
                        <button
                          type="button"
                          onClick={() => void rename(s)}
                          disabled={renamingId === s.id}
                          title="Change web address"
                          className="shrink-0 text-[10px] font-semibold text-slate-400 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-40"
                        >
                          {renamingId === s.id ? "…" : "Change"}
                        </button>
                      </div>

                      {(s.industry || client) && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {s.industry && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {s.industry}
                            </span>
                          )}
                          {client && (
                            <span className="max-w-full truncate rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                              Client: {client}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
                        <a
                          href={`/builder/${s.id}`}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700"
                        >
                          Edit
                        </a>
                        {live && (
                          <a
                            href={`https://${s.slug}.tapify.co.in`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-900"
                          >
                            View live
                          </a>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void remove(s)}
                            disabled={deletingId === s.id}
                            title="Delete website"
                            className="ml-auto rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:border-rose-400 disabled:opacity-40"
                          >
                            {deletingId === s.id ? "…" : "Delete"}
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      <DemoLink />
    </Shell>
  );
}

/* ------------------------------------------------------------------ pieces */

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-dvh justify-center bg-slate-50 p-6">
      {/* The card grid needs room for three columns; forms stay narrow so their
          fields don't stretch to an unreadable width. */}
      <div className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"}`}>
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
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [assignTo, setAssignTo] = useState<string>("");
  // "__new__" swaps the client picker for the three login fields below, so an
  // admin can create the customer account and the website in one step.
  const creatingClient = assignTo === NEW_CLIENT;
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPassword, setCustPassword] = useState("");

  // Load the client list for the "Assign to" picker (admin/staff only endpoint).
  useEffect(() => {
    listUsers()
      .then((list) => setUsers(list.filter((u) => u.role !== "admin")))
      .catch(() => setUsers([]));
  }, []);

  // Keep the address in sync with the name until the user edits it themselves.
  const effectiveSlug = slugTouched ? slug : slugify(name);
  const slugOk = effectiveSlug === "" || isValidSlug(effectiveSlug);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    // Mirrors the vCard flow's rules so the customer can actually sign in.
    const email = custEmail.trim();
    if (creatingClient) {
      if (!email) return setError("Customer login email is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid customer login email.");
      if (custPassword.length < 6) return setError("Customer password must be at least 6 characters.");
    }

    setBusy(true);
    setError(null);
    try {
      const { site } = await createSite({
        name: name.trim(),
        slug: effectiveSlug || undefined,
        industry: industry || undefined,
        userId: !creatingClient && assignTo ? Number(assignTo) : undefined,
        customer: creatingClient
          ? { name: custName.trim(), email, password: custPassword }
          : undefined,
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
          <label htmlFor="assignTo" className="mb-1 block text-[11px] font-semibold text-slate-700">
            Assign to client
          </label>
          <select
            id="assignTo"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
          >
            <option value="">— Keep for myself —</option>
            <option value={NEW_CLIENT}>+ Create a new client…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}{u.email ? ` (${u.email})` : ""}{u.role !== "user" ? ` · ${u.role}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            The client will be able to edit and view this website — but not create or delete any.
          </p>
        </div>

        {creatingClient && (
          <div className="rounded-lg border border-dashed border-violet-400 bg-violet-50/40 p-3">
            <p className="text-[11px] font-bold text-violet-700">New client login</p>
            <p className="mt-0.5 text-[10px] text-slate-600">
              A customer account is created and this website is assigned to them. If the email already
              belongs to a client, that account is used instead and its password is left unchanged.
            </p>

            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="custName" className="mb-1 block text-[11px] font-semibold text-slate-700">
                  Customer Name
                </label>
                <input
                  id="custName"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Customer's Full Name"
                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="custEmail" className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Customer Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="custEmail"
                    type="email"
                    autoComplete="off"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="custPassword" className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Set Login Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="custPassword"
                    type="text"
                    autoComplete="off"
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
