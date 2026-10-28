import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePlan } from "@/lib/plan";

export async function POST() {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const profile = await prisma.user.findUnique({ where: { id: user.id } });
  const plan = await generatePlan(user.id, profile?.targetGoal || "MAINTAIN");
  return NextResponse.json({ ok: true, planId: plan.id });
}
