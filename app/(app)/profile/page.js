import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <p className="text-sm text-muted">Профиль</p>
        <h1 className="display text-4xl">Цель можно сменить, не вставая.</h1>
      </header>
      <ProfileForm user={user} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/stats" className="card rounded-3xl p-4 text-sm">
          Ленивая статистика
        </Link>
        <Link href="/chat" className="card rounded-3xl p-4 text-sm">
          Чат с тренером
        </Link>
      </div>
      <form action={logout}>
        <button type="submit" className="w-full rounded-2xl border border-line py-3 text-sm">
          Выйти и снова лечь
        </button>
      </form>
    </div>
  );
}
