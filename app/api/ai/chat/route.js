import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { chatWithCoach } from "@/lib/ai";

export async function POST(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Напишите запрос" }, { status: 400 });
  }

  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  const result = await chatWithCoach({
    message,
    history: Array.isArray(body.history) ? body.history : [],
    goal: profile?.targetGoal,
  });

  return NextResponse.json(result);
}
