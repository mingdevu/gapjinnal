import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://new-chat-rho-jade.vercel.app"),
  title: "값진날 — 우리의 추억, 얼마면 돼?",
  description: "다섯 친구가 사진을 올리고 각자의 마음값을 매기는 신나는 추억 파티.",
  openGraph: {
    title: "값진날 — 우리의 추억, 얼마면 돼?",
    description: "민영, 미교, 보연, 주연, 현정의 값진 추억 파티",
    images: ["/og.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="ko"><body>{children}</body></html>;
}
