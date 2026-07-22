import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, isDarkBg } from "./_shared";

interface Post {
  image?: string;
  title?: string;
  date?: string;
  excerpt?: string;
  href?: string;
  linkText?: string;
}
interface BlogProps {
  label?: string;
  heading?: string;
  sub?: string;
  posts?: Post[];
}

export default function Blog({ section, props }: SectionProps<BlogProps>) {
  const posts = (props.posts ?? []).filter((p) => p.title || p.image);
  if (!posts.length) return null;
  const cols = section.variant === "grid-2" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={isDarkBg(section.style)} />
      <div className={`grid grid-cols-1 gap-6 ${cols}`} style={{ textAlign: "left" }}>
        {posts.map((b, i) => {
          const img = mediaUrl(b.image);
          return (
            <Card key={i}>
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={b.title ?? ""} loading="lazy" className="h-50 w-full object-cover" style={{ height: 200 }} />
              )}
              <div className="p-5">
                {b.date && <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{b.date}</p>}
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{b.title}</h3>
                {b.excerpt && <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>{b.excerpt}</p>}
                {b.href && (
                  <a href={b.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold underline" style={{ color: "var(--color-primary)" }}>
                    {b.linkText || "Read more"}
                  </a>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}
