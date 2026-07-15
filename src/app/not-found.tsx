import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex flex-1 max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Pagina no encontrada</h1>
      <p className="mt-3 text-gray-600">
        Lo que buscas no existe o todavia no ha sido publicado.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
