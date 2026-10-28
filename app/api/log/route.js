import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { todayIso } from "@/lib/constants";

export async function POST(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const body = await request.json();
  const exerciseId = String(body.exerciseId || "");
  const date = String(body.date || todayIso());
  const done = Boolean(body.done);
  if (!exerciseId) {
    return NextResponse.json({ error: "Нет упражнения" }, { status: 400 });
  }

  const log = await prisma.workoutLog.upsert({
    where: {
      userId_exerciseId_date: { userId: user.id, exerciseId, date },
    },
    update: { done },
    create: { userId: user.id, exerciseId, date, done },
  });
  return NextResponse.json({ log });
}
