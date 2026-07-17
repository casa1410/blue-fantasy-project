"use client";

import { useEffect, useState } from "react";
import { ScrollToBottomButton } from "@/components/scroll-buttons";

const SIZES = [
  { key: "sm", label: "Pequeño", proseClass: "prose-sm" },
  { key: "base", label: "Estándar", proseClass: "prose-base" },
  { key: "lg", label: "Grande", proseClass: "prose-lg" },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];
const SIZE_STORAGE_KEY = "reader-font-size";

const MARK_MIN_PERCENT = 2;
const MARK_DONE_PERCENT = 97;

function markKey(chapterId: string) {
  return `reading-mark:${chapterId}`;
}

function currentScrollPercent(): number | null {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
}

export function ChapterArticle({
  content,
  chapterId,
}: {
  content: string;
  chapterId: string;
}) {
  const [size, setSize] = useState<SizeKey>("base");
  const [resumePercent, setResumePercent] = useState<number | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // localStorage must be read client-side only, to avoid a hydration
    // mismatch vs. the server-rendered default size.
    const storedSize = localStorage.getItem(SIZE_STORAGE_KEY);
    if (storedSize === "sm" || storedSize === "base" || storedSize === "lg") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSize(storedSize);
    }

    const storedMark = localStorage.getItem(markKey(chapterId));
    if (storedMark) {
      const percent = Number(storedMark);
      if (Number.isFinite(percent) && percent >= MARK_MIN_PERCENT && percent < MARK_DONE_PERCENT) {
        setResumePercent(percent);
        setBannerVisible(true);
      }
    }
  }, [chapterId]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    function handleScroll() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const percent = currentScrollPercent();
        if (percent === null) return;
        if (percent < MARK_MIN_PERCENT || percent >= MARK_DONE_PERCENT) {
          localStorage.removeItem(markKey(chapterId));
        } else {
          localStorage.setItem(markKey(chapterId), String(percent));
        }
      }, 400);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [chapterId]);

  function goToMark() {
    if (resumePercent === null) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (resumePercent / 100) * scrollable, behavior: "smooth" });
    setBannerVisible(false);
  }

  function selectSize(key: SizeKey) {
    setSize(key);
    localStorage.setItem(SIZE_STORAGE_KEY, key);
  }

  const proseClass = SIZES.find((s) => s.key === size)?.proseClass ?? "prose-base";

  return (
    <>
      {bannerVisible && resumePercent !== null && (
        <div className="site-card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-(--site-ink-soft)">
            Tienes una marca de lectura en este capítulo, al {resumePercent}%.
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={goToMark} className="reader-btn">
              Continuar desde ahí
            </button>
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              className="text-sm text-(--site-ink-faint) hover:text-(--site-ink)"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
