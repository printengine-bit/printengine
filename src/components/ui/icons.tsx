type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const Search = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Heart = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z" />
  </svg>
);

export const Bag = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M5 7h14l-1 13H6L5 7Z" />
    <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
  </svg>
);

export const User = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronDown = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Truck = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

export const Shield = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M12 3.5 19 6v6c0 4.2-3 7-7 8.5C8 19 5 16.2 5 12V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Repeat = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M4 9a5 5 0 0 1 5-5h9M18 4l-3-3M18 4l-3 3" />
    <path d="M20 15a5 5 0 0 1-5 5H6M6 20l3 3M6 20l3-3" />
  </svg>
);

export const Lock = (p: P) => (
  <svg {...base} className={p.className}>
    <rect x="5" y="10" width="14" height="10" />
    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
  </svg>
);

export const Star = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={p.className}>
    <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17l-5.3 2.8 1.1-5.9L3.5 9.8l5.9-.8Z" />
  </svg>
);
