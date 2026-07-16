"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type HeroSlide = {
  href: string;
  imageUrl: string;
  novelTitle: string;
  chapterTitle: string;
};

const ROTATE_MS = 5000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="hero-cover flex items-center justify-center bg-linear-to-br from-[#121830] to-[#070b14]">
        <span className="font-display text-lg text-(--site-ink-faint)">BlueFantasyProject</span>
      </div>
    );
  }

  return (
    <div>
      <div className="hero-cover">
        {slides.map((slide, i) => (
          <Link
            key={slide.href}
            href={slide.href}
            className="hero-slide"
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl} alt={slide.novelTitle} />
            <div className="hero-slide-caption">
              <p className="font-display text-sm">{slide.novelTitle}</p>
              <p className="text-xs">{slide.chapterTitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.href}
              type="button"
              aria-label={`Ver ${slide.novelTitle}`}
              onClick={() => setIndex(i)}
              className={`hero-dot${i === index ? " active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
