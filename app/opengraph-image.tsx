import { ImageResponse } from "next/og";

export const alt = "Victor Uhnger - Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0f172a",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(59,130,246,0.22), transparent 55%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <g
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,8 17,16 9,24" />
              <line x1="20" y1="24" x2="26" y2="24" />
            </g>
          </svg>
          <span style={{ color: "#94a3b8", fontSize: "34px", fontWeight: 600 }}>
            vuhnger.dev
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ color: "#f8fafc", fontSize: "84px", fontWeight: 800 }}>
            Victor Uhnger
          </span>
          <span style={{ color: "#cbd5e1", fontSize: "40px", fontWeight: 500 }}>
            Masterstudent i informatikk · utvikler
          </span>
        </div>

        <div
          style={{
            height: "8px",
            width: "220px",
            borderRadius: "9999px",
            backgroundColor: "#3b82f6",
          }}
        />
      </div>
    ),
    size,
  );
}
