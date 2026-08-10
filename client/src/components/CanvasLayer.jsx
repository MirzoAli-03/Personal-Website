import { Box } from "@mui/material";

// Fixed, non-interactive layer behind the page content. Every canvas
// background renders through this so their positioning cannot drift apart.
export default function CanvasLayer({ canvasRef }) {
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
