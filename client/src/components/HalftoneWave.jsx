import { useTheme } from "@mui/material";

import CanvasLayer from "./CanvasLayer";
import { useCanvasBackground } from "../hooks/useCanvasBackground";

/*
  Halftone wave — a printer's dot screen with a slow swell running through it.

  Dot radius is driven by a diagonal travelling wave, so the grid stays
  perfectly regular while the weight moves across it. That regularity is the
  point: it reads as printed matter rather than as a screensaver, which suits
  a page set in a display serif.

  Cost is bounded by the grid spacing, not the viewport, so a large monitor
  draws bigger dots rather than exponentially more of them.
*/

const SPACING = 30;
const MAX_RADIUS = 3.1;

export default function HalftoneWave({ contained = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const canvasRef = useCanvasBackground({
    deps: [accent, isDark],
    draw(ctx, { width, height, t }) {
      ctx.fillStyle = accent;
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;
          // Diagonal wave plus a slower cross wave, so the swell never settles
          // into an obvious repeating stripe.
          const wave =
            Math.sin((x + y) * 0.0075 - t * 0.85) * 0.65 +
            Math.sin((x - y) * 0.0042 + t * 0.5) * 0.35;
          const scale = (wave + 1) / 2; // 0..1
          const r = scale * MAX_RADIUS;
          if (r < 0.25) continue;

          ctx.globalAlpha = (isDark ? 0.3 : 0.22) * scale;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
  });

  return <CanvasLayer canvasRef={canvasRef} contained={contained} />;
}
