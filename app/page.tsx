"use client";
import { CSSProperties, ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PROFILE_NAMES, PROFILE_STYLES, isProfileName } from "@/lib/profiles";

type Profile = { name: string; photo: string | null };
type Memory = { id: string; title: string; date: string; place: string; owner: string; value: number; image: string; accent: string; ratingCount: number };
type Comment = { id: string; profileName: string; body: string; date: string };
type Mission = { emoji: string; category: string; title: string; color: string };
type Restaurant = { id: string; name: string; category: string; location: string; menu: string; price: string; note: string; photo: string; owner: string; voteCount: number; voters: string[] };
type ConfettiPiece = { id: number; left: number; delay: number; duration: number; color: string; rotate: number; shape: "square" | "circle" | "strip" };

const names: string[] = [...PROFILE_NAMES];
const FALLBACK_COLORS = ["#ff2e7e", "#6c3bff", "#ff8a00", "#00b894", "#1e7bff"];
const CONFETTI_COLORS = ["#ff2e7e", "#6c3bff", "#ffd60a", "#00d6a3", "#1e7bff", "#ff8a00"];
const won = new Intl.NumberFormat("ko-KR");

const avatarOf = (name: string) => (isProfileName(name) ? PROFILE_STYLES[name].emoji : name.slice(0, 1));
const colorOf = (name: string, fallbackIndex = 0) =>
  isProfileName(name) ? PROFILE_STYLES[name].color : FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];

// 마음값 크기에 따라 모달에서 보여줄 반응 등급
function priceTier(value: number) {
  if (value >= 1_000_000) return { label: "전설의 추억", emoji: "👑", level: 4 };
  if (value >= 300_000) return { label: "역대급 순간", emoji: "🔥", level: 3 };
  if (value >= 100_000) return { label: "꽤 값진 날", emoji: "💖", level: 2 };
  if (value > 0) return { label: "소소한 행복", emoji: "🙂", level: 1 };
  return { label: "값을 매겨주세요", emoji: "🤔", level: 0 };
}

