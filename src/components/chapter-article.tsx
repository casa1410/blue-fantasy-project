"use client";

import { useEffect, useState } from "react";
import { ScrollToBottomButton } from "@/components/scroll-buttons";

const SIZES = [
  { key: "sm", label: "Pequeño", proseClass: "prose-sm" },
  { key: "base", label: "Estándar", proseClass: "prose-base" },
  { key: "lg", label: "Grande", proseClass: "prose-lg" },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];
const STORAGE_KEY = "reader-font-size";

export function ChapterArticle({ content }: { content: string }) {
  const [size, setSize] = useState<SizeKey>("base");

  useEffect(() => {
    // localStorage must be read client-side only, to avoid a hydration
    // mismatch vs. the server-rendered default size.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "sm" || stored === "base" || stored === "lg") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize(stored);
    }
  }, []);

  function selectSize(key: SizeKey) {
    setSize(key);
    localStorage.setItem(STORAGE_KEY, key);
  }

  const proseClass = SIZES.find((s) => s.key === size)?.proseClass ?? "prose-base";

  return (
    <>
      <div className="reader-toolbar mb-8">
        <div className="reader-btn-group">
          {SIZES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => selectSize(s.key)}
              className={`reader-btn${size === s.key ? " active" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <ScrollToBottomButton />
      </div>

      <article
        className={`prose prose-invert chapter-prose ${proseClass} max-w-none`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
