import { useState, useCallback } from "react";

const WEEKS = [
  { label: "Неделя 1", dates: ["Пн 4.05", "Вт 5.05", "Ср 6.05", "Чт 7.05", "Пт 8.05"], hasEvening: false },
  { label: "Неделя 2", dates: ["Пн 11.05", "Вт 12.05", "Ср 13.05", "Чт 14.05", "Пт 15.05"], hasEvening: true },
  { label: "Неделя 3", dates: ["Пн 18.05", "Вт 19.05", "Ср 20.05", "Чт 21.05", "Пт 22.05"], hasEvening: true },
];

const BUCCAL_DAYS = [0, 3];

const MORNING_ITEMS = [
  { id: "water_lemon", label: "Стакан тёплой воды с лимоном" },
  { id: "shower", label: "Контрастный душ" },
  { id: "food", label: "Авокадо + 2 яйца + йогурт" },
  { id: "water2l", label: "2 литра воды в течение дня" },
  { id: "face_massager", label: "Массаж лица массажёром" },
  { id: "gua_sha", label: "Гуаша + лёд на лицо" },
];

const EVENING_ITEMS = [
  { id: "no_food_after", label: "Не есть после 19:00" },
  { id: "kefir", label: "Стакан кефира" },
];

const NUTRITION_ITEMS = [
  { id: "protein", label: "Белок на каждый приём", detail: "яйца, творог, рыба, курица, мясо" },
  { id: "veggies", label: "Овощи некрахмалистые", detail: "огурцы, зелень, брокколи, кабачок, сельдерей" },
];

const EXERCISE_BLOCKS = [
  {
    id: "b1", label: "Блок 1. Стопа и разогрев",
    items: [
      { id: "b1_1", label: "Носки на/от себя с резинкой", detail: "20 раз" },
      { id: "b1_2", label: "Шарик под стопой", detail: "1 мин правая + 1 мин левая" },
    ],
  },
  {
    id: "b2", label: "Блок 2. Колено и бедро (× 3 подхода)",
    items: [
      { id: "b2_1", label: "Изометрия квадрицепса", detail: "10 сек" },
      { id: "b2_2", label: "Сгибание колена с резинкой", detail: "10 (трав. нога)" },
      { id: "b2_3", label: "Прогибание в колене на блоке", detail: "10 сек" },
      { id: "b2_4", label: "Подъём ног лёжа", detail: "10, удерж. 5 сек" },
      { id: "b2_5", label: "Подъём таза с резинкой", detail: "10" },
      { id: "b2_6", label: "Резинка, ноги в стороны (сидя)", detail: "10" },
      { id: "b2_7", label: "Резинка, нога вверх (лёжа на боку)", detail: "10" },
      { id: "b2_8", label: "Резинка под коленями, ноги в стороны", detail: "10" },
      { id: "b2_9", label: "Резинка на себя за стопы", detail: "10" },
      { id: "b2_10", label: "Сидя на валике вперёд-назад", detail: "10" },
    ],
  },
  {
    id: "b3", label: "Блок 3. Растяжка и корпус (× 3 подхода)",
    items: [
      { id: "b3_1", label: "Наклон вперёд к ногам", detail: "15 сек" },
      { id: "b3_2", label: "Наклон в бок", detail: "15 сек" },
      { id: "b3_3", label: "Выгибания спины (сидя, упор руками)", detail: "15 сек" },
      { id: "b3_4", label: "Планка на локтях", detail: "20 сек" },
      { id: "b3_5", label: "Шея", detail: "10 сек × 4 стороны" },
    ],
  },
  {
    id: "b4", label: "Блок 4. Руки с гантелями (× 3 подхода)",
    items: [
      { id: "b4_1", label: "Руки вперёд, разводим в стороны", detail: "10" },
      { id: "b4_2", label: "Сгибание в локтях", detail: "10" },
      { id: "b4_3", label: "По бокам, руки вверх", detail: "10" },
    ],
  },
];

const EVENING_EXERCISE_BLOCKS = [EXERCISE_BLOCKS[1], EXERCISE_BLOCKS[2]];

