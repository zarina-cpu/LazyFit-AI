import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { listExercises, saveParsedExercise } from "@/lib/exercises";

export async function GET() {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const exercises = await listExercises(user.id);
  return NextResponse.json({ exercises });
}

export async function POST(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });
  const body = await request.json();
  if (!body.title || !body.description) {
    return NextResponse.json({ error: "Нужны название и описание" }, { status: 400 });
  }
  const exercise = await saveParsedExercise(user.id, {
    title: body.title,
    description: body.description,
    categories: body.categories || ["Для ленивых"],
    mediaType: body.mediaType || "IMAGE",
  });
  return NextResponse.json({ exercise });
}
