"use client";

/**
 * Account — optional customer login/signup for e-commerce builder sites.
 *
 * Tabbed login/signup that posts to /api/sites/customer-auth.php. The returned
 * token is stored client-side (localStorage, keyed per site) and the section
 * then shows a signed-in state. Scoped to this site only — nothing to do with
 * the Tapify dashboard account.
 */
import { useEffect, useState } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";

interface AccountProps { heading?: string; sub?: string; showPhone?: boolean }

const API = process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api";

export default function Account({ section, props, doc, siteSlug }: SectionProps<AccountProps>) {
  const slug = siteSlug ?? "";
  const key = `tf_customer_${slug}`;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [me, setMe] = useState<{ name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [orders, setOrders] = useState<Array<{ id: number; item_title?: string; price?: string; quantity?: number; status?: string }>>([]);

  async function loadOrders(token?: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API}/sites/customer-orders.php`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ site: slug, token }),
      });
      const json = await res.json();
      if (json?.success) setOrders(json.data.orders ?? []);
    } catch {}
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const acc = JSON.parse(raw); setMe(acc); loadOrders(acc.token); }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const input: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 14, marginBottom: 10,
    border: "1px solid var(--color-border)", borderRadius: "var(--radius)",
    background: "var(--color-bg)", color: "var(--color-text)",
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const f = e.currentTarget;
    const body: Record<string, string> = {
      action: mode === "signup" ? "register" : "login",
      site: slug,
      email: (f.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
      password: (f.elements.namedItem("password") as HTMLInputElement)?.value ?? "",
    };
    if (mode === "signup") {
      body.name = (f.elements.namedItem("name") as HTMLInputElement)?.value ?? "";
      const ph = f.elements.namedItem("phone") as HTMLInputElement | null;
      if (ph) body.phone = ph.value;
    }
    try {
      const res = await fetch(`${API}/sites/customer-auth.php`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json?.success) { setMsg(json?.message ?? "Something went wrong."); setBusy(false); return; }
      const acc = { name: json.data.name, email: json.data.email, token: json.data.token };
      try { localStorage.setItem(key, JSON.stringify(acc)); } catch {}
      setMe({ name: acc.name });
      loadOrders(acc.token);
    } catch {
      setMsg("Connection error. Please try again.");
    }
    setBusy(false);
  }

  function signOut() {
    try { localStorage.removeItem(key); } catch {}
    setMe(null);
  }

  const card = (
    <div
      className="mx-auto w-full max-w-md p-7 text-left"
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", boxShadow: "0 8px 30px rgba(16,24,40,.08)" }}
    >
      {me ? (
        <div className="text-center">
          <p className="text-lg font-bold">Hi {me.name} 👋</p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>You're signed in.</p>
          <button
            type="button" onClick={signOut}
            className="mt-5 px-5 py-2.5 text-sm font-semibold"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)", borderRadius: "var(--radius)" }}
          >
            Sign out
          </button>
          <div className="mt-7 text-left">
            <p className="mb-3 text-base font-bold">My Orders</p>
            {orders.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>No orders yet.</p>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="mb-2 rounded p-3" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}>
                  <div className="flex justify-between gap-2">
                    <strong className="text-sm">{o.item_title || "Order"}</strong>
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>#{o.id}</span>
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                    {o.price}{o.quantity && o.quantity > 1 ? ` × ${o.quantity}` : ""} · {o.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-5 flex gap-2">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m} type="button" onClick={() => { setMode(m); setMsg(null); }}
                className="flex-1 py-2 text-sm font-semibold"
                style={{
                  borderRadius: "var(--radius)",
                  background: mode === m ? "var(--color-primary)" : "transparent",
                  color: mode === m ? "var(--color-primary-fg)" : "var(--color-text)",
                  border: mode === m ? "none" : "1px solid var(--color-border)",
                }}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {mode === "signup" && <input name="name" placeholder="Your name" required style={input} />}
            <input name="email" type="email" placeholder="Email" required style={input} />
            {mode === "signup" && props.showPhone !== false && <input name="phone" type="tel" placeholder="Phone (optional)" style={input} />}
            <input name="password" type="password" placeholder="Password" required minLength={6} style={input} />
            <button
              type="submit" disabled={busy}
              className="w-full py-3 text-sm font-semibold"
              style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)", borderRadius: "var(--radius)", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
            {msg && <p className="mt-3 text-center text-sm" style={{ color: "#dc2626" }}>{msg}</p>}
          </form>
        </>
      )}
    </div>
  );

  return (
    <SectionShell section={section}>
      <SectionHeader label={undefined} heading={props.heading} sub={props.sub} />
      {card}
    </SectionShell>
  );
}
