"use client";

/**
 * Loads a real site's draft in the BROWSER, then hands it to the Editor.
 *
 * This must happen client-side: the Tapify session cookie is host-only for
 * app.tapify.co.in, so it is never sent to builder.tapify.co.in and a
 * server-side fetch would always look signed-out. From here the browser sends
 * the cookie straight to the API (SameSite=None + CORS already allows it).
 */

import { useCallback, useEffect, useState } from "react";
import type { SiteDoc } from "@/lib/types";
import type { SectionManifest } from "./schema-types";
import { getDraft, NotSignedInError, LOGIN_URL } from "./client-api";
import Editor from "./Editor";

interface Loaded {
  siteId: number;
  slug: string;
  rev: number;
  doc: SiteDoc;
}

export default function BuilderLoader({
  siteId,
  manifests,
}: {
  siteId: string;
  manifests: SectionManifest[];
}) {
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const d = await getDraft(siteId);
      setData({ siteId: d.site.id, slug: d.site.slug, rev: d.rev, doc: d.doc });
      setState("ready");
    } catch (e) {
      if (e instanceof NotSignedInError) return setState("signed-out");
      setError(e instanceof Error ? e.message : "Could not load this website");
      setState("error");
    }
  }, [siteId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === "loading") {
    return (
      <Centered>
        <p className="text-xs text-slate-500">Loading your website…</p>
      </Centered>
    );
  }

  if (state === "signed-out") {
    return (
      <Centered>
        <p className="text-sm font-semibold text-slate-900">Sign in to edit this website</p>
        <p className="mt-1.5 text-xs text-slate-600">Use your existing Tapify account.</p>
        <a href={LOGIN_URL} className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
          Sign in to Tapify
        </a>
        <button type="button" onClick={() => void load()} className="mt-2 block w-full text-[11px] text-slate-500 hover:underline">
          I&apos;ve signed in — retry
        </button>
      </Centered>
    );
  }

  if (state === "error" || !data) {
    return (
      <Centered>
        <p className="text-sm font-semibold text-rose-700">Could not open this website</p>
        <p className="mt-1.5 text-xs text-slate-600">{error}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => void load()} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-700">
            Try again
          </button>
          <a href="/builder" className="rounded-lg border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-900">
            My websites
          </a>
        </div>
      </Centered>
    );
  }

  return (
    <Editor
      siteId={data.siteId}
      slug={data.slug}
      rev={data.rev}
      doc={data.doc}
      manifests={manifests}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xs text-center">{children}</div>
    </div>
  );
}
