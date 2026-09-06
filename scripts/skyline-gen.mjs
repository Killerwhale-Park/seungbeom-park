import { writeFile } from "node:fs/promises";

const W = 1600;
const H = 460;
const CITY_Y = 258;
const BANK_Y = 402;

const SHORE_PTS = [
  [0, 243], [340, 250], [700, 262], [1000, 268], [1250, 262], [1450, 250], [1600, 243],
];

function shore(x) {
  for (let i = 0; i < SHORE_PTS.length - 1; i += 1) {
    const [x0, y0] = SHORE_PTS[i];
    const [x1, y1] = SHORE_PTS[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      const e = (1 - Math.cos(t * Math.PI)) / 2;
      return y0 + (y1 - y0) * e;
    }
  }
  return SHORE_PTS[x < 0 ? 0 : SHORE_PTS.length - 1][1];
}

function shorePath() {
  const pts = [];
  for (let x = 0; x <= W; x += 40) pts.push(`${x} ${shore(x).toFixed(1)}`);
  return pts.join(" L");
}

const BR2 = { farX: 700, farY: shore(700), nearX: 1502, nearY: 410 };

function deckTop(x) {
  const t = (x - BR2.farX) / (BR2.nearX - BR2.farX);
  return BR2.farY + t * (BR2.nearY - BR2.farY);
}

function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const geo = {};

geo.ridges = [
  `M0 ${CITY_Y - 58} L230 ${CITY_Y - 92} L470 ${CITY_Y - 64} L720 ${CITY_Y - 100} L980 ${CITY_Y - 70} L1230 ${CITY_Y - 110} L1420 ${CITY_Y - 136} L1600 ${CITY_Y - 150} L1600 ${CITY_Y + 16} L0 ${CITY_Y + 16} Z`,
  `M0 ${CITY_Y - 26} L280 ${CITY_Y - 46} L560 ${CITY_Y - 30} L860 ${CITY_Y - 54} L1160 ${CITY_Y - 34} L1440 ${CITY_Y - 66} L1600 ${CITY_Y - 78} L1600 ${CITY_Y + 16} L0 ${CITY_Y + 16} Z`,
];

const G0 = 330;

geo.gate = (() => {
  const x = 60;
  const baseT = 275;
  const shapes = [];
  shapes.push({ k: "stone", d: `M${x} ${G0} L${x + 3} ${baseT} L${x + 187} ${baseT} L${x + 190} ${G0} Z` });
  shapes.push({ k: "stone", d: `M${x + 1} ${baseT} L${x + 189} ${baseT} L${x + 189} ${baseT - 4} L${x + 1} ${baseT - 4} Z` });
  shapes.push({ k: "wall", d: `M${x + 24} ${baseT - 4} L${x + 166} ${baseT - 4} L${x + 166} ${255} L${x + 24} ${255} Z` });
  shapes.push({ k: "roof", d: `M${x + 4} ${252} Q${x + 30} ${247} ${x + 91} ${246} L${x + 99} ${246} Q${x + 160} ${247} ${x + 186} ${252} L${x + 166} ${238} L${x + 164} ${238} L${x + 164} ${252} L${x + 26} ${252} L${x + 26} ${238} L${x + 24} ${238} Z` });
  shapes.push({ k: "roof", d: `M${x + 4} ${252} Q${x + 95} ${258} ${x + 186} ${252} Q${x + 95} ${262} ${x + 4} ${252} Z` });
  shapes.push({ k: "roofband", d: `M${x + 26} ${252} L${x + 164} ${252} L${x + 164} ${238} L${x + 26} ${238} Z` });
  shapes.push({ k: "wall", d: `M${x + 30} ${238} L${x + 160} ${238} L${x + 160} ${224} L${x + 30} ${224} Z` });
  shapes.push({ k: "roof", d: `M${x - 2} ${228} Q${x + 40} ${222} ${x + 62} ${200} L${x + 128} ${200} Q${x + 150} ${222} ${x + 192} ${228} Q${x + 95} ${236} ${x - 2} ${228} Z` });
  shapes.push({ k: "roof", d: `M${x + 58} ${200} L${x + 132} ${200} L${x + 132} ${195} L${x + 58} ${195} Z` });
  shapes.push({ k: "roof", d: `M${x + 52} ${195} Q${x + 55} ${185} ${x + 62} ${187} L${x + 62} ${195} Z` });
  shapes.push({ k: "roof", d: `M${x + 138} ${195} Q${x + 135} ${185} ${x + 128} ${187} L${x + 128} ${195} Z` });
  for (const [jx, jy] of [[34, 218], [44, 212], [54, 206], [156, 218], [146, 212], [136, 206]]) {
    shapes.push({ k: "roof", d: `M${x + jx} ${jy} l5 0 l0 -4 l-5 0 Z` });
  }
  const arches = [
    { cx: x + 95, w: 26, h: 36 },
    { cx: x + 47, w: 19, h: 28 },
    { cx: x + 143, w: 19, h: 28 },
  ].map((a) => ({
    k: "arch",
    d: `M${a.cx - a.w / 2} ${G0} L${a.cx - a.w / 2} ${G0 - a.h + a.w / 2} A${a.w / 2} ${a.w / 2} 0 0 1 ${a.cx + a.w / 2} ${G0 - a.h + a.w / 2} L${a.cx + a.w / 2} ${G0} Z`,
  }));
  shapes.push(...arches);
  shapes.push({ k: "sign", d: `M${x + 82} ${242} L${x + 108} ${242} L${x + 108} ${250} L${x + 82} ${250} Z` });
  shapes.push({ k: "eaveglow", d: `M${x + 8} ${253} Q${x + 95} ${259} ${x + 182} ${253}`, stroke: true });
  shapes.push({ k: "eaveglow", d: `M${x + 2} ${229} Q${x + 95} ${237} ${x + 188} ${229}`, stroke: true });
  return shapes;
})();

