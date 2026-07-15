import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        BlueFantasyProject
      </Link>
      <nav className="site-nav">
        <Link href="/">Inicio</Link>
        <Link href="/#novelas">Novelas</Link>
      </nav>
    </header>
  );
}
