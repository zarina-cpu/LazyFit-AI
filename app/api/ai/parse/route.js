import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/session";
import { parseExerciseInput } from "@/lib/ai";
import { saveParsedExercise } from "@/lib/exercises";

export async function POST(request) {
  const { user, error, status } = await requireUser();
  if (!user) return NextResponse.json({ error }, { status });

  const form = await request.formData();
  const sourceUrl = String(form.get("sourceUrl") || "").trim();
  const text = String(form.get("text") || "").trim();
  const file = form.get("file");

  if (!sourceUrl && !text && !(file instanceof File)) {
    return NextResponse.json({ error: "Нужна ссылка, текст или файл" }, { status: 400 });
  }

  let mediaUrl = null;
  let fileName = null;
  let mediaType = sourceUrl ? "LINK" : "IMAGE";

  if (file instanceof File && file.size > 0) {
    fileName = file.name;
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/[^\w.\-а-яА-Я]+/g, "_")}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safeName), bytes);
    mediaUrl = `/uploads/${safeName}`;
    mediaType = file.type.startsWith("video") ? "VIDEO" : file.name.toLowerCase().endsWith(".gif") ? "GIF" : "IMAGE";
  }

  const parsed = await parseExerciseInput({ sourceUrl, text, fileName });
  const exercise = await saveParsedExercise(user.id, parsed, {
    sourceUrl: sourceUrl || null,
    mediaUrl,
    mediaType: parsed.mediaType || mediaType,
  });

  return NextResponse.json({ exercise });
}
