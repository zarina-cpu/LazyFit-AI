import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const GOALS = new Set(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]);

export async function PATCH(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const body = await request.json();
  const data = {};
  if (typeof body.name === "string") data.name = body.name.trim().slice(0, 80);
  if (GOALS.has(body.targetGoal)) data.targetGoal = body.targetGoal;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });
  return NextResponse.json({
    user: { id: updated.id, name: updated.name, targetGoal: updated.targetGoal },
  });
}