const N = { cx: 415, hillL: 205, hillR: 630, peak: 200 };
geo.namsan = (() => {
  const { cx, peak } = N;
  const shapes = [];
  shapes.push({ k: "hill", d: `M${N.hillL} ${G0 + 10} Q${cx - 90} ${peak + 26} ${cx - 42} ${peak + 4} L${cx + 42} ${peak + 4} Q${cx + 100} ${peak + 22} ${N.hillR} ${G0 + 10} Z` });
  shapes.push({ k: "body", d: `M${cx - 34} ${peak + 10} L${cx + 34} ${peak + 10} L${cx + 30} ${peak - 8} L${cx - 30} ${peak - 8} Z` });
  shapes.push({ k: "winrow", d: `M${cx - 26} ${peak - 1} L${cx + 26} ${peak - 1} L${cx + 26} ${peak - 5} L${cx - 26} ${peak - 5} Z` });
  const shTop = peak - 62;
  shapes.push({ k: "body", d: `M${cx - 6.5} ${peak - 8} C${cx - 5.5} ${peak - 30} ${cx - 5} ${shTop + 14} ${cx - 5} ${shTop} L${cx + 5} ${shTop} C${cx + 5} ${shTop + 14} ${cx + 5.5} ${peak - 30} ${cx + 6.5} ${peak - 8} Z` });
  shapes.push({ k: "body", d: `M${cx - 9} ${peak - 34} L${cx + 9} ${peak - 34} L${cx + 9} ${peak - 37} L${cx - 9} ${peak - 37} Z` });
  const podB = shTop;
  const podT = shTop - 26;
  shapes.push({ k: "body", d: `M${cx - 8.5} ${podB} L${cx - 16} ${podT + 4} L${cx + 16} ${podT + 4} L${cx + 8.5} ${podB} Z` });
  shapes.push({ k: "podwin", d: `M${cx - 14.5} ${podT + 8} L${cx + 14.5} ${podT + 8} L${cx + 13.5} ${podT + 13} L${cx - 13.5} ${podT + 13} Z` });
  shapes.push({ k: "podwin", d: `M${cx - 12.5} ${podT + 16} L${cx + 12.5} ${podT + 16} L${cx + 11.8} ${podT + 20} L${cx - 11.8} ${podT + 20} Z` });
  shapes.push({ k: "body", d: `M${cx - 17} ${podT + 4} L${cx + 17} ${podT + 4} L${cx + 17} ${podT} L${cx - 17} ${podT} Z` });
  shapes.push({ k: "body", d: `M${cx - 10} ${podT} Q${cx} ${podT - 7} ${cx + 10} ${podT} Z` });
  const aB = podT - 5;
  const aT = podT - 78;
  shapes.push({ k: "mast", d: `M${cx - 3} ${aB} L${cx + 3} ${aB} L${cx + 0.8} ${aT} L${cx - 0.8} ${aT} Z` });
  shapes.push({ k: "mast", d: `M${cx - 5} ${aB - 18} L${cx + 5} ${aB - 18} L${cx + 5} ${aB - 20.5} L${cx - 5} ${aB - 20.5} Z` });
  shapes.push({ k: "mast", d: `M${cx - 4} ${aB - 38} L${cx + 4} ${aB - 38} L${cx + 4} ${aB - 40} L${cx - 4} ${aB - 40} Z` });
  shapes.push({ k: "beacon", d: `M${cx - 1.6} ${aT} L${cx + 1.6} ${aT} L${cx + 1.2} ${aT - 4} L${cx - 1.2} ${aT - 4} Z` });
  return shapes;
})();

