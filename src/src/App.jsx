import { useState, useEffect, useCallback } from "react";

const WEEKS = [
  { label: "Неделя 1", dates: ["Пн 4.05", "Вт 5.05", "Ср 6.05", "Чт 7.05", "Пт 8.05"], hasMorning: true, hasEvening: false },
  { label: "Неделя 2", dates: ["Пн 11.05", "Вт 12.05", "Ср 13.05", "Чт 14.05", "Пт 15.05"], hasMorning: true, hasEvening: true },
  { label: "Неделя 3", dates: ["Пн 18.05", "Вт 19.05", "Ср 20.05", "Чт 21.05", "Пт 22.05"], hasMorning: true, hasEvening: true },
];

const MORNING_RITUAL = [
  { id: "water_lemon", label: "Стакан воды с лимоном" },
  { id: "food", label: "Авокадо + 2 яйца + йогурт" },
  { id: "water2l", label: "2 литра воды в течение дня" },
];

const EVENING_RITUAL = [
  { id: "kefir", label: "Стакан кефира на ужин" },
];

const BLOCKS = [
  {
    id: "b1", label: "Блок 1. Стопа и разогрев",
    items: [
      { id: "b1_1", label: "Носки на/от себя с резинкой", detail: "50 раз подряд" },
      { id: "b1_2", label: "Шарик под стопой", detail: "1 мин правая + 1 мин левая" },
      { id: "b1_3", label: "Сидя на валике", detail: "20 раз × 3 подхода" },
    ],
  },
  {
    id: "b2", label: "Блок 2. Колено и бедро",
    items: [
      { id: "b2_1", label: "Изометрия квадрицепса", detail: "5 сек × 20 повт." },
      { id: "b2_2", label: "Сгибание колена с резинкой", detail: "3 × 10 (трав. нога)" },
      { id: "b2_3", label: "Прогибание в колене на блоке", detail: "3 × 10 медл." },
      { id: "b2_4", label: "Подъём травм. ноги лёжа", detail: "10 × 3 (удерж. 5 сек)" },
      { id: "b2_5", label: "Подъём таза с резинкой", detail: "10 × 3" },
      { id: "b2_6", label: "Резинка, ноги в стороны (сидя)", detail: "20 × 3" },
      { id: "b2_7", label: "Резинка, нога вверх (лёжа на боку)", detail: "20 × 3" },
      { id: "b2_8", label: "Резинка под коленями, ноги в стороны", detail: "20 × 3" },
      { id: "b2_9", label: "Резинка на себя за стопы", detail: "20 × 3" },
    ],
  },
  {
    id: "b3", label: "Блок 3. Растяжка и корпус",
    items: [
      { id: "b3_1", label: "Наклон вперёд к ногам", detail: "15 сек × 3" },
      { id: "b3_2", label: "Наклон в бок", detail: "15 сек × 3" },
      { id: "b3_3", label: "Выгибания спины (сидя, упор руками)", detail: "15 сек × 3" },
      { id: "b3_4", label: "Планка на локтях", detail: "20 сек × 3" },
      { id: "b3_5", label: "Наклоны/тягивания стоя", detail: "10 сек × 3 (каждая сторона)" },
      { id: "b3_6", label: "Шея", detail: "10 сек × 3 (каждая сторона)" },
    ],
  },
  {
    id: "b4", label: "Блок 4. Руки с гантелями",
    items: [
      { id: "b4_1", label: "Руки вперёд, разводим в стороны", detail: "15 × 3" },
      { id: "b4_2", label: "Сгибание в локтях", detail: "15 × 3" },
      { id: "b4_3", label: "По бокам, руки вверх", detail: "15 × 3" },
    ],
  },
];

const EVENING_BLOCKS = [BLOCKS[1], BLOCKS[2]];

function buildKey(weekIdx, dayIdx, session, itemId) {
  return `w${weekIdx}_d${dayIdx}_${session}_${itemId}`;
}

function getAllKeys() {
  const keys = [];
  WEEKS.forEach((week, wIdx) => {
    week.dates.forEach((_, dIdx) => {
      const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
      sessions.forEach((session) => {
        const ritual = session === "morning" ? MORNING_RITUAL : [];
        const blocks = session === "morning" ? BLOCKS : EVENING_BLOCKS;
        ritual.forEach((r) => keys.push(buildKey(wIdx, dIdx, session, r.id)));
        if (!week.hasEvening) EVENING_RITUAL.forEach((r) => keys.push(buildKey(wIdx, dIdx, session, r.id)));
        if (session === "evening") EVENING_RITUAL.forEach((r) => keys.push(buildKey(wIdx, dIdx, session, r.id)));
        blocks.forEach((block) => block.items.forEach((item) => keys.push(buildKey(wIdx, dIdx, session, item.id))));
      });
    });
  });
  return keys;
}

