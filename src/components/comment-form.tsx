"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitComment } from "@/actions/comments";

export function CommentForm({
  novelSlug,
  chapterSlug,
}: {
  novelSlug: string;
  chapterSlug: string;
}) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await submitComment(chapterSlug, novelSlug, {
      authorName,
      authorEmail,
      body,
      honeypot,
    });

    if (result.ok) {
      setMessage({
        type: "ok",
        text: "Comentario enviado. Se publicara despues de ser revisado.",
      });
      setAuthorName("");
      setAuthorEmail("");
      setBody("");
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Tu nombre"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          placeholder="Tu correo (no se publica)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <textarea
        required
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe tu comentario..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      {/* Honeypot: hidden from sighted/keyboard/screen-reader users, bots fill it anyway. */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar comentario"}
      </button>

      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
