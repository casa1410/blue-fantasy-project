import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-sm tracking-[0.3em] text-(--site-accent-3) uppercase">
        Página perdida
      </p>
      <h1 className="font-display mt-4 text-4xl">Esta página no existe</h1>
      <p className="mt-3 max-w-md text-(--site-ink-soft)">
        Lo que buscas no está aquí, o todavía no ha sido publicado en el universo de
        BlueFantasyProject.
      </p>
      <Link href="/" className="btn-glow mt-10">
        Volver al inicio
      </Link>
    </main>
  );
}