function buildKey(wIdx, dIdx, session, id) {
  return `w${wIdx}_d${dIdx}_${session}_${id}`;
}

function getDayItems(wIdx, dIdx, session) {
  const week = WEEKS[wIdx];
  const hasBuccal = BUCCAL_DAYS.includes(dIdx);
  if (session === "morning") {
    return [
      ...MORNING_ITEMS.map(i => ({ ...i, group: "Утренний ритуал" })),
      ...NUTRITION_ITEMS.map(i => ({ ...i, group: "Питание" })),
      ...(hasBuccal ? [{ id: "buccal", label: "Буккальный массаж", detail: "2 раза в неделю", group: "Уход" }] : []),
      ...(!week.hasEvening ? EVENING_ITEMS.map(i => ({ ...i, group: "Вечер" })) : []),
      ...EXERCISE_BLOCKS.flatMap(b => b.items.map(i => ({ ...i, group: b.label }))),
    ];
  } else {
    return [
      ...EVENING_ITEMS.map(i => ({ ...i, group: "Вечерний ритуал" })),
      ...(hasBuccal ? [{ id: "buccal", label: "Буккальный массаж", detail: "2 раза в неделю", group: "Уход" }] : []),
      ...EVENING_EXERCISE_BLOCKS.flatMap(b => b.items.map(i => ({ ...i, group: b.label }))),
    ];
  }
}

function countDay(wIdx, dIdx, session, checked) {
  const items = getDayItems(wIdx, dIdx, session);
  return { done: items.filter(i => checked[buildKey(wIdx, dIdx, session, i.id)]).length, total: items.length };
}