const B63 = { left: 1155, right: 1235, top: 142 };
geo.b63 = (() => {
  const { left, right, top } = B63;
  const shapes = [];
  shapes.push({ k: "gold", d: `M${left} ${G0} C${left + 4} 240 ${left + 12} 178 ${left + 22} ${top} L${right - 22} ${top} C${right - 12} 178 ${right - 4} 240 ${right} ${G0} Z` });
  shapes.push({ k: "body", d: `M${left + 24} ${top + 8} L${right - 24} ${top + 8} L${right - 24} ${top + 11} L${left + 24} ${top + 11} Z` });
  shapes.push({ k: "mast", d: `M${left + 30} ${top} L${left + 31.5} ${top} L${left + 31.5} ${top - 16} L${left + 30} ${top - 16} Z` });
  const rng = seededRng(0x63);
  const wins = [];
  for (let y = top + 16; y < G0 - 8; y += 8) {
    const progress = (y - top) / (G0 - top);
    const inset = 8 + 16 * Math.pow(1 - progress, 1.5);
    for (let wx = left + inset; wx < right - inset - 3; wx += 10) {
      if (rng() > 0.66) continue;
      wins.push([Math.round(wx), y]);
    }
  }
  shapes.push({ k: "goldwins", wins });
  return shapes;
})();

const L = { cx: 1452, wBase: 46, top: 34 };
geo.lotte = (() => {
  const { cx, wBase, top } = L;
  const solidTop = top + 52;
  const shapes = [];
  shapes.push({ k: "body", d: `M${cx - wBase / 2} ${G0} C${cx - wBase / 2 + 7} ${G0 - 110} ${cx - 10} ${solidTop + 60} ${cx - 7.5} ${solidTop} L${cx + 7.5} ${solidTop} C${cx + 10} ${solidTop + 60} ${cx + wBase / 2 - 7} ${G0 - 110} ${cx + wBase / 2} ${G0} Z` });
  shapes.push({ k: "lattice", d: `M${cx - 7.5} ${solidTop} C${cx - 6.5} ${solidTop - 22} ${cx - 5} ${top + 18} ${cx - 3.5} ${top} L${cx + 5.5} ${top + 10} C${cx + 6.5} ${top + 26} ${cx + 7} ${solidTop - 20} ${cx + 7.5} ${solidTop} Z` });
  const rng = seededRng(0x1077);
  const wins = [];
  for (let y = solidTop + 16; y < G0 - 10; y += 11) {
    const t = (y - top) / (G0 - top);
    const half = 4 + (wBase / 2 - 5) * Math.pow(t, 1.25);
    const cols = Math.max(1, Math.floor(half / 5));
    for (let i = -cols; i <= cols; i += 1) {
      if (rng() > 0.4) continue;
      wins.push([cx + (i * half) / (cols + 0.5), y]);
    }
  }
  shapes.push({ k: "lottewins", wins });
  return shapes;
})();

geo.ddp = (() => {
  const shapes = [];
  shapes.push({ k: "ddp", d: `M478 ${CITY_Y} C492 ${CITY_Y - 28} 518 ${CITY_Y - 36} 542 ${CITY_Y - 35} C576 ${CITY_Y - 36} 598 ${CITY_Y - 19} 608 ${CITY_Y} Z` });
  shapes.push({ k: "ddpseam", d: `M494 ${CITY_Y - 15} C526 ${CITY_Y - 26} 572 ${CITY_Y - 26} 600 ${CITY_Y - 10}`, stroke: true });
  shapes.push({ k: "ddpseam", d: `M486 ${CITY_Y - 7} C530 ${CITY_Y - 20} 578 ${CITY_Y - 20} 605 ${CITY_Y - 4}`, stroke: true });
  const rng = seededRng(0xdd9);
  const dots = [];
  for (let i = 0; i < 30; i += 1) {
    const t = rng();
    const dx = 486 + t * 114;
    const arc = 1 - Math.pow(Math.abs((dx - 543) / 64), 1.7);
    const yTop = CITY_Y - Math.max(3, arc * 32);
    dots.push([dx, yTop + rng() * (CITY_Y - 3 - yTop)]);
  }
  shapes.push({ k: "ddpdots", dots });
  return shapes;
})();

geo.sebit = (() => {
  const base = 372;
  return {
    platform: `M1136 ${base} L1338 ${base} L1343 ${base + 6} L1131 ${base + 6} Z`,
    pavilions: [
      { d: `M1163 ${base} C1159 ${base - 20} 1167 ${base - 38} 1188 ${base - 42} C1213 ${base - 45} 1228 ${base - 26} 1226 ${base} Z`, seam: `M1172 ${base - 6} C1170 ${base - 22} 1180 ${base - 34} 1194 ${base - 38}`, tone: "mint" },
      { d: `M1243 ${base} C1240 ${base - 16} 1248 ${base - 31} 1266 ${base - 34} C1287 ${base - 36} 1297 ${base - 20} 1295 ${base} Z`, seam: `M1251 ${base - 5} C1250 ${base - 18} 1258 ${base - 27} 1270 ${base - 30}`, tone: "rose" },
      { d: `M1303 ${base} C1301 ${base - 11} 1307 ${base - 21} 1319 ${base - 23} C1333 ${base - 24} 1339 ${base - 13} 1337 ${base} Z`, seam: `M1309 ${base - 4} C1309 ${base - 12} 1314 ${base - 18} 1321 ${base - 20}`, tone: "warm" },
    ],
  };
})();

