// Ícones de traço (24×24) usados nas figuras do painel.
export const ICONS = {
  waste: "M7 8h10l-1 12H8z M9 8V6h6v2 M5 8h14 M10 11v6 M14 11v6",
  tank: "M5 11v8h14v-8 M5 11c0-3 3.5-5 7-5s7 2 7 5 M5 15h14 M12 6V3",
  flame: "M12 21c-3.5 0-6-2.4-6-5.6 0-3.4 3-5.4 3.4-9.4 2.4 1.6 3.4 3.6 3.4 5.6 1-.6 1.6-1.8 1.8-3 1.6 1.6 3.4 3.8 3.4 6.8 0 3.2-2.5 5.6-6 5.6z",
  house: "M4 11l8-6 8 6 M6 10v10h12V10 M10 20v-5h4v5",
  cow: "M6 9h12v6H6z M18 10l2-1v4l-2 1 M7 15v4 M10 15v4 M14 15v4 M17 15v4 M6 9l-1-3 M8 9l1-3",
  pond: "M3 15c3-3 15-3 18 0-3 3-15 3-18 0z M7 15h3 M13 15h4",
  cloud: "M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.2A4 4 0 0 0 7 18z",
  landfill: "M2 19h20 M4 19l4-6h8l4 6 M8 13l2-4h4l2 4 M12 9V5",
  leaf: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14z M5 19l8-8",
  sprout: "M12 21v-8 M12 13c0-4-3-6-7-6 0 4 3 6 7 6z M12 11c0-3 2.5-5 6-5 0 3-2.5 5-6 5z M7 21h10",
  factory: "M3 20V10l5 3V10l5 3V10l5 3V5h3v15z M7 17h2 M12 17h2 M17 17h2",
  well: "M12 3l-5 17 M12 3l5 17 M8.5 14h7 M9.8 9h4.4 M4 20h16 M12 20v2",
  truck: "M2 7h11v9H2z M13 10h4l3 3v3h-7 M6 18.5a1.5 1.5 0 1 0 0 .01 M17 18.5a1.5 1.5 0 1 0 0 .01",
  bus: "M4 5h16v12H4z M4 11h16 M7 17v2 M17 17v2 M7 14h1 M16 14h1",
  gauge: "M4 16a8 8 0 1 1 16 0 M12 16l4-5 M8 20h8",
  drop: "M12 3c3 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-6.5 6-11z",
  pipe: "M2 9h8v6H2 M10 10h4v4h-4 M14 9h8v6h-8",
  city: "M3 21V10h6v11 M9 21V4h7v17 M16 21v-8h5v8 M12 7h1 M12 11h1 M12 15h1 M5 13h2 M5 17h2",
  doc: "M7 3h7l4 4v14H7z M14 3v4h4 M10 12h5 M10 15h5 M10 18h3",
  chart: "M4 20V4 M4 20h16 M8 16l4-5 3 3 5-6",
  fuel: "M5 21V5h8v16 M5 10h8 M3 21h12 M13 8l4 3v7a1.5 1.5 0 0 0 3 0v-6l-3-3",
  check: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z M9 12l2 2 4-4",
  gov: "M3 9l9-5 9 5 M5 9v9 M9.5 9v9 M14.5 9v9 M19 9v9 M3 20h18",
  co2: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  lab: "M9 3h6 M10 3v6l-5 10h14l-5-10V3 M7.5 15h9",
};
export function icon(name, x, y, size = 24, cls = "ic") {
  const s = size / 24;
  const inner = name === "co2" ? `<path d="${ICONS.co2}"/><text x="12" y="13" text-anchor="middle" dominant-baseline="central" font-size="7" class="ic-t">CO₂</text>` : `<path d="${ICONS[name] || ""}"/>`;
  return `<g class="${cls}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${s})">${inner}</g>`;
}
