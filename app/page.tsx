"use client";

import { useMemo, useState } from "react";

type AvatarConfig = { hair: number; face: number; outfit: number };
type Memory = { id:number; title:string; date:string; place:string; owner:string; value:number; image:string; accent:string };

const memories: Memory[] = [
  { id:1, title:"우리가 바다를 전세 낸 날", date:"2025. 08. 17", place:"강릉", owner:"민지", value:1280000, accent:"#9d6cff", image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85" },
  { id:2, title:"새벽 세 시, 한강 라면", date:"2025. 05. 04", place:"반포", owner:"준호", value:890000, accent:"#ff7b54", image:"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85" },
  { id:3, title:"첫 단체 여행에서 길을 잃다", date:"2024. 12. 28", place:"삿포로", owner:"서연", value:720000, accent:"#49a98f", image:"https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=85" },
  { id:4, title:"비 맞으며 뛰었던 우리", date:"2024. 07. 13", place:"연남동", owner:"태오", value:510000, accent:"#5f7cff", image:"https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?auto=format&fit=crop&w=1200&q=85" },
];

const hairOptions = ["소프트 컷", "웨이브", "쇼트", "포니테일"];
const faceOptions = ["미소", "윙크", "새침", "활짝"];
const outfitOptions = ["라일락", "차콜", "민트", "코랄"];
const won = new Intl.NumberFormat("ko-KR");

export default function Home() {
  const [tab, setTab] = useState<"archive"|"ranking">("archive");
  const [filter, setFilter] = useState("전체");
  const [signupOpen, setSignupOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>({ hair:0, face:0, outfit:0 });
  const [items, setItems] = useState(memories);

  const ranked = useMemo(() => [...items].sort((a,b) => b.value-a.value), [items]);
  const visible = filter === "전체" ? items : items.filter((item) => item.place === filter);

  function addMemory(formData: FormData) {
    setItems((current) => [{
      id:Date.now(), title:String(formData.get("title") || "새로운 우리 이야기"),
      place:String(formData.get("place") || "어딘가"), value:Number(formData.get("value") || 100000),
      date:"오늘", owner:"나", accent:"#9d6cff",
      image:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
    }, ...current]);
    setUploadOpen(false);
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top"><i>V</i> 값진날</a>
      <nav aria-label="주요 메뉴">
        <button className={tab === "archive" ? "active" : ""} onClick={() => setTab("archive")}>아카이브</button>
        <button className={tab === "ranking" ? "active" : ""} onClick={() => setTab("ranking")}>랭킹</button>
        <button onClick={() => document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}>사용법</button>
      </nav>
      <div className="header-actions">
        {joined ? <button className="profile-pill" onClick={() => setSignupOpen(true)}><Avatar config={avatar} mini/><span>나의 프로필</span></button> : <button className="login" onClick={() => setSignupOpen(true)}>로그인</button>}
        <button className="button dark compact" onClick={() => joined ? setUploadOpen(true) : setSignupOpen(true)}><span className="plus">＋</span> 추억 올리기</button>
      </div>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="live-pill"><span/> 12명의 친구가 함께 기록 중</div>
        <h1>우리의 순간은<br/><strong>얼마나 값질까?</strong></h1>
        <p>사진에 마음만큼의 가격을 붙이고, 친구들과 가장 값진 순간을 발견해보세요. 우리끼리 만드는 사적인 추억 아카이브.</p>
        <div className="hero-actions">
          <button className="button violet" onClick={() => joined ? setUploadOpen(true) : setSignupOpen(true)}>첫 추억 기록하기 <span>↗</span></button>
          <button className="button light" onClick={() => { setTab("ranking"); document.getElementById("archive")?.scrollIntoView({behavior:"smooth"}); }}>이번 달 랭킹 보기</button>
        </div>
        <div className="social-proof"><div className="avatar-stack"><Avatar config={{hair:1,face:0,outfit:2}} mini/><Avatar config={{hair:2,face:1,outfit:1}} mini/><Avatar config={{hair:3,face:3,outfit:3}} mini/></div><span><b>38개의 순간</b>이 이번 달에 추가됐어요</span></div>
      </div>
      <div className="hero-visual">
        <div className="ambient a1"/><div className="ambient a2"/>
        <article className="feature-photo">
          <img src={memories[0].image} alt="바다에서 함께한 여름날"/>
          <div className="photo-overlay"><span>이번 달 1위</span><strong>₩1,280,000</strong></div>
        </article>
        <article className="floating-card"><img src={memories[2].image} alt="함께 떠난 여행"/><div><span>삿포로 · 2024</span><b>길을 잃어도 함께</b></div></article>
        <div className="reaction">♥ <span>24</span></div>
      </div>
    </section>

    <section className="archive-section" id="archive">
      <div className="section-top">
        <div><span className="kicker">{tab === "archive" ? "MEMORY ARCHIVE" : "MONTHLY RANKING"}</span><h2>{tab === "archive" ? "최근에 쌓인 순간들" : "이번 달, 가장 값진 순간"}</h2></div>
        {tab === "archive" && <div className="filters">{["전체","강릉","반포","삿포로","연남동"].map((place) => <button key={place} className={filter === place ? "selected" : ""} onClick={() => setFilter(place)}>{place}</button>)}</div>}
      </div>
      {tab === "archive" ? <div className="memory-grid">{visible.map((memory) => <MemoryCard key={memory.id} memory={memory} rank={ranked.findIndex((item) => item.id === memory.id)+1}/>)}</div> :
        <div className="ranking-list">{ranked.map((memory,index) => <article className="rank-row" key={memory.id}><span className="rank-no">{String(index+1).padStart(2,"0")}</span><img src={memory.image} alt=""/><div className="rank-info"><small>{memory.date} · {memory.place}</small><h3>{memory.title}</h3><span>{memory.owner}의 추억</span></div><div className="rank-price"><strong>₩{won.format(memory.value)}</strong><small>{index === 0 ? "이번 달 최고가" : `1위까지 ₩${won.format(ranked[0].value-memory.value)}`}</small></div></article>)}</div>}
    </section>

    <section className="about" id="about">
      <div><span className="kicker">HOW IT WORKS</span><h2>기록은 가볍게,<br/>추억은 오래도록.</h2></div>
      <div className="process"><article><span>01</span><i>⌁</i><h3>친구들과 방 만들기</h3><p>초대 링크 하나로 우리만의 비공개 공간을 열어요.</p></article><article><span>02</span><i>▣</i><h3>사진과 이야기 올리기</h3><p>사진, 장소와 함께 그날의 이야기를 짧게 남겨요.</p></article><article><span>03</span><i>₩</i><h3>마음의 가격 정하기</h3><p>각자의 금액을 더해 가장 값진 추억을 발견해요.</p></article></div>
    </section>

    <footer><a className="brand" href="#top"><i>V</i> 값진날</a><p>가격은 재미로, 추억은 진심으로.</p><span>© 2026 GJINNAL</span></footer>

    {signupOpen && <div className="modal-backdrop" onMouseDown={() => setSignupOpen(false)}><section className="modal avatar-modal" onMouseDown={(e) => e.stopPropagation()}>
      <button className="close" aria-label="닫기" onClick={() => setSignupOpen(false)}>×</button>
      <div className="modal-heading"><span className="kicker">CREATE YOUR AVATAR</span><h2>나만의 모습으로<br/>우리 방에 입장해요</h2><p>마음에 드는 조합을 골라보세요.</p></div>
      <div className="avatar-builder">
        <div className="builder-preview"><div className="preview-glow"/><Avatar config={avatar}/><button className="shuffle" onClick={() => setAvatar({hair:Math.floor(Math.random()*4),face:Math.floor(Math.random()*4),outfit:Math.floor(Math.random()*4)})}>↻ 랜덤 조합</button></div>
        <div className="builder-controls">
          <OptionGroup title="헤어" values={hairOptions} selected={avatar.hair} onSelect={(hair) => setAvatar({...avatar,hair})}/>
          <OptionGroup title="얼굴" values={faceOptions} selected={avatar.face} onSelect={(face) => setAvatar({...avatar,face})}/>
          <OptionGroup title="의상" values={outfitOptions} selected={avatar.outfit} onSelect={(outfit) => setAvatar({...avatar,outfit})} swatches/>
        </div>
      </div>
      <label className="field">닉네임<input defaultValue="값진이" placeholder="친구들이 알아볼 이름"/></label>
      <button className="button violet full" onClick={() => {setJoined(true);setSignupOpen(false)}}>이 모습으로 시작하기 <span>↗</span></button>
    </section></div>}

    {uploadOpen && <div className="modal-backdrop" onMouseDown={() => setUploadOpen(false)}><form className="modal upload-modal" action={addMemory} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="close" aria-label="닫기" onClick={() => setUploadOpen(false)}>×</button><div className="modal-heading left"><span className="kicker">NEW MEMORY</span><h2>새로운 순간 기록하기</h2></div><div className="dropzone"><span>＋</span><b>사진을 선택하거나 끌어다 놓으세요</b><small>JPG, PNG · 최대 10MB</small></div><label className="field">추억 제목<input name="title" required placeholder="우리가 바다를 전세 낸 날"/></label><div className="field-row"><label className="field">장소<input name="place" required placeholder="강릉"/></label><label className="field">내가 매긴 값<input name="value" type="number" min="0" step="1000" defaultValue="100000"/></label></div><button className="button violet full" type="submit">추억 보관하기 <span>↗</span></button></form></div>}
  </main>;
}

function OptionGroup({title,values,selected,onSelect,swatches=false}:{title:string;values:string[];selected:number;onSelect:(i:number)=>void;swatches?:boolean}) {
  return <div className="option-group"><div className="option-title"><b>{title}</b><span>{selected+1} / {values.length}</span></div><div className={`option-list ${swatches ? "swatches" : ""}`}>{values.map((value,index) => <button key={value} className={selected === index ? "selected" : ""} onClick={() => onSelect(index)}>{swatches && <i className={`swatch swatch-${index}`}/>}<span>{value}</span></button>)}</div></div>;
}

function Avatar({config,mini=false}:{config:AvatarConfig;mini?:boolean}) {
  return <div className={`avatar avatar-${mini ? "mini" : "large"} outfit-${config.outfit}`} aria-label={`${hairOptions[config.hair]}, ${faceOptions[config.face]}, ${outfitOptions[config.outfit]} 아바타`}>
    <div className={`hair hair-${config.hair}`}/><div className="ear left"/><div className="ear right"/><div className="head"><div className={`face face-${config.face}`}><i className="eye left"/><i className="eye right"/><i className="mouth"/></div></div><div className="neck"/><div className="body"><i className="collar left"/><i className="collar right"/></div>
  </div>;
}

function MemoryCard({memory,rank}:{memory:Memory;rank:number}) {
  return <article className="memory-card"><div className="photo-wrap"><img src={memory.image} alt={memory.title}/><span className="rank-badge">#{rank}</span><button aria-label="좋아요">♡</button></div><div className="card-content"><div className="meta"><span>{memory.date}</span><i/><span>{memory.place}</span></div><h3>{memory.title}</h3><div className="card-bottom"><div className="owner"><span style={{background:memory.accent}}>{memory.owner[0]}</span><div><small>올린 사람</small><b>{memory.owner}</b></div></div><div className="memory-value"><small>추억의 값</small><b>₩{won.format(memory.value)}</b></div></div></div></article>;
}