geo.island = (() => {
  const land = `M236 332 Q266 302 390 295 Q530 290 626 306 Q652 318 640 334 Q520 350 380 350 Q286 346 236 332 Z`;
  const trees = [
    [302, 8], [342, 10], [508, 9], [552, 11], [598, 7], [264, 6],
  ].map(([tx, r]) => `M${tx - r} ${300 + (tx % 3)} Q${tx} ${300 + (tx % 3) - r * 1.8} ${tx + r} ${300 + (tx % 3)} Z`);
  const shoreLights = [];
  for (let lx = 276; lx < 630; lx += 34) shoreLights.push([lx, 304 + ((lx / 34) % 3)]);
  return { land, trees, shoreLights };
})();

geo.bridge = (() => {
  const shapes = [];
  const thick = (t) => 2.5 + t * 7;
  const steps = [];
  for (let i = 0; i <= 20; i += 1) steps.push(i / 20);
  const topEdge = steps.map((t) => {
    const x = BR2.farX + t * (BR2.nearX - BR2.farX);
    return `${x.toFixed(1)} ${deckTop(x).toFixed(1)}`;
  });
  const botEdge = steps.slice().reverse().map((t) => {
    const x = BR2.farX + t * (BR2.nearX - BR2.farX);
    return `${x.toFixed(1)} ${(deckTop(x) + thick(t)).toFixed(1)}`;
  });
  shapes.push({ k: "bridge", d: `M${topEdge.join(" L")} L${botEdge.join(" L")} Z` });
  shapes.push({ k: "bridge", d: `M${steps.map((t) => { const x = BR2.farX + t * (BR2.nearX - BR2.farX); return `${x.toFixed(1)} ${(deckTop(x) - 1 - t * 1.6).toFixed(1)}`; }).join(" L")} L${steps.slice().reverse().map((t) => { const x = BR2.farX + t * (BR2.nearX - BR2.farX); return `${x.toFixed(1)} ${(deckTop(x) - 0.4).toFixed(1)}`; }).join(" L")} Z` });
  shapes.push({ k: "bridge", d: `M${steps.map((t) => { const x = BR2.farX + t * (BR2.nearX - BR2.farX); return `${x.toFixed(1)} ${(deckTop(x) + thick(t) + 3 + t * 8).toFixed(1)}`; }).join(" L")} L${steps.slice().reverse().map((t) => { const x = BR2.farX + t * (BR2.nearX - BR2.farX); return `${x.toFixed(1)} ${(deckTop(x) + thick(t) + 3 + t * 8 + 1.5 + t * 2.5).toFixed(1)}`; }).join(" L")} Z` });
  for (const t of [0.05, 0.13, 0.23, 0.35, 0.49, 0.65, 0.83]) {
    const x = BR2.farX + t * (BR2.nearX - BR2.farX);
    const topY = deckTop(x) + thick(t);
    const hgt = 6 + t * 34;
    const wdt = 1.6 + t * 5;
    shapes.push({ k: "bridge", d: `M${x.toFixed(1)} ${topY.toFixed(1)} L${(x + wdt).toFixed(1)} ${topY.toFixed(1)} L${(x + wdt).toFixed(1)} ${(topY + hgt).toFixed(1)} L${x.toFixed(1)} ${(topY + hgt).toFixed(1)} Z` });
  }
  const lights = [];
  for (let i = 0; i <= 26; i += 1) {
    const t = Math.pow(i / 26, 1.35);
    const x = BR2.farX + 6 + t * (BR2.nearX - BR2.farX - 6);
    lights.push([x, deckTop(x) - 2.6 - t * 1.4, 0.9 + t * 1.3]);
  }
  shapes.push({ k: "bridgelights2", lights });
  const curtain = [];
  const rng = seededRng(0xbead);
  for (let t = 0.12; t < 0.76; t += 0.026) {
    const x = BR2.farX + t * (BR2.nearX - BR2.farX);
    const y0 = deckTop(x) + thick(t) + 0.5;
    const fall = 8 + t * 34 + rng() * 3;
    const drift = -(2 + t * 5);
    const wTop = 0.7 + t * 0.8;
    const wBot = 3.5 + t * 6;
    const d = [
      `M${(x - wTop).toFixed(1)} ${y0.toFixed(1)}`,
      `C${(x - wTop + drift * 0.5).toFixed(1)} ${(y0 + fall * 0.5).toFixed(1)} ${(x + drift - wBot / 2).toFixed(1)} ${(y0 + fall * 0.92).toFixed(1)} ${(x + drift - wBot / 2).toFixed(1)} ${(y0 + fall).toFixed(1)}`,
      `L${(x + drift + wBot / 2).toFixed(1)} ${(y0 + fall).toFixed(1)}`,
      `C${(x + drift + wBot / 2).toFixed(1)} ${(y0 + fall * 0.6).toFixed(1)} ${(x + wTop + drift * 0.35).toFixed(1)} ${(y0 + fall * 0.4).toFixed(1)} ${(x + wTop).toFixed(1)} ${y0.toFixed(1)}`,
      "Z",
    ].join(" ");
    const strand = `M${x.toFixed(1)} ${y0.toFixed(1)} Q${(x + drift * 0.55).toFixed(1)} ${(y0 + fall * 0.55).toFixed(1)} ${(x + drift * 0.95).toFixed(1)} ${(y0 + fall * 0.9).toFixed(1)}`;
    curtain.push({
      d,
      strand,
      mist: { cx: x + drift, cy: y0 + fall + 1, rx: wBot * 0.95, ry: 1.5 + t * 1.6 },
    });
  }
  shapes.push({ k: "curtain", curtain });
  return shapes;
})();

