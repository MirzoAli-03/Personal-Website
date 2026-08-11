import { useRef } from "react";
import { useTheme } from "@mui/material";

import CanvasLayer from "./CanvasLayer";
import { useCanvasBackground } from "../hooks/useCanvasBackground";

/*
  Flow ribbons — long strands tracing a slowly rotating vector field.

  Unlike the particle network there are no node-to-node links, so nothing
  twitches: each strand is a smooth path integrated through the field, which
  reads as current rather than as connected dots.

  The field itself turns over time, so the strands are redrawn each frame from
  fixed seed points rather than accumulating position. That keeps it stateless
  and immune to drifting off-screen, at the cost of a little arithmetic.
*/

const RIBBONS = 34;
const SEGMENTS = 26;
const SEGMENT_LENGTH = 26;

export default function FlowRibbons({ contained = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;
  const seeds = useRef([]);

  const canvasRef = useCanvasBackground({
    deps: [accent, isDark],
    onResize({ width, height }) {
      // Seeds are spread on a jittered grid so the strands cover the frame
      // evenly instead of clumping the way pure random placement does.
      const cols = Math.ceil(Math.sqrt(RIBBONS * (width / Math.max(height, 1))));
      const rows = Math.ceil(RIBBONS / Math.max(cols, 1));
      const out = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          out.push({
            x: ((i + 0.5) / cols) * width + (Math.random() - 0.5) * (width / cols) * 0.7,
            y: ((j + 0.5) / rows) * height + (Math.random() - 0.5) * (height / rows) * 0.7,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      seeds.current = out;
    },
    draw(ctx, { width, height, t }) {
      ctx.lineCap = "round";
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = accent;

      for (const seed of seeds.current) {
        let x = seed.x;
        let y = seed.y;

        ctx.globalAlpha = isDark ? 0.2 : 0.15;
        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let s = 0; s < SEGMENTS; s++) {
          // Angle of the field at this point, drifting with time.
          const angle =
            Math.sin(x * 0.0031 + t * 0.22 + seed.phase) * 1.5 +
            Math.cos(y * 0.0027 - t * 0.16) * 1.5;
          x += Math.cos(angle) * SEGMENT_LENGTH;
          y += Math.sin(angle) * SEGMENT_LENGTH;
          if (x < -80 || x > width + 80 || y < -80 || y > height + 80) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  });

  return <CanvasLayer canvasRef={canvasRef} contained={contained} />;
}
