import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { phone } = await request.json();
  const normalized = String(phone || "").trim();
  if (!normalized || normalized.length < 6) {
    return NextResponse.json({ error: "Укажите телефон" }, { status: 400 });
  }

  await prisma.otpVerification.deleteMany({ where: { phone: normalized } });
  const code = process.env.NODE_ENV === "production" && process.env.SMS_PROVIDER ? String(Math.floor(100000 + Math.random() * 900000)) : "123456";
  await prisma.otpVerification.create({
    data: {
      phone: normalized,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    demoCode: code === "123456" ? code : undefined,
  });
}
