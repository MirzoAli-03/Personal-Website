import { useTheme } from "@mui/material";

import CanvasLayer from "./CanvasLayer";
import { useCanvasBackground } from "../hooks/useCanvasBackground";

/*
  Drifting topographic contours.

  Every line is a slice through the same height field, so they read as contour
  lines of one landscape rather than unrelated waves. The field is a sum of
  sines at incommensurate frequencies, which never visibly repeats, plus a
  gaussian envelope so the ridges rise toward the centre and flatten at the
  edges instead of running off the page at full amplitude.
*/

const LINES = 26;
const STEP = 10; // px between sample points; larger is cheaper and smoother

// Height of the shared landscape at horizontal position x, time t.
function field(x, t) {
  return (
    Math.sin(x * 0.0042 + t * 0.9) * 0.55 +
    Math.sin(x * 0.0017 - t * 0.6 + 1.7) * 0.32 +
    Math.sin(x * 0.0091 + t * 1.4 + 3.1) * 0.13
  );
}

export default function ContourField({ contained = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const canvasRef = useCanvasBackground({
    deps: [accent, isDark],
    draw(ctx, { width, height, t }) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = accent;

      const gap = height / (LINES - 1);
      const amp = Math.min(height * 0.09, 70);
      const cx = width / 2;
      const spread = width * 0.55;
      const time = t * 0.22;

      for (let i = 0; i < LINES; i++) {
        const baseY = i * gap;
        // Lines nearer the vertical middle draw slightly stronger, so the band
        // has a centre of gravity rather than reading as uniform wallpaper.
        const vertical = 1 - Math.abs(i / (LINES - 1) - 0.5) * 2;
        ctx.globalAlpha = (isDark ? 0.22 : 0.16) * (0.35 + vertical * 0.65);

        ctx.beginPath();
        for (let x = 0; x <= width + STEP; x += STEP) {
          // Gaussian across x: ridges peak centrally and settle at the edges.
          const d = (x - cx) / spread;
          const envelope = Math.exp(-(d * d));
          const y = baseY + field(x, time + i * 0.12) * amp * envelope;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  });

  return <CanvasLayer canvasRef={canvasRef} contained={contained} />;
}
