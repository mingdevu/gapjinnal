# 값진날 — 우리의 추억, 얼마면 돼?

친구들과의 추억 사진을 올리고, 각자 그 순간에 **"마음값"**을 매기며 노는 웹 서비스입니다.
가장 값진 추억이 실시간 랭킹으로 올라가고, 댓글과 맛집 추천·투표로 다음 모임까지 이어집니다.

- 배포 링크: https://new-chat-rho-jade.vercel.app

![값진날 미리보기](public/og.png)

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 프로필 선택 | 회원가입 없이 닉네임 카드를 골라 입장, 프로필 사진 업로드 |
| 추억 업로드 | 사진·제목·장소·첫 마음값을 올리면 Vercel Blob에 사진 저장 |
| 마음값 매기기 | 친구마다 한 번씩 가격을 매기고(재입력 시 갱신), 합산 금액으로 랭킹 정렬 |
| 댓글 파티 | 추억별 댓글 작성·조회 |
| 맛집 추천·투표 | 카테고리 필터, 사진과 한줄평 등록, "먹으러 갈래" 투표 토글 |
| 랜덤 미션 | 미션 카드마다 오늘의 주인공 랜덤 뽑기 |
| 연출 | 값 크기별 반응 등급, 폭죽 버스트, 토스트, 1위 카드 하이라이트 (`prefers-reduced-motion` 대응) |

## 기술 스택

- **Next.js 16 (App Router) / React 19 / TypeScript**
- **Tailwind CSS 4** (preflight 기반 + 커스텀 CSS 토큰)
- **Neon Postgres** — `@neondatabase/serverless`로 SQL 실행
- **Vercel Blob** — 추억·프로필·맛집 사진 저장
- **Vercel** — 배포

## 구조

```
app/
  page.tsx              # 메인 화면 (클라이언트 컴포넌트)
  layout.tsx            # 메타데이터 / OG 설정
  globals.css           # 디자인 토큰, 애니메이션, 반응형
  api/
    memories/route.ts   # GET 추억 목록, POST 추억 업로드
    ratings/route.ts    # POST 마음값 매기기
    comments/route.ts   # GET/POST 댓글
    profiles/route.ts   # GET 프로필, POST 프로필 사진
    restaurants/route.ts# GET 목록, POST 등록, PATCH 투표 토글
lib/
  database.ts           # 테이블 생성 및 쿼리 함수
  profiles.ts           # 친구 닉네임 목록 (서버 검증·화면 공용)
public/og.png           # 공유 미리보기 이미지
```

### 데이터 모델

`memories` · `memory_ratings` · `memory_comments` · `friend_profiles` · `restaurants` · `restaurant_votes`
테이블은 첫 요청 시 `CREATE TABLE IF NOT EXISTS`로 자동 생성됩니다. 추억의 마음값은 `memories.value`(올린 사람의 첫 값) + `memory_ratings.value` 합계입니다.

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
```

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

```bash
DATABASE_URL=postgres://...        # Neon 연결 문자열
BLOB_READ_WRITE_TOKEN=vercel_blob_... # Vercel Blob 토큰
```

```bash
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

환경변수 없이 실행하면 API가 실패하고 화면에는 데모 추억 3개만 표시됩니다.
