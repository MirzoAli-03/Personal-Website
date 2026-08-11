import { useTheme } from "@mui/material";

import CanvasLayer from "./CanvasLayer";
import { useCanvasBackground } from "../hooks/useCanvasBackground";

/*
  Aurora bands — soft vertical curtains of light that lean and breathe.

  The calmest of the animated options: no dots, no lines, nothing with an edge
  the eye can lock onto, so it stays furthest out of the way of reading. Each
  band is a skewed gradient strip whose position and width drift on their own
  slow cycles, so they never line up into a visible pattern.

  Drawn with three wide strips rather than per-pixel noise, which keeps it
  cheap even at full-screen size.
*/

const BANDS = [
  { hueShift: 0, speed: 0.055, width: 0.42, phase: 0 },
  { hueShift: 1, speed: 0.041, width: 0.34, phase: 2.1 },
  { hueShift: 2, speed: 0.068, width: 0.28, phase: 4.3 },
];

export default function AuroraBands({ contained = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const canvasRef = useCanvasBackground({
    deps: [accent, isDark],
    draw(ctx, { width, height, t }) {
      // Two companions to the accent, kept close in hue so the result reads as
      // one light source rather than a rainbow.
      const tones = isDark
        ? [accent, "#7C93FF", "#68BCA4"]
        : [accent, "#4C63C7", "#2C7A66"];

      BANDS.forEach((band, i) => {
        const drift = Math.sin(t * band.speed + band.phase);
        const cx = width * (0.5 + drift * 0.42);
        const half = width * band.width * (0.85 + Math.sin(t * band.speed * 1.7 + i) * 0.15);

        const gradient = ctx.createLinearGradient(cx - half, 0, cx + half, height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.5, tones[band.hueShift]);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalAlpha = isDark ? 0.15 : 0.11;
        ctx.fillStyle = gradient;
        // Skewed so the curtains lean rather than standing as flat columns.
        ctx.save();
        ctx.translate(cx, 0);
        ctx.transform(1, 0, drift * 0.35, 1, 0, 0);
        ctx.fillRect(-half, -height * 0.2, half * 2, height * 1.4);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    },
  });

  return <CanvasLayer canvasRef={canvasRef} contained={contained} />;
}
