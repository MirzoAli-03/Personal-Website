import { Box } from "@mui/material";

/*
  Non-interactive layer that every canvas background renders through, so their
  positioning cannot drift apart.

  `contained` switches from fixed (behind the whole page) to absolute (filling
  whatever positioned ancestor it sits in) — used inside the mobile drawer,
  where a fixed layer would be hidden behind the drawer's own scrim.
*/
export default function CanvasLayer({ canvasRef, contained = false }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: contained ? "absolute" : "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{ width: "100%", height: "100%", display: "block" }}
      />
    </Box>
  );
}
