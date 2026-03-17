import { Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "NewsFlow",
  description: "個人用ニュース集約アプリ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NewsFlow",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#08080f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
