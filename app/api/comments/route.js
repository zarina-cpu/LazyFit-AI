import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const body = await request.json();
  const text = String(body.text || "").trim();
  const contextType = String(body.contextType || "");
  const contextId = String(body.contextId || "");
  if (!text || !contextType || !contextId) {
    return NextResponse.json({ error: "Пустая заметка" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      userId: user.id,
      contextType,
      contextId,
      text,
    },
  });
  return NextResponse.json({ comment });
}
