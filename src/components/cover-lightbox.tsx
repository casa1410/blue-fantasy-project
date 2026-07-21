"use client";

import { useEffect, useState } from "react";

export function CoverLightbox({
  src,
  alt,
  triggerClassName,
}: {
  src: string;
  alt: string;
  triggerClassName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`cover-trigger ${triggerClassName}`}
        aria-label={`Ver portada de ${alt} en grande`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </button>

      {open && (
        <div
          className="lightbox-backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Portada de ${alt}`}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
