import { useRef } from "react";
import { useTheme } from "@mui/material";

import CanvasLayer from "./CanvasLayer";
import { useCanvasBackground } from "../hooks/useCanvasBackground";

/*
  Animated particle network.

  Particle count scales with viewport area and is capped, because linking every
  pair is O(n^2) — an uncapped count would quietly turn a large monitor into a
  frame-rate problem.
*/

const MAX_PARTICLES = 90;
const AREA_PER_PARTICLE = 20000;
const LINK_DISTANCE = 130;
const SPEED = 0.16;

export default function ParticleNetwork() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  const particles = useRef([]);
  const bounds = useRef({ width: 0, height: 0 });

  const canvasRef = useCanvasBackground({
    deps: [accent, isDark],
    onResize({ width, height }) {
      bounds.current = { width, height };
      const target = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
      particles.current = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 1 + Math.random() * 1.4,
      }));
    },
    draw(ctx) {
      const { width, height } = bounds.current;
      const list = particles.current;

      for (const p of list) {
        p.x += p.vx;
        p.y += p.vy;
        // Bounce rather than wrap, so links never snap across the viewport.
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // Lines first so dots sit on top of their own connections.
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const dx = list[i].x - list[j].x;
          const dy = list[i].y - list[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;
          const strength = 1 - dist / LINK_DISTANCE;
          ctx.globalAlpha = strength * (isDark ? 0.16 : 0.12);
          ctx.beginPath();
          ctx.moveTo(list[i].x, list[i].y);
          ctx.lineTo(list[j].x, list[j].y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = isDark ? 0.4 : 0.32;
      ctx.fillStyle = accent;
      for (const p of list) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  });

  return <CanvasLayer canvasRef={canvasRef} />;
}
