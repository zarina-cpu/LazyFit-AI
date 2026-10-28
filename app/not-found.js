import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="space-y-3">
        <p className="text-sm text-muted">404</p>
        <h1 className="display text-4xl">Этой страницы нет. Зато диван на месте.</h1>
        <Link href="/" className="inline-block rounded-2xl bg-fill px-4 py-2 text-white">
          На главную
        </Link>
      </div>
    </div>
  );
}
