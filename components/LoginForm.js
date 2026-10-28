"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Mail, Smartphone } from "lucide-react";

export default function LoginForm({ googleEnabled }) {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/today";
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("lazy@lazyfit.app");
  const [phone, setPhone] = useState("+79990000000");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginEmail(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("demo", { email, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Не получилось войти по почте. Проверьте адрес.");
      return;
    }
    router.push(from);
    router.refresh();
  }

  async function sendOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не удалось отправить код");
      return;
    }
    setOtpSent(true);
    setHint(data.demoCode ? `Демо-код: ${data.demoCode}` : "Код отправлен");
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("phone-otp", { phone, code, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Неверный или просроченный код");
      return;
    }
    router.push(from);
    router.refresh();
  }

  return (
    <div className="card relative overflow-hidden rounded-4xl p-5 sm:p-8">
      <div className="mb-6 flex rounded-2xl bg-bg-2 p-1">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm ${tab === "email" ? "bg-card shadow-sm" : "text-muted"}`}
        >
          <Mail size={16} /> Почта
        </button>
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm ${tab === "phone" ? "bg-card shadow-sm" : "text-muted"}`}
        >
          <Smartphone size={16} /> Телефон
        </button>
      </div>

      {tab === "email" ? (
        <form onSubmit={loginEmail} className="space-y-4">
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none ring-sage focus:ring-2"
            />
          </label>
          <p className="text-xs text-muted">Демо-вход без пароля. Готовый аккаунт: lazy@lazyfit.app</p>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fill py-3 font-medium text-white"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
            Войти и лечь тренироваться
          </button>
        </form>
      ) : (
        <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">
          <label className="block text-sm">
            Телефон
            <input
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none ring-sage focus:ring-2"
            />
          </label>
          {otpSent ? (
            <label className="block text-sm">
              Код из SMS
              <input
                inputMode="numeric"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 tracking-[0.4em] outline-none ring-sage focus:ring-2"
              />
            </label>
          ) : null}
          {hint ? <p className="text-sm text-sage">{hint}</p> : <p className="text-xs text-muted">В демо SMS не уходит — код покажем на экране.</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fill py-3 font-medium text-white"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
            {otpSent ? "Подтвердить код" : "Получить код"}
          </button>
        </form>
      )}

      {googleEnabled ? (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: from })}
          className="mt-4 w-full rounded-2xl border border-line py-3 text-sm"
        >
          Войти через Google
        </button>
      ) : null}

      {error ? <p className="mt-4 text-sm text-terra">{error}</p> : null}
    </div>
  );
}
