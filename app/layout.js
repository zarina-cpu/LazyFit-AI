import { Manrope, Unbounded } from "next/font/google";
import { auth } from "@/auth";
import Providers from "@/components/Providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
});

export const metadata = {
  title: "LazyFit AI — тренер для ленивых",
  description: "Превращает ссылки, видео и отговорки в мягкий план тренировок на неделю.",
  applicationName: "LazyFit AI",
  appleWebApp: {
    capable: true,
    title: "LazyFit AI",
    statusBarStyle: "default",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3EEE4" },
    { media: "(prefers-color-scheme: dark)", color: "#121916" },
  ],
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="ru" className={`${manrope.variable} ${unbounded.variable}`} suppressHydrationWarning>
      <body className={`${manrope.className} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('lazyfit-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
