import { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/*
  Animated particle network drawn on a canvas.

  Canvas rather than DOM nodes: a hundred absolutely-positioned divs plus the
  lines between them would thrash layout on every frame.

  Three things keep it from being a liability:

  - prefers-reduced-motion renders a single static frame and never starts the
    loop. Constant background motion is a genuine accessibility problem, not a
    preference, and this is the one that matters most here.
  - The loop stops entirely when the tab is hidden, so it does not burn battery
    in a background tab.
  - Particle count scales with viewport area and is capped, so a large monitor
    does not quietly turn this into an O(n^2) line-drawing problem.
*/

const MAX_PARTICLES = 90;
const AREA_PER_PARTICLE = 20000;
const LINK_DISTANCE = 130;
const SPEED = 0.16;

export default function ParticleNetwork() {
  const canvasRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let frame = null;
    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 1 + Math.random() * 1.4,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Lines first so dots sit on top of their own connections.
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;
          const strength = 1 - dist / LINK_DISTANCE;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = strength * (isDark ? 0.16 : 0.12);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = isDark ? 0.4 : 0.32;
      ctx.fillStyle = accent;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // Bounce rather than wrap, so links never snap across the viewport.
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      draw();
      frame = requestAnimationFrame(step);
    }

    function start() {
      if (reduceMotion || frame !== null) return;
      frame = requestAnimationFrame(step);
    }

    function stop() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onResize() {
      resize();
      draw();
    }

    resize();
    draw();
    if (!reduceMotion) start();

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [accent, isDark]);

  return (
    <Box
      aria-hidden="true"
      sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{ width: "100%", height: "100%", display: "block" }}
      />
    </Box>
  );
}
