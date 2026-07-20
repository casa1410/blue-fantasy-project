"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ChapterItem = { id: string; slug: string; title: string; publishedAt: string | null };
const STORAGE_KEY = "chapter-list-order";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NovelChapterList({
  novelSlug,
  chapters,
}: {
  novelSlug: string;
  chapters: ChapterItem[];
}) {
  const [newestFirst, setNewestFirst] = useState(false);

  useEffect(() => {
    // localStorage must be read client-side only, to avoid a hydration
    // mismatch vs. the server-rendered ascending order.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "newest") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewestFirst(true);
    }
  }, []);

  function toggleOrder() {
    setNewestFirst((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, next ? "newest" : "oldest");
      return next;
    });
  }

  const numbered = chapters.map((chapter, index) => ({ ...chapter, number: index + 1 }));
  const displayed = newestFirst ? [...numbered].reverse() : numbered;

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title text-2xl">Capítulos</h2>
        {chapters.length > 1 && (
          <button
            type="button"
            onClick={toggleOrder}
            className="reader-btn"
            aria-label={newestFirst ? "Ver desde el capítulo 1" : "Ver más recientes primero"}
            title={newestFirst ? "Ver desde el capítulo 1" : "Ver más recientes primero"}
          >
            {newestFirst ? "↓" : "↑"}
          </button>
        )}
      </div>

      <ul className="mt-5 divide-y divide-(--site-line) border-t border-(--site-line)">
        {displayed.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={`/novels/${novelSlug}/${chapter.slug}`}
              className="flex items-center justify-between gap-4 py-4 text-(--site-ink-soft) transition-colors hover:text-(--site-accent-3)"
            >
              <span>
                {chapter.number}. {chapter.title}
              </span>
              <span className="flex items-center gap-3 whitespace-nowrap">
                {formatDate(chapter.publishedAt) && (
                  <span className="text-xs text-(--site-ink-faint)">
                    {formatDate(chapter.publishedAt)}
                  </span>
                )}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
        {displayed.length === 0 && (
          <li className="py-4 text-sm text-(--site-ink-faint)">
            Todavía no hay capítulos publicados.
          </li>
        )}
      </ul>
    </div>
  );
}