export default function App() {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pks2") || "{}"); } catch { return {}; }
  });
  const [openWeek, setOpenWeek] = useState(0);
  const [openDay, setOpenDay] = useState({ w: 0, d: 0 });
  const [openSession, setOpenSession] = useState("morning");

  const toggle = useCallback((key) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("pks2", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const weekPct = (wIdx) => {
    const week = WEEKS[wIdx];
    let done = 0, total = 0;
    week.dates.forEach((_, dIdx) => {
      const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
      sessions.forEach(s => { const c = countDay(wIdx, dIdx, s, checked); done += c.done; total += c.total; });
    });
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  const totalPct = () => {
    let done = 0, total = 0;
    WEEKS.forEach((week, wIdx) => {
      week.dates.forEach((_, dIdx) => {
        const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
        sessions.forEach(s => { const c = countDay(wIdx, dIdx, s, checked); done += c.done; total += c.total; });
      });
    });
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  const tot = totalPct();

  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: "#f8f6f0", minHeight: "100vh", padding: "20px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box}
        .card{background:#fff;border:1.5px solid #e2ddd6;border-radius:10px;margin-bottom:12px;overflow:hidden}
        .row{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer}
        .row:hover{background:#faf8f5}
        .check{width:18px;height:18px;border:1.5px solid #c8c0b4;border-radius:4px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .check.done{background:#3d6b4f;border-color:#3d6b4f}
        .pbar{height:5px;background:#e8e4dc;border-radius:3px;overflow:hidden;flex:1}
        .pfill{height:100%;background:#3d6b4f;border-radius:3px;transition:width .3s}
        .irow{display:flex;align-items:flex-start;gap:10px;padding:9px 14px 9px 20px;border-top:1px solid #f0ece6;cursor:pointer}
        .irow:hover{background:#fdfcfb}
        .bhead{padding:7px 14px;background:#f8f6f0;border-top:1px solid #eee9e0;font-size:10px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;color:#9a9080}
        .ilabel{font-size:13px;color:#3a3530;line-height:1.4}
        .idetail{font-size:11px;color:#a09888}
        .chev{font-size:10px;color:#c0b8ac;transition:transform .2s;display:inline-block}
        .open>.chev{transform:rotate(90deg)}
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9a9080", marginBottom: 6 }}>Подготовка к операции</div>
        <div style={{ fontSize: 22, fontFamily: "'DM Serif Display',Georgia,serif", color: "#2a2520", marginBottom: 4 }}>Артроскопия ПКС</div>
        <div style={{ fontSize: 11, color: "#b0a898" }}>4 – 22 мая 2026 · 3 недели · 5 дней/нед</div>
      </div>

      <div style={{ background: "#fff", border: "1.5px solid #e2ddd6", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "#6a6058", fontWeight: 500 }}>Общий прогресс</span>
          <span style={{ fontSize: 13, color: "#3d6b4f", fontWeight: 500 }}>{tot.done}/{tot.total}</span>
        </div>
        <div className="pbar"><div className="pfill" style={{ width: `${tot.pct}%` }} /></div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#b0a898", marginTop: 4 }}>{tot.pct}%</div>
      </div>

      {WEEKS.map((week, wIdx) => {
        const wp = weekPct(wIdx);
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
                  <div className="pbar"><div className="pfill" style={{ width: `${wp.pct}%` }} /></div>
                  <span style={{ fontSize: 11, color: "#a09888", whiteSpace: "nowrap" }}>{wp.done}/{wp.total}</span>
                </div>
              </div>
              <span className="chev">▶</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: "1px solid #eee9e0" }}>
                <div style={{ display: "flex", borderBottom: "1px solid #eee9e0", background: "#faf8f5" }}>
                  {week.dates.map((date, dIdx) => {
                    const mC = countDay(wIdx, dIdx, "morning", checked);
                    const eC = week.hasEvening ? countDay(wIdx, dIdx, "evening", checked) : null;
                    const allDone = mC.done === mC.total && (!eC || eC.done === eC.total);
                    const active = openDay.w === wIdx && openDay.d === dIdx;
                    const hasBuccal = BUCCAL_DAYS.includes(dIdx);
                    return (
                      <div key={dIdx} onClick={() => { setOpenDay({ w: wIdx, d: dIdx }); setOpenSession("morning"); }}
                        style={{ flex: 1, padding: "7px 2px", textAlign: "center", cursor: "pointer", fontSize: 10,
                          borderBottom: active ? "2px solid #3d6b4f" : "2px solid transparent",
                          color: active ? "#3d6b4f" : "#8a8078", fontWeight: active ? 500 : 400,
                          background: active ? "#fff" : "transparent" }}>
                        <div>{date.split(" ")[0]}</div>
                        <div style={{ color: allDone ? "#3d6b4f" : "#c8c0b4", fontSize: 13, marginTop: 1 }}>{allDone ? "✓" : "·"}</div>
                        {hasBuccal && <div style={{ fontSize: 8, color: "#c4a882", marginTop: 1 }}>букк</div>}
                      </div>
                    );
                  })}
                </div>

                {openDay.w === wIdx && (() => {
                  const dIdx = openDay.d;
                  const sessions = week.hasEvening ? ["morning", "evening"] : ["morning"];
                  const session = week.hasEvening ? openSession : "morning";
                  const items = getDayItems(wIdx, dIdx, session);
                  const groups = [];
                  items.forEach(item => {
                    const last = groups[groups.length - 1];
                    if (!last || last.name !== item.group) groups.push({ name: item.group, items: [item] });
                    else last.items.push(item);
                  });
                  return (
                    <div>
                      {week.hasEvening && (
                        <div style={{ display: "flex", borderBottom: "1px solid #eee9e0" }}>
                          {sessions.map(s => {
                            const c = countDay(wIdx, dIdx, s, checked);
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
                      {groups.map(group => (
                        <div key={group.name}>
                          <div className="bhead">{group.name}</div>
                          {group.items.map(item => {
                            const key = buildKey(wIdx, dIdx, session, item.id);
                            return (
                              <div key={key} className="irow" onClick={() => toggle(key)}>
                                <div className={`check ${checked[key] ? "done" : ""}`}>
                                  {checked[key] && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                                </div>
                                <div>
                                  <div className="ilabel" style={{ textDecoration: checked[key] ? "line-through" : "none", color: checked[key] ? "#b0a898" : "#3a3530" }}>
                                    {item.label}
                                  </div>
                                  {item.detail && <div className="idetail">{item.detail}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
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
