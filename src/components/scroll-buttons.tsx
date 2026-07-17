"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="reader-btn"
    >
      ↑ Arriba
    </button>
  );
}

export function ScrollToBottomButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      }
      className="reader-btn"
    >
      Ir al final ↓
    </button>
  );
}
