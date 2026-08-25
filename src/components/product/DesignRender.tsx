import { generateArt, type Design, type Style } from "@/lib/design";

export default function DesignRender({
  design,
  className = "",
}: {
  design: Design;
  className?: string;
}) {
  if (design.kind === "upload" || (design.kind === "ai" && design.url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={design.url}
        alt={design.kind === "upload" ? design.name : design.prompt}
        className={"h-full w-full object-contain " + className}
      />
    );
  }

  if (design.kind === "text") {
    const chars = Math.max(1, design.text.length);
    const size = Math.round(Math.min(22, 190 / chars) * 100) / 100;
    return (
      <svg
        viewBox="0 0 100 40"
        className={"h-full w-full " + className}
        role="img"
        aria-label={design.text}
        preserveAspectRatio="xMidYMid meet"
      >
        <text
          x="50"
          y="20"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={design.font}
          fontSize={size}
          fill={design.colour}
        >
          {design.text}
        </text>
      </svg>
    );
  }

  const shapes = generateArt(design.prompt, design.style as Style, design.variant);

  return (
    <svg viewBox="0 0 100 100" className={"h-full w-full " + className} aria-hidden>
      {shapes.map((s, i) => {
        if (s.t === "circle")
          return (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={1.4}
            />
          );
        if (s.t === "line")
          return (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.stroke}
              strokeWidth={1.2}
            />
          );
        return (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            fill={s.fill}
            stroke={s.stroke === "none" ? undefined : s.stroke}
            strokeWidth={1.4}
          />
        );
      })}
    </svg>
  );
}
