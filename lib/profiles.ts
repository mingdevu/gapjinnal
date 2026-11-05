// 친구 프로필 목록: 서버(lib/database.ts 검증)와 클라이언트(app/page.tsx 화면)가 함께 쓴다.
// DB 드라이버를 import하지 않으므로 클라이언트 번들에 포함돼도 안전하다.
export const PROFILE_NAMES = ["플렉스요정", "영수증마왕", "짠테크장인", "마음부자", "할부천사"] as const;
export type ProfileName = (typeof PROFILE_NAMES)[number];

export const PROFILE_STYLES: Record<ProfileName, { emoji: string; color: string; tagline: string }> = {
  플렉스요정: { emoji: "✨", color: "#ff2e7e", tagline: "추억엔 늘 풀매수" },
  영수증마왕: { emoji: "🧾", color: "#6c3bff", tagline: "1원 단위까지 기록함" },
  짠테크장인: { emoji: "🪙", color: "#ff8a00", tagline: "아껴서 추억에 몰빵" },
  마음부자: { emoji: "💎", color: "#00b894", tagline: "값은 못 매겨도 정은 많음" },
  할부천사: { emoji: "💳", color: "#1e7bff", tagline: "추억은 무이자 12개월" },
};

export function isProfileName(value: string): value is ProfileName {
  return (PROFILE_NAMES as readonly string[]).includes(value);
}
