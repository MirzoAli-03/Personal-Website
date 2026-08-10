import { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/*
  Drifting topographic contours.

  Every line is a slice through the same height field, so they read as contour
  lines of one landscape rather than unrelated waves. The field is a sum of
  sines at incommensurate frequencies, which never visibly repeats, plus a
  gaussian envelope so the ridges rise toward the centre and flatten at the
  edges instead of running off the page at full amplitude.

  Same discipline as the particle background: honours prefers-reduced-motion,
  stops when the tab is hidden, scales for devicePixelRatio, and is cheap —
  one stroked path per line, no per-point allocation.
*/

const LINES = 26;
const STEP = 10; // px between sample points; larger is cheaper and smoother
const DRIFT = 0.00022;

export default function ContourField() {
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

    let width = 0;
    let height = 0;
    let frame = null;

    // Height of the shared landscape at horizontal position x, time t.
    function field(x, t) {
      const a = Math.sin(x * 0.0042 + t * 0.9);
      const b = Math.sin(x * 0.0017 - t * 0.6 + 1.7);
      const c = Math.sin(x * 0.0091 + t * 1.4 + 3.1);
      return a * 0.55 + b * 0.32 + c * 0.13;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = accent;

      const gap = height / (LINES - 1);
      const amp = Math.min(height * 0.09, 70);
      const cx = width / 2;
      const spread = width * 0.55;

      for (let i = 0; i < LINES; i++) {
        const baseY = i * gap;
        // Lines nearer the vertical middle sit slightly stronger, so the band
        // has a centre of gravity rather than reading as uniform wallpaper.
        const vertical = 1 - Math.abs(i / (LINES - 1) - 0.5) * 2;
        ctx.globalAlpha = (isDark ? 0.22 : 0.16) * (0.35 + vertical * 0.65);

        ctx.beginPath();
        for (let x = 0; x <= width + STEP; x += STEP) {
          // Gaussian across x: ridges peak centrally and settle at the edges.
          const d = (x - cx) / spread;
          const envelope = Math.exp(-(d * d));
          const y = baseY + field(x, t + i * 0.12) * amp * envelope;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function step(now) {
      draw(now * DRIFT);
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
      draw(performance.now() * DRIFT);
    }

    resize();
    draw(performance.now() * DRIFT);
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
    <Box aria-hidden="true" sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{ width: "100%", height: "100%", display: "block" }}
      />
    </Box>
  );
}
