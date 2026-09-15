import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl font-semibold">No encontramos eso</h1>
      <p className="text-sm text-muted-foreground">
        La tienda o el producto ya no están disponibles.
      </p>
      <Link href="/" className="text-sm underline">
        Ir a tulocal
      </Link>
    </main>
  );
}
