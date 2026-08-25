import { ImageResponse } from "next/og";

export const alt = "printengine — custom print and embroidery clothing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#ffffff", letterSpacing: -1 }}>
          print<span style={{ color: "#b8f20a" }}>engine</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#b8f20a",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            AI design studio
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              color: "#ffffff",
              letterSpacing: -3,
              marginTop: 20,
            }}
          >
            Describe it. Wear it.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#9a9a9a", marginTop: 24 }}>
            Custom print and embroidery, made to order in India
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["T-shirts", "Hoodies", "Jerseys", "Doctor aprons"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "1px solid #3a3a3a",
                color: "#d4d4d4",
                fontSize: 20,
                padding: "10px 20px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