geo.bank = (() => {
  const top = `M0 ${BANK_Y + 26} Q240 ${BANK_Y + 16} 480 ${BANK_Y + 24} Q820 ${BANK_Y + 34} 1080 ${BANK_Y + 22} Q1340 ${BANK_Y + 12} 1600 ${BANK_Y + 20} L${W} ${H} L0 ${H} Z`;
  const trees = [
    [70, 12], [150, 11], [220, 15], [292, 10], [352, 12], [424, 9],
    [880, 13], [956, 17], [1030, 11], [1180, 9],
  ].map(([tx, r]) => `M${tx - r} ${BANK_Y + 24} Q${tx} ${BANK_Y + 24 - r * 1.7} ${tx + r} ${BANK_Y + 24} Z`);
  const lamps = [108, 254, 388, 1108];
  return { top, trees, lamps };
})();

geo.cruise = (() => {
  const cx = 268;
  const base = 393;
  return {
    hull: `M${cx - 118} ${base - 12} Q${cx} ${base - 18} ${cx + 118} ${base - 12} L${cx + 104} ${base} L${cx - 104} ${base} Z`,
    deck1: `M${cx - 88} ${base - 27} L${cx + 84} ${base - 27} Q${cx + 92} ${base - 27} ${cx + 92} ${base - 20} L${cx + 92} ${base - 12} L${cx - 88} ${base - 12} Z`,
    deck2: `M${cx - 64} ${base - 39} L${cx + 56} ${base - 39} Q${cx + 64} ${base - 39} ${cx + 64} ${base - 33} L${cx + 64} ${base - 27} L${cx - 64} ${base - 27} Z`,
    house: `M${cx - 56} ${base - 47} L${cx - 24} ${base - 47} L${cx - 24} ${base - 39} L${cx - 56} ${base - 39} Z`,
    mast: `M${cx + 40} ${base - 55} L${cx + 41.5} ${base - 55} L${cx + 41.5} ${base - 39} L${cx + 40} ${base - 39} Z`,
    win1: Array.from({ length: 16 }, (_, i) => [cx - 80 + i * 10.5, base - 21]),
    win2: Array.from({ length: 11 }, (_, i) => [cx - 56 + i * 10.5, base - 34]),
    beacon: [cx + 40.75, base - 57],
  };
})();

geo.midtown = (() => {
  const rng = seededRng(0x5e0a1);
  const slots = [[0, 214, 24, 84], [218, 608, 22, 80], [640, 790, 22, 72], [958, 1265, 22, 80], [1412, 1600, 46, 112]];
  const buildings = [];
  for (const [zx, zEnd, hMin, hMax] of slots) {
    let bx = zx;
    while (bx < zEnd - 14) {
      const bw = 15 + rng() * 26;
      const bh = hMin + rng() * (hMax - hMin);
      const base = shore(bx + bw / 2) - 1;
      const w = Math.min(bw, zEnd - bx);
      const wins = [];
      for (let wy = base - bh + 6; wy < base - 5; wy += 9) {
        for (let wx = bx + 4; wx < bx + w - 4; wx += 7) {
          if (rng() > 0.3) continue;
          wins.push([wx, wy]);
        }
      }
      const building = { x: bx, w, h: bh, base, wins, tone: Math.floor(rng() * 3) };
      if (rng() < 0.24) building.cap = true;
      if (rng() < 0.26) {
        building.stub = {
          x: bx + 2 + rng() * Math.max(1, w - 12),
          w: 5 + rng() * 7,
          h: 4 + rng() * 7,
        };
      }
      buildings.push(building);
      bx += bw - 2 + rng() * 5;
    }
  }
  return buildings;
})();

