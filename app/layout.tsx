import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "값진날 — 우리끼리 매기는 추억의 값",
  description: "친구들과 사진을 올리고 마음만큼의 금액을 붙여 순위를 만드는 비공개 추억 아카이브",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
