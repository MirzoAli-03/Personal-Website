import { useEffect, useRef } from "react";

/*
  Shared plumbing for the animated canvas backgrounds.

  Every one of them needs the same four things, and getting any of them wrong
  is a real cost rather than a cosmetic one:

  - devicePixelRatio scaling (capped at 2) so lines stay sharp without
    quadrupling fill cost on dense screens
  - prefers-reduced-motion draws a single static frame and never starts the
    loop; constant background motion is an accessibility problem
  - the loop stops entirely when the tab is hidden, so it does not burn battery
  - resize rebuilds any per-size state and repaints immediately

  `draw(ctx, { width, height, t })` renders one frame; `t` is seconds since the
  first frame. `onResize({ width, height })` is optional and runs before the
  first paint and on every resize, for backgrounds that cache per-size state.
*/
export function useCanvasBackground({ draw, onResize, deps = [] }) {
  const canvasRef = useRef(null);
  const drawRef = useRef(draw);
  const resizeRef = useRef(onResize);

  drawRef.current = draw;
  resizeRef.current = onResize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = null;
    let startedAt = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resizeRef.current?.({ width, height });
    }

    function paint(t) {
      ctx.clearRect(0, 0, width, height);
      drawRef.current(ctx, { width, height, t });
    }

    function step(now) {
      if (startedAt === null) startedAt = now;
      paint((now - startedAt) / 1000);
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

    function handleResize() {
      resize();
      paint(0);
    }

    resize();
    paint(0);
    if (!reduceMotion) start();

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}