const TF = {
  gate: `translate(763.8 93.4) scale(0.52)`,
  namsan: `translate(789.5 35) scale(0.7)`,
  b63: `translate(-466.3 52.5) scale(0.75)`,
  lotte: `translate(-269.5 24.2) scale(1.26)`,
};

geo.jamsil = (() => {
  const rng = seededRng(0x1a3);
  const buildings = [];
  let bx = 1408;
  while (bx < 1610) {
    const bw = 34 + rng() * 40;
    const bh = 34 + rng() * 52;
    const base = 424 + rng() * 8;
    const wins = [];
    for (let wy = base - bh + 8; wy < base - 8; wy += 10) {
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
        if (rng() > 0.24) continue;
        wins.push([wx, wy]);
      }
    }
    buildings.push({ x: bx, w: bw, h: bh, base, wins });
    bx += bw + 4 + rng() * 10;
  }
  return buildings;
})();

function render(style) {
  const s = STYLES[style];
  const parts = [];
  parts.push(`<path d="${geo.ridges[0]}" fill="${s.ridgeFar}"/>`);
  parts.push(`<path d="${geo.ridges[1]}" fill="${s.ridgeNear}"/>`);

  parts.push(`<g transform="${TF.namsan}">${geo.namsan.map((sh) => emit(s, sh, s.haze)).join("")}</g>`);

  for (const b of geo.midtown) {
    const fill = s.midtownTones[b.tone];
    parts.push(`<path d="M${b.x} ${b.base + 8} L${b.x} ${b.base - b.h} L${b.x + b.w} ${b.base - b.h} L${b.x + b.w} ${b.base + 8} Z" fill="${fill}"/>`);
    if (b.cap) {
      parts.push(`<rect x="${b.x - 2}" y="${(b.base - b.h - 3).toFixed(1)}" width="${b.w + 4}" height="3" fill="${fill}"/>`);
    }
    if (b.stub) {
      parts.push(`<rect x="${b.stub.x.toFixed(1)}" y="${(b.base - b.h - b.stub.h).toFixed(1)}" width="${b.stub.w.toFixed(1)}" height="${b.stub.h.toFixed(1)}" fill="${fill}"/>`);
    }
    if (s.midtownWins) {
      parts.push(b.wins.map(([wx, wy]) => `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2.2" height="3" fill="${s.lightWarm}" opacity="${(0.1 + ((wx * 7 + wy) % 5) * 0.05).toFixed(2)}"/>`).join(""));
    } else {
      parts.push(b.wins.map(([wx, wy]) => `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2.2" height="3" fill="${s.winDark}" opacity="0.35"/>`).join(""));
    }
  }

  parts.push(`<g transform="${TF.gate}">${geo.gate.map((sh) => emit(s, sh)).join("")}</g>`);
  parts.push(`<g transform="translate(795 -6)">${geo.ddp.map((sh) => emit(s, sh)).join("")}</g>`);

  parts.push("<!--SPLIT-->");
  parts.push(`<defs>${s.jetColors.map((c, i) => `<linearGradient id="cg-${style}-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${s.curtainOpacity}"/><stop offset="0.75" stop-color="${c}" stop-opacity="${(s.curtainOpacity * 0.4).toFixed(2)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`).join("")}</defs>`);
  parts.push(`<path d="M${shorePath()} L${W} ${H} L0 ${H} Z" fill="${s.water}"/>`);
  parts.push(`<path d="M${shorePath()}" fill="none" stroke="${s.waterline}" stroke-width="1.2" opacity="0.35"/>`);

  parts.push(`<path d="${geo.island.land}" fill="${s.fills.island}"/>`);
  for (const t of geo.island.trees) parts.push(`<path d="${t}" fill="${s.fills.islandTree}"/>`);
  parts.push(`<g transform="${TF.b63}">${geo.b63.map((sh) => emit(s, sh)).join("")}</g>`);
  if (s.midtownWins) {
    parts.push(geo.island.shoreLights.map(([lx, ly]) => `<circle cx="${lx}" cy="${ly}" r="1" fill="${s.lightWarm}" opacity="0.5"/>`).join(""));
  }

  for (const sh of geo.bridge) parts.push(emit(s, sh, undefined, style));

  parts.push(`<g transform="translate(-321.5 51.8) scale(0.85)"><path d="${geo.sebit.platform}" fill="${s.fills.bridge}"/>`);
  for (const p of geo.sebit.pavilions) {
    parts.push(`<path d="${p.d}" fill="${s.fills.sebit}" stroke="${s.sebitRim[p.tone]}" stroke-width="1.2" stroke-opacity="${s.sebitRimOpacity}"/>`);
    parts.push(`<path d="${p.seam}" fill="none" stroke="${s.sebitRim[p.tone]}" stroke-width="0.8" stroke-opacity="${s.sebitRimOpacity * 0.6}"/>`);
  }
  parts.push(`</g>`);

  parts.push(`<g transform="translate(59 86.5) scale(0.78)">`);
  parts.push(`<path d="${geo.cruise.hull}" fill="${s.fills.cruiseHull}"/>`);
  parts.push(`<path d="${geo.cruise.deck1}" fill="${s.fills.cruiseDeck}"/>`);
  parts.push(`<path d="${geo.cruise.deck2}" fill="${s.fills.cruiseDeck}"/>`);
  parts.push(`<path d="${geo.cruise.house}" fill="${s.fills.cruiseHull}"/>`);
  for (const [wx, wy] of [...geo.cruise.win1, ...geo.cruise.win2]) {
    parts.push(`<rect x="${wx.toFixed(1)}" y="${wy}" width="4.5" height="3.5" rx="1" fill="${s.cruiseWin}" opacity="${s.cruiseWinOpacity}"/>`);
  }
  parts.push(`</g>`);

  parts.push(`<path d="${geo.bank.top}" fill="${s.bank}"/>`);
  for (const t of geo.bank.trees) parts.push(`<path d="${t}" fill="${s.bank}"/>`);
  for (const b of geo.jamsil) {
    parts.push(`<path d="M${b.x} ${b.base} L${b.x} ${b.base - b.h} L${b.x + b.w} ${b.base - b.h} L${b.x + b.w} ${b.base} Z" fill="${s.fills.jamsil}"/>`);
    if (s.midtownWins) {
      parts.push(b.wins.map(([wx, wy]) => `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2.4" height="3.2" fill="${s.lightWarm}" opacity="${(0.12 + ((wx * 11 + wy) % 5) * 0.05).toFixed(2)}"/>`).join(""));
    }
  }
  parts.push(`<g transform="${TF.lotte}">${geo.lotte.map((sh) => emit(s, sh)).join("")}</g>`);

  return parts.join("\n");
}

function layerSvg(style, layer) {
  const [back, front] = render(style).split("<!--SPLIT-->");
  const inner = layer === "back" ? back : front;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" aria-hidden="true" class="skyline-${style} block w-full h-auto">${inner}</svg>`;
}

function emit(s, sh, haze, style) {
  const F = haze ?? s.fills;
  if (sh.k === "bridgelights2") {
    return sh.lights.map(([lx, ly, r]) => `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="${r.toFixed(1)}" fill="${s.lightWarm}" opacity="${s.lightOpacity}"/>`).join("");
  }
  if (sh.k === "curtain") {
    return sh.curtain.map((c, i) => {
      const gi = i % s.jetColors.length;
      const color = s.jetColors[gi];
      return `<path d="${c.d}" fill="url(#cg-${style}-${gi})"/>` +
        `<ellipse cx="${c.mist.cx.toFixed(1)}" cy="${c.mist.cy.toFixed(1)}" rx="${c.mist.rx.toFixed(1)}" ry="${c.mist.ry.toFixed(1)}" fill="${color}" opacity="${(s.curtainOpacity * 0.2).toFixed(2)}"/>`;
    }).join("");
  }
  if (sh.k === "goldwins") {
    return sh.wins.map(([wx, wy]) => `<rect x="${wx}" y="${wy}" width="2.8" height="3.8" fill="${s.goldWin}" opacity="${s.winOpacity}"/>`).join("");
  }
  if (sh.k === "lottewins") {
    return sh.wins.map(([wx, wy]) => `<rect x="${wx.toFixed(1)}" y="${wy}" width="1.7" height="2.8" fill="${s.lightCool}" opacity="${s.winOpacity * 0.6}"/>`).join("");
  }
  if (sh.k === "ddpdots") {
    if (!s.ddpDots) return "";
    return sh.dots.map(([dx, dy]) => `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="0.9" fill="${s.lightCool}" opacity="${(0.2 + ((dx * 13) % 7) * 0.08).toFixed(2)}"/>`).join("");
  }
  if (sh.k === "ddpseam") {
    return `<path d="${sh.d}" fill="none" stroke="${s.ddpSeam}" stroke-width="1.2" opacity="0.8"/>`;
  }
  if (sh.k === "ddp") {
    return `<path d="${sh.d}" fill="${s.fills.ddp}"/>`;
  }
  if (sh.k === "eaveglow") {
    if (!s.eaveGlow) return "";
    return `<path d="${sh.d}" fill="none" stroke="${s.lightWarm}" stroke-width="1.8" opacity="0.55"/>`;
  }
  if (sh.stroke) return "";
  return `<path d="${sh.d}" fill="${F[sh.k] ?? F.body}"/>`;
}

const STYLES = {
  night: {
    skyGrad: `<defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04050c"/><stop offset="0.55" stop-color="#0a0d1c"/><stop offset="0.68" stop-color="#171226"/><stop offset="1" stop-color="#0b0d1a"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#nsky)"/>`,
    ridgeFar: "#0a0d1a",
    ridgeNear: "#0d1020",
    water: "#05070f",
    waterline: "#aab3f2",
    bank: "#04060c",
    fills: {
      body: "#161b3a", stone: "#161b3a", wall: "#1a2044", roof: "#1c2246", roofband: "#161b3a",
      gold: "#181530", midtown: "#0d1124", bridge: "#1b2142",
      arch: "rgba(255, 200, 120, 0.55)", sign: "rgba(255, 214, 140, 0.6)",
      winrow: "rgba(255, 217, 138, 0.55)", podwin: "rgba(255, 231, 178, 0.85)",
      beacon: "#ff6b5e", mast: "#2c3560", hill: "#0c1024", ddp: "#11152c",
      sebit: "#0e1226", island: "#0a0e1e", islandTree: "#0c1124", jamsil: "#0c1122",
      cruiseHull: "#12172e", cruiseDeck: "#181e3c",
    },
    haze: {
      body: "#131834", wall: "#131834", roof: "#131834", roofband: "#131834",
      hill: "#0b0f20", mast: "#232a50",
      winrow: "rgba(255, 217, 138, 0.5)", podwin: "rgba(255, 231, 178, 0.8)",
      beacon: "#ff6b5e",
    },
    ddpSeam: "#1e2547",
    ddpDots: true,
    sebitRim: { mint: "#7de8dc", rose: "#ff9ec2", warm: "#ffd98a" },
    sebitRimOpacity: 0.55,
    lightWarm: "#ffd98a",
    lightCool: "#cfd6ff",
    goldWin: "#ffca6a",
    winOpacity: 0.6,
    lightOpacity: 0.9,
    jetColors: ["#7fb2ff", "#b48aff", "#7de8dc", "#ff9ec2", "#8fe89f"],
    curtainOpacity: 0.5,
    reflectOpacity: 0.17,
    eaveGlow: true,
    midtownWins: true,
    midtownTones: ["#0d1124", "#0b0f20", "#0f1428"],
    winDark: "#1a2140",
    cruiseWin: "#ffe0a0",
    cruiseWinOpacity: 0.85,
    lampPole: "#141a30",
    lampLight: "#ffd98a",
  },
  day: {
    skyGrad: `<defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2d7ee"/><stop offset="0.5" stop-color="#e9ece4"/><stop offset="0.64" stop-color="#f6d3a8"/><stop offset="1" stop-color="#dfe5ea"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#dsky)"/>`,
    ridgeFar: "#c6cfe0",
    ridgeNear: "#b2bdd1",
    water: "#aec7db",
    waterline: "#ffffff",
    bank: "#47543f",
    fills: {
      body: "#4f5a76", stone: "#aba89c", wall: "#516b5f", roof: "#414c66", roofband: "#516b5f",
      gold: "#c9a05e", midtown: "#94a0b6", bridge: "#46516c",
      arch: "#2e3850", sign: "#39435c", winrow: "#39435c", podwin: "#e9edf4",
      beacon: "#c0392b", mast: "#4f5a76", hill: "#5d6a86", ddp: "#8792a8",
      sebit: "#7d9a97", island: "#7e947e", islandTree: "#5a7260", jamsil: "#485571",
      cruiseHull: "#3f4c66", cruiseDeck: "#dfe3ec",
    },
    haze: {
      body: "#c3ccd9", wall: "#c3ccd9", roof: "#c3ccd9", roofband: "#c3ccd9",
      hill: "#9fb4a3", mast: "#c3ccd9",
      winrow: "#5f6d84", podwin: "#5b6a82", beacon: "#c0392b",
    },
    ddpSeam: "#7d889e",
    ddpDots: false,
    sebitRim: { mint: "#5d827e", rose: "#5d827e", warm: "#5d827e" },
    sebitRimOpacity: 0.7,
    lightWarm: "#f4f6f9",
    lightCool: "#e8edf5",
    goldWin: "#f0d9ac",
    winOpacity: 0.5,
    lightOpacity: 0.85,
    jetColors: ["#a9bdd6", "#9db3cf"],
    curtainOpacity: 0.55,
    reflectOpacity: 0.3,
    eaveGlow: false,
    midtownWins: false,
    midtownTones: ["#96a1b7", "#8b96ad", "#a0abbf"],
    winDark: "#67718c",
    cruiseWin: "#4a5570",
    cruiseWinOpacity: 0.75,
    lampPole: "#2f374d",
    lampLight: "#57627e",
  },
};

const out = `// Generated by scripts/skyline-gen.mjs — edit the script, then run: node scripts/skyline-gen.mjs
export const skylineBack = {
  night: \`${layerSvg("night", "back")}\`,
  day: \`${layerSvg("day", "back")}\`,
};

export const skylineFront = {
  night: \`${layerSvg("night", "front")}\`,
  day: \`${layerSvg("day", "front")}\`,
};
`;
await writeFile(new URL("../src/components/effects/skylineScene.ts", import.meta.url), out);
console.log("skylineScene.ts written", out.length);