const demo: Memory[] = [
  { id: "demo-1", title: "우리가 바다를 전세 낸 날", date: "2025. 08. 17", place: "강릉", owner: "플렉스요정", value: 1280000, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85", accent: FALLBACK_COLORS[0], ratingCount: 4 },
  { id: "demo-2", title: "새벽 네 시, 한강 라면", date: "2025. 05. 04", place: "반포", owner: "영수증마왕", value: 890000, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85", accent: FALLBACK_COLORS[1], ratingCount: 3 },
  { id: "demo-3", title: "첫 단체 여행에서 길을 잃다", date: "2024. 12. 28", place: "을지로", owner: "짠테크장인", value: 720000, image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=85", accent: FALLBACK_COLORS[2], ratingCount: 5 },
];

const missions: Mission[] = [
  { emoji: "📸", category: "사진 미션", title: "오늘 제일 이상하게 나온 표정 사진 올리기", color: "#ff2e7e" },
  { emoji: "🫢", category: "폭로 미션", title: "이름 넣은 친구의 귀여운 흑역사 하나 공개하기", color: "#6c3bff" },
  { emoji: "🎤", category: "노래 미션", title: "노래방 18번을 10초 동안 진지하게 부르기", color: "#ff8a00" },
  { emoji: "💌", category: "감동 미션", title: "말 못 했던 고마운 점을 한 문장으로 남기기", color: "#00b894" },
  { emoji: "🕺", category: "몸개그 미션", title: "이름 넣은 친구의 시그니처 포즈 따라 하기", color: "#1e7bff" },
  { emoji: "🍕", category: "먹방 미션", title: "우리 모임 최애 메뉴를 한입 광고로 소개하기", color: "#f15bb5" },
  { emoji: "🔮", category: "미래 미션", title: "10년 뒤 가장 먼저 대박 날 사람 예언하기", color: "#9b5de5" },
  { emoji: "🤣", category: "웃참 미션", title: "서로 눈 보고 15초 동안 웃음 참기", color: "#00a6e0" },
];

const foodCategories = ["전체", "한식", "양식", "일식", "중식", "카페", "술집", "기타"];
const QUICK_PRICES = [50000, 100000, 300000, 1000000];
const randomName = () => names[Math.floor(Math.random() * names.length)];

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>(names.map((name) => ({ name, photo: null })));
  const [me, setMe] = useState("");
  const [items, setItems] = useState<Memory[]>(demo);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [ratingValue, setRatingValue] = useState(100000);
  const [upload, setUpload] = useState(false);
  const [toast, setToast] = useState({ id: 0, message: "" });
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState("");
  const [commentMemory, setCommentMemory] = useState<Memory | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [missionNames, setMissionNames] = useState<Record<number, string>>({});
  const [missionRolls, setMissionRolls] = useState<Record<number, number>>({});
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [foodFilter, setFoodFilter] = useState("전체");
  const [poppedVote, setPoppedVote] = useState("");
  const timers = useRef<number[]>([]);
  const eventCounter = useRef(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/memories").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/restaurants").then((r) => r.json()),
    ])
      .then(([memoryData, profileData, restaurantData]) => {
        if (memoryData.memories?.length) setItems(memoryData.memories);
        if (profileData.profiles) setProfiles(profileData.profiles);
        if (restaurantData.restaurants) setRestaurants(restaurantData.restaurants);
      })
      // 초기 로딩 실패 시에는 데모 추억을 그대로 보여준다.
      .catch(() => {});
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const ranked = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const heat = Math.min(100, Math.round((items.reduce((sum, m) => sum + m.ratingCount, 0) / Math.max(items.length * names.length, 1)) * 100));
  const tier = priceTier(ratingValue);
  const visibleRestaurants = foodFilter === "전체" ? restaurants : restaurants.filter((r) => r.category === foodFilter);

  function later(callback: () => void, ms: number) {
    timers.current.push(window.setTimeout(callback, ms));
  }

  function celebrate(message: string, burst = false) {
    // 토스트·폭죽마다 고유 id를 붙여, 오래된 타이머가 새 연출을 지우지 않게 한다.
    eventCounter.current += 100;
    const id = eventCounter.current;
    setToast({ id, message });
    later(() => setToast((current) => (current.id === id ? { id: 0, message: "" } : current)), 2400);
    if (!burst) return;
    const shapes: ConfettiPiece["shape"][] = ["square", "circle", "strip"];
    const pieces = Array.from({ length: 42 }, (_, i) => ({
      id: id + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.9,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 720 - 360,
      shape: shapes[i % shapes.length],
    }));
    setConfetti(pieces);
    later(() => setConfetti((current) => (current[0]?.id === id ? [] : current)), 2300);
  }

  function requireProfile(action: () => void) {
    if (me) action();
    else celebrate("먼저 위에서 내 프로필을 골라주세요! 👆");
  }

  function openRating(memory: Memory) {
    setRatingValue(100000);
    setSelected(memory);
  }

  async function rate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!me || !selected) return;
    if (selected.id.startsWith("demo-")) {
      setSelected(null);
      celebrate("실제 추억을 먼저 올려주세요! 📸");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memoryId: selected.id, profileName: me, value: ratingValue }),
      });
      if (!response.ok) throw new Error();
      const fresh = await fetch("/api/memories").then((r) => r.json());
      if (fresh.memories) setItems(fresh.memories);
      setSelected(null);
      celebrate(`${me}의 마음값 ₩${won.format(ratingValue)} 적립! ${tier.emoji}`, true);
    } catch {
      celebrate("잠깐! 다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  }

  async function changePhoto(e: ChangeEvent<HTMLInputElement>, name: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      celebrate("사진은 5MB 이하로 골라주세요");
      return;
    }
    const preview = URL.createObjectURL(file);
    setProfiles((list) => list.map((p) => (p.name === name ? { ...p, photo: preview } : p)));
    setPhotoSaving(name);
    const form = new FormData();
    form.set("name", name);
    form.set("photo", file);
    try {
      const response = await fetch("/api/profiles", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProfiles((list) => list.map((p) => (p.name === name ? data.profile : p)));
      celebrate(`${name} 프로필 사진 저장 완료! ✨`);
    } catch (error) {
      const fresh = await fetch("/api/profiles").then((r) => r.json()).catch(() => null);
      if (fresh?.profiles) setProfiles(fresh.profiles);
      celebrate(error instanceof Error && error.message ? error.message : "사진 저장에 실패했어요");
    } finally {
      URL.revokeObjectURL(preview);
      setPhotoSaving("");
    }
  }

  async function addMemory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!me) return;
    const form = new FormData(e.currentTarget);
    form.set("owner", me);
    setSaving(true);
    try {
      const response = await fetch("/api/memories", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems((current) => [data.memory, ...current.filter((m) => !m.id.startsWith("demo-"))]);
      setUpload(false);
      celebrate("새 추억이 파티에 입장했어요! 🥳", true);
    } catch (error) {
      celebrate(error instanceof Error && error.message ? error.message : "저장하지 못했어요");
    } finally {
      setSaving(false);
    }
  }

  async function openComments(memory: Memory) {
    if (memory.id.startsWith("demo-")) {
      celebrate("실제 추억을 올리면 댓글 파티가 열려요!");
      return;
    }
    setCommentMemory(memory);
    setComments([]);
    try {
      const data = await fetch(`/api/comments?memoryId=${memory.id}`).then((r) => r.json());
      setComments(data.comments || []);
    } catch {
      celebrate("댓글을 불러오지 못했어요");
    }
  }

  async function addComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!me || !commentMemory) return;
    const form = e.currentTarget;
    const body = String(new FormData(form).get("body") || "");
    setSaving(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memoryId: commentMemory.id, profileName: me, body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setComments(data.comments);
      form.reset();
      celebrate("댓글 폭죽 발사! 💬", true);
    } catch (error) {
      celebrate(error instanceof Error && error.message ? error.message : "댓글 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  function rollMission(index: number) {
    setMissionNames((current) => ({ ...current, [index]: randomName() }));
    setMissionRolls((current) => ({ ...current, [index]: (current[index] ?? 0) + 1 }));
  }

  function randomizeAllMissions() {
    const nextNames: Record<number, string> = {};
    const nextRolls: Record<number, number> = {};
    missions.forEach((_, i) => {
      nextNames[i] = randomName();
      nextRolls[i] = (missionRolls[i] ?? 0) + 1;
    });
    setMissionNames(nextNames);
    setMissionRolls(nextRolls);
    celebrate("오늘의 미션 주인공 전부 당첨! 🎲", true);
  }

  async function addRestaurant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!me) return;
    const form = new FormData(e.currentTarget);
    form.set("owner", me);
    setSaving(true);
    try {
      const response = await fetch("/api/restaurants", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRestaurants(data.restaurants);
      setRestaurantOpen(false);
      celebrate("우리 맛집 지도에 새 핀이 꽂혔어요! 🍽️", true);
    } catch (error) {
      celebrate(error instanceof Error && error.message ? error.message : "맛집 저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function voteRestaurant(id: string) {
    if (!me) {
      celebrate("먼저 내 프로필을 골라주세요!");
      return;
    }
    try {
      const response = await fetch("/api/restaurants", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ restaurantId: id, profileName: me }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRestaurants(data.restaurants);
      setPoppedVote(id);
      later(() => setPoppedVote((current) => (current === id ? "" : current)), 600);
      celebrate("먹으러 가자 투표 완료! 🙋");
    } catch (error) {
      celebrate(error instanceof Error && error.message ? error.message : "투표 실패");
    }
  }

  return (
    <main>
      {toast.message && <div className="toast" key={toast.id} role="status">{toast.message}</div>}
      {confetti.length > 0 && (
        <div className="confetti-burst" aria-hidden="true">
          {confetti.map((piece) => (
            <i
              key={piece.id}
              className={piece.shape}
              style={{ left: `${piece.left}%`, background: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s`, "--spin": `${piece.rotate}deg` } as CSSProperties}
            />
          ))}
        </div>
      )}
      <div className="floaty f1" aria-hidden="true">✦</div>
      <div className="floaty f2" aria-hidden="true">●</div>
      <div className="floaty f3" aria-hidden="true">▲</div>

      <header>
        <a href="#" className="logo"><b>₩</b><span>값진날</span></a>
        <nav className="top-actions">
          <button className="ghost-btn" onClick={() => document.getElementById("food")?.scrollIntoView({ behavior: "smooth" })}>🍽️ 맛집</button>
          <button className="upload-btn" onClick={() => requireProfile(() => setUpload(true))}>＋ 추억 올리기</button>
        </nav>
      </header>

      <section className="profile-stage">
        <div className="stage-copy">
          <span className="eyebrow">WHO ARE YOU?</span>
          <h1>오늘은 누구로<br /><em>파티에 입장할래?</em></h1>
          <p>회원가입은 없어요. 닉네임을 고르고 📷 버튼으로 내 사진을 붙여보세요.</p>
        </div>
        <div className="profile-grid">
          {profiles.map((p, i) => (
            <article
              key={p.name}
              className={me === p.name ? "picked" : ""}
              style={{ "--me": colorOf(p.name, i) } as CSSProperties}
              onClick={() => { setMe(p.name); celebrate(`${p.name}님, 파티 입장! 🎊`, me !== p.name); }}
            >
              <label className={`photo-picker ${photoSaving === p.name ? "loading" : ""}`} onClick={(e) => e.stopPropagation()}>
                {p.photo ? <img src={p.photo} alt={p.name} /> : <span>{avatarOf(p.name)}</span>}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => changePhoto(e, p.name)} aria-label={`${p.name} 프로필 사진 바꾸기`} />
                <i>{photoSaving === p.name ? "⏳" : "📷"}</i>
              </label>
              <b>{p.name}</b>
              <small>{isProfileName(p.name) ? PROFILE_STYLES[p.name].tagline : ""}</small>
              <em className="pick-label">{me === p.name ? "입장 완료 ✓" : "나로 선택"}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy}>MEMORIES ARE PRICELESS <b>★</b> 우리끼리 값 매기는 중 <b>★</b> GOOD VIBES ONLY <b>★</b> 오늘도 값진날 <b>★</b>&nbsp;</span>
          ))}
        </div>
      </section>

      <section className="dashboard">
        <div className="dash-head">
          <div>
            <span className="eyebrow">LIVE PARTY BOARD</span>
            <h2>지금 제일 값진 순간들</h2>
          </div>
          <div className="heat">
            <div><span>🌡️ 파티 온도</span><b>{heat}°</b></div>
            <div className="heat-bar"><i style={{ width: `${heat}%` }} /></div>
          </div>
        </div>
        <div className="memory-grid">
          {ranked.map((m, i) => (
            <article className={`memory-card ${i === 0 ? "top" : ""}`} key={m.id}>
              <div className="photo">
                <img src={m.image} alt={m.title} />
                <span className="rank">{i === 0 ? "👑 1위" : `#${i + 1}`}</span>
                <span className="votes">{m.ratingCount}/{names.length} 참여</span>
              </div>
              <div className="card-copy">
                <small>{m.date} · {m.place} · {m.owner}</small>
                <h3>{m.title}</h3>
                <div className="price"><span>현재 마음값</span><b>₩{won.format(m.value)}</b></div>
                <div className="card-actions">
                  <button onClick={() => requireProfile(() => openRating(m))}>내 값 더하기 ＋</button>
                  <button onClick={() => requireProfile(() => openComments(m))}>댓글 파티 💬</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="food-section" id="food">
        <div className="food-head">
          <div>
            <span className="eyebrow">FRIENDS&apos; FOOD MAP</span>
            <h2>우리끼리 검증한 찐맛집</h2>
            <p>누가 추천했는지 보고, 다음 모임 장소에 한 표!</p>
          </div>
          <button className="chunky-btn orange" onClick={() => requireProfile(() => setRestaurantOpen(true))}>＋ 맛집 추천하기</button>
        </div>
        <div className="food-filters">
          {foodCategories.map((category) => (
            <button key={category} className={foodFilter === category ? "active" : ""} onClick={() => setFoodFilter(category)}>{category}</button>
          ))}
        </div>
        {visibleRestaurants.length ? (
          <div className="food-grid">
            {visibleRestaurants.map((restaurant, index) => {
              const voted = restaurant.voters.includes(me);
              return (
                <article className="food-card" key={restaurant.id}>
                  <div className="food-photo">
                    <img src={restaurant.photo} alt={restaurant.name} />
                    <span>{restaurant.category}</span>
                    {index === 0 && restaurant.voteCount > 0 && <b>🔥 가장 가고 싶어!</b>}
                  </div>
                  <div className="food-copy">
                    <small>📍 {restaurant.location}</small>
                    <h3>{restaurant.name}</h3>
                    <div className="menu-line"><b>{restaurant.menu}</b><span>{restaurant.price}</span></div>
                    <p>“{restaurant.note}”</p>
                    <div className="recommender">
                      <i style={{ background: colorOf(restaurant.owner) }}>{avatarOf(restaurant.owner)}</i>
                      <span>{restaurant.owner} 추천</span>
                    </div>
                    <button className={`vote-btn ${voted ? "voted" : ""} ${poppedVote === restaurant.id ? "pop" : ""}`} onClick={() => voteRestaurant(restaurant.id)}>
                      {voted ? "갈래요 취소 ✓" : "나도 먹으러 갈래! 🙋"} <b>{restaurant.voteCount}</b>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="food-empty">
            <span>🍜</span>
            <h3>{restaurants.length ? "이 카테고리엔 아직 맛집이 없어요" : "아직 등록된 맛집이 없어요"}</h3>
            <p>첫 번째 맛집 큐레이터가 되어주세요!</p>
            <button className="chunky-btn orange" onClick={() => requireProfile(() => setRestaurantOpen(true))}>맛집 추천 시작</button>
          </div>
        )}
      </section>

      <section className="mission-gallery">
        <div className="mission-head">
          <div>
            <span className="eyebrow">RANDOM PARTY MISSION</span>
            <h2>웃음 터지는 미션 갤러리</h2>
            <p>카드마다 오늘의 주인공을 뽑고 바로 도전!</p>
          </div>
          <button className="chunky-btn yellow" onClick={randomizeAllMissions}>전부 랜덤 배정 🎲</button>
        </div>
        <div className="mission-grid">
          {missions.map((mission, i) => (
            <article key={mission.title} style={{ "--mission": mission.color } as CSSProperties}>
              <span>{mission.category}</span>
              <i>{mission.emoji}</i>
              <h3>{mission.title}</h3>
              <label key={missionRolls[i] ?? 0} className={missionRolls[i] ? "rolled" : ""}>
                오늘의 주인공
                <input value={missionNames[i] || ""} onChange={(e) => setMissionNames({ ...missionNames, [i]: e.target.value })} placeholder="이름 입력" />
              </label>
              <button onClick={() => { rollMission(i); celebrate("두근두근! 주인공 당첨 🎲"); }}>랜덤 이름 뽑기</button>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div className="logo"><b>₩</b><span>값진날</span></div>
        <p>가격은 숫자로, 추억은 진심으로.</p>
        <strong>{names.join(" · ")}</strong>
      </footer>

      {selected && (
        <div className="modal-bg" onMouseDown={() => setSelected(null)}>
          <form className="modal" onSubmit={rate} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setSelected(null)} aria-label="닫기">×</button>
            <span className="eyebrow">DROP YOUR PRICE</span>
            <div className="mini-memory">
              <img src={selected.image} alt="" />
              <div><small>{me}님의 차례!</small><h2>{selected.title}</h2></div>
            </div>
            <div className={`tier tier-${tier.level}`} key={tier.level}>
              <span>{tier.emoji}</span><b>{tier.label}</b>
            </div>
            <label>
              이 순간, 내 마음속 가격은?
              <div className="money">
                <span>₩</span>
                <input name="value" type="number" min="0" max="999999999" step="1000" value={ratingValue} onChange={(e) => setRatingValue(Number(e.target.value))} required />
              </div>
            </label>
            <div className="quick">
              {QUICK_PRICES.map((price) => (
                <button type="button" key={price} className={ratingValue === price ? "active" : ""} onClick={() => setRatingValue(price)}>₩{won.format(price)}</button>
              ))}
            </div>
            <button className="submit" disabled={saving}>{saving ? "마음값 보내는 중…" : "내 값 공개하기 🎉"}</button>
          </form>
        </div>
      )}

      {upload && (
        <div className="modal-bg" onMouseDown={() => setUpload(false)}>
          <form className="modal" onSubmit={addMemory} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setUpload(false)} aria-label="닫기">×</button>
            <span className="eyebrow">NEW MEMORY</span>
            <h2>파티에 새 추억 투척!</h2>
            <label className="drop"><input name="photo" type="file" accept="image/*" required /><b>📸 사진 고르기</b><small>최대 10MB</small></label>
            <label>추억 제목<input name="title" maxLength={80} placeholder="제목만 봐도 웃긴 그날" required /></label>
            <div className="two">
              <label>장소<input name="place" placeholder="강릉" required /></label>
              <label>첫 마음값<input name="value" type="number" min="0" step="1000" defaultValue="100000" required /></label>
            </div>
            <button className="submit" disabled={saving}>{saving ? "업로드 중…" : "추억 공개하기 🚀"}</button>
          </form>
        </div>
      )}

      {commentMemory && (
        <div className="modal-bg" onMouseDown={() => setCommentMemory(null)}>
          <section className="modal comment-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setCommentMemory(null)} aria-label="닫기">×</button>
            <span className="eyebrow">COMMENT PARTY</span>
            <h2>{commentMemory.title}</h2>
            <div className="comment-list">
              {comments.length ? (
                comments.map((c, i) => (
                  <article key={c.id}>
                    <b style={{ background: colorOf(c.profileName, i) }}>{avatarOf(c.profileName)}</b>
                    <div><strong>{c.profileName}<small>{c.date}</small></strong><p>{c.body}</p></div>
                  </article>
                ))
              ) : (
                <div className="empty-comment">첫 댓글의 주인공이 되어주세요 🎤</div>
              )}
            </div>
            <form onSubmit={addComment}>
              <label>한마디 투척!<textarea name="body" maxLength={240} placeholder="이 사진만 보면 아직도 웃겨 ㅋㅋㅋ" required /></label>
              <button className="submit" disabled={saving}>{saving ? "댓글 저장 중…" : "댓글 폭죽 발사 💬"}</button>
            </form>
          </section>
        </div>
      )}

      {restaurantOpen && (
        <div className="modal-bg" onMouseDown={() => setRestaurantOpen(false)}>
          <form className="modal restaurant-modal" onSubmit={addRestaurant} onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="x" onClick={() => setRestaurantOpen(false)} aria-label="닫기">×</button>
            <span className="eyebrow">SHARE YOUR SPOT</span>
            <h2>{me}의 찐맛집 공개!</h2>
            <label className="drop food-drop"><input name="photo" type="file" accept="image/*" required /><b>🍽️ 음식·가게 사진 고르기</b><small>최대 10MB</small></label>
            <div className="two">
              <label>가게 이름<input name="name" maxLength={60} placeholder="을지면옥" required /></label>
              <label>카테고리<select name="category" required>{foodCategories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
            </div>
            <label>위치<input name="location" maxLength={80} placeholder="을지로3가역 5번 출구" required /></label>
            <div className="two">
              <label>최애 메뉴<input name="menu" maxLength={60} placeholder="물냉면 + 편육" required /></label>
              <label>1인 예상 가격<input name="price" maxLength={30} placeholder="약 18,000원" required /></label>
            </div>
            <label>한줄평<textarea name="note" maxLength={160} placeholder="국물 한 입이면 해장 완료. 웨이팅도 용서됨!" required /></label>
            <button className="submit food-submit" disabled={saving}>{saving ? "맛집 지도에 핀 꽂는 중…" : "우리 맛집으로 등록 📍"}</button>
          </form>
        </div>
      )}
    </main>
  );
}
