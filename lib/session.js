import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Нужно войти", status: 401, user: null };
  }
  return { user: session.user, error: null, status: 200 };
}