export default function App() {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem("presurgery_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [openWeek, setOpenWeek] = useState(0);
  const [openDay, setOpenDay] = useState({ w: 0, d: 0 });
  const [openSession, setOpenSession] = useState("morning");

  const save = useCallback((newChecked) => {
    try { localStorage.setItem("presurgery_checklist", JSON.stringify(newChecked)); } catch {}
  }, []);

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    save(next);
  };

  const countForDay = (wIdx, dIdx, session) => {
    const week = WEEKS[wIdx];
    const ritual = session === "morning" ? MORNING_RITUAL : [];
    const blocks = session === "morning" ? BLOCKS : EVENING_BLOCKS;
    const eveningRitual = (!week.hasEvening && session === "morning") || session === "evening" ? EVENING_RITUAL : [];
    const items = [...ritual, ...eveningRitual, ...blocks.flatMap((b) => b.items)];
    const total = items.length;
    const done = items.filter((i) => checked[buildKey(wIdx, dIdx, session, i.id)]).length;
    return { done, total };
  };

  const weekProgress = (wIdx) => {
    const week = WEEKS[wIdx];
    let done = 0, total = 0;
    week.dates.forEach((_, dIdx) => {
      const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
      sessions.forEach((s) => { const c = countForDay(wIdx, dIdx, s); done += c.done; total += c.total; });
    });
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const totalProgress = () => {
    const all = getAllKeys();
    const done = all.filter((k) => checked[k]).length;
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  };

  const total = totalProgress();

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#f8f6f0", minHeight: "100vh", padding: "20px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .card { background: #fff; border: 1.5px solid #e2ddd6; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
        .row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; }
        .row:hover { background: #faf8f5; }
        .check { width: 18px; height: 18px; border: 1.5px solid #c8c0b4; border-radius: 4px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .check.done { background: #3d6b4f; border-color: #3d6b4f; }
        .progress-bar { height: 5px; background: #e8e4dc; border-radius: 3px; overflow: hidden; flex: 1; }
        .progress-fill { height: 100%; background: #3d6b4f; border-radius: 3px; transition: width 0.3s; }
        .item-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 14px 8px 20px; border-top: 1px solid #f0ece6; cursor: pointer; }
        .item-row:hover { background: #fdfcfb; }
        .block-header { padding: 8px 14px; background: #f8f6f0; border-top: 1px solid #eee9e0; font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #9a9080; }
        .item-label { font-size: 13px; color: #3a3530; line-height: 1.4; }
        .item-detail { font-size: 11px; color: #a09888; }
        .chevron { font-size: 10px; color: #c0b8ac; transition: transform 0.2s; display: inline-block; }
        .open > .chevron { transform: rotate(90deg); }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9080", marginBottom: 6 }}>Подготовка к операции</div>
        <div style={{ fontSize: 22, fontFamily: "'DM Serif Display', Georgia, serif", color: "#2a2520", marginBottom: 4 }}>Артроскопия ПКС</div>
        <div style={{ fontSize: 11, color: "#b0a898" }}>4 – 22 мая 2026 · 3 недели · 5 дней/нед</div>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2ddd6", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "#6a6058", fontWeight: 500 }}>Общий прогресс</span>
          <span style={{ fontSize: 13, color: "#3d6b4f", fontWeight: 500 }}>{total.done}/{total.total}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${total.pct}%` }} /></div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#b0a898", marginTop: 4 }}>{total.pct}%</div>
      </div>

      {WEEKS.map((week, wIdx) => {
        const wp = weekProgress(wIdx);
        const isOpen = openWeek === wIdx;
        return (
          <div key={wIdx} className="card">
            <div className={`row ${isOpen ? "open" : ""}`} onClick={() => setOpenWeek(isOpen ? -1 : wIdx)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#2a2520" }}>{week.label}</span>
                  <span style={{ fontSize: 10, color: "#b0a898" }}>{week.dates[0].split(" ")[1]} – {week.dates[4].split(" ")[1]}</span>
                  {week.hasEvening && <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 20, background: "#d6e8ff", color: "#1a4a8a" }}>утро + вечер</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${wp.pct}%` }} /></div>
                  <span style={{ fontSize: 11, color: "#a09888", whiteSpace: "nowrap" }}>{wp.done}/{wp.total}</span>
                </div>
              </div>
              <span className="chevron">▶</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid #eee9e0" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #eee9e0", background: "#faf8f5" }}>
                  {week.dates.map((date, dIdx) => {
                    const mC = countForDay(wIdx, dIdx, "morning");
                    const eC = week.hasEvening ? countForDay(wIdx, dIdx, "evening") : null;
                    const allDone = mC.done === mC.total && (!eC || eC.done === eC.total);
                    const active = openDay.w === wIdx && openDay.d === dIdx;
                    return (
                      <div key={dIdx} onClick={() => { setOpenDay({ w: wIdx, d: dIdx }); setOpenSession("morning"); }}
                        style={{ flex: 1, padding: "8px 4px", textAlign: "center", cursor: "pointer", fontSize: 10,
                          borderBottom: active ? "2px solid #3d6b4f" : "2px solid transparent",
                          color: active ? "#3d6b4f" : "#8a8078", fontWeight: active ? 500 : 400,
                          background: active ? "#fff" : "transparent" }}>
                        <div>{date.split(" ")[0]}</div>
                        <div style={{ color: allDone ? "#3d6b4f" : "#c8c0b4", fontSize: 14, marginTop: 1 }}>{allDone ? "✓" : "·"}</div>
                      </div>
                    );
                  })}
                </div>

                {openDay.w === wIdx && (() => {
                  const dIdx = openDay.d;
                  const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
                  return (
                    <div>
                      {week.hasEvening && (
                        <div style={{ display: "flex", borderBottom: "1px solid #eee9e0" }}>
                          {sessions.map((s) => {
                            const c = countForDay(wIdx, dIdx, s);
                            return (
                              <div key={s} onClick={() => setOpenSession(s)}
                                style={{ flex: 1, padding: "8px", textAlign: "center", cursor: "pointer",
                                  borderBottom: openSession === s ? "2px solid #3d6b4f" : "2px solid transparent",
                                  background: openSession === s ? "#fff" : "#faf8f5",
                                  fontSize: 11, color: openSession === s ? "#3d6b4f" : "#9a9080", fontWeight: 500 }}>
                                {s === "morning" ? "☀ Утро" : "◑ Вечер"} · {c.done}/{c.total}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <SessionItems wIdx={wIdx} dIdx={dIdx} session={week.hasEvening ? openSession : "morning"}
                        week={week} checked={checked} toggle={toggle} />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SessionItems({ wIdx, dIdx, session, week, checked, toggle }) {
  const ritual = session === "morning" ? MORNING_RITUAL : null;
  const blocks = session === "morning" ? BLOCKS : EVENING_BLOCKS;

  const renderItem = (item, key) => (
    <div key={key} className="item-row" onClick={() => toggle(key)} style={{ padding: "10px 14px 10px 20px" }}>
      <div className={`check ${checked[key] ? "done" : ""}`}>
        {checked[key] && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
      </div>
      <div>
        <div className="item-label" style={{ textDecoration: checked[key] ? "line-through" : "none", color: checked[key] ? "#b0a898" : "#3a3530" }}>
          {item.label}
        </div>
        {item.detail && <div className="item-detail">{item.detail}</div>}
      </div>
    </div>
  );

  return (
    <div>
      {ritual && (
        <>
          <div className="block-header">Утренний ритуал</div>
          {ritual.map((item) => renderItem(item, buildKey(wIdx, dIdx, session, item.id)))}
          {!week.hasEvening && (
            <>
              <div className="block-header">Ужин</div>
              {EVENING_RITUAL.map((item) => renderItem(item, buildKey(wIdx, dIdx, session, item.id)))}
            </>
          )}
        </>
      )}
      {session === "evening" && (
        <>
          <div className="block-header">Вечерний ритуал</div>
          {EVENING_RITUAL.map((item) => renderItem(item, buildKey(wIdx, dIdx, session, item.id)))}
        </>
      )}
      {blocks.map((block) => (
        <div key={block.id}>
          <div className="block-header">{block.label}</div>
          {block.items.map((item) => renderItem(item, buildKey(wIdx, dIdx, session, item.id)))}
        </div>
      ))}
    </div>
  );
}
