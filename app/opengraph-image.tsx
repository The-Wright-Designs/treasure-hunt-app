import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "Treasure Hunt App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/logo/treasure-hunt-app-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#FFFFFF",
          borderBottom: "24px solid #E37434",
        }}
      >
        <img src={logoSrc} alt="" height={300} />
        <div style={{ fontSize: 72, fontWeight: 700, color: "#1D1D1D" }}>
          Treasure Hunt App
        </div>
      </div>
    ),
    size,
  );
}
