import { Box } from "@mui/material";

// Gradient mesh backdrop for the public pages.
//
// Two things keep it from swallowing the content: the blobs are heavily
// blurred so they never form an edge that competes with text, and the dark
// theme runs at roughly half the opacity because coloured light on a dark
// ground reads far stronger than the same colour on white.
//
// Fixed rather than scrolling, so long pages don't drag the blobs past the
// reader. Sits above the body background but below everything else, which is
// why the layout's content is given its own stacking context.
export default function MeshBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        // A wash of the page colour on top keeps contrast from drifting too
        // far wherever two blobs overlap.
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: (t) =>
            t.palette.mode === "dark"
              ? "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(17,18,20,.55) 100%)"
              : "radial-gradient(120% 80% at 50% 0%, transparent 45%, rgba(255,255,255,.5) 100%)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          // Oversized and offset so the blur never reveals a hard edge at the
          // viewport boundary.
          inset: "-25%",
          filter: { xs: "blur(70px)", md: "blur(100px)" },
          opacity: (t) => (t.palette.mode === "dark" ? 0.5 : 0.75),
          background: (t) => {
            const dark = t.palette.mode === "dark";
            // Indigo primary, plus an analogous violet and teal. Staying near
            // the accent keeps this reading as the site's own colour rather
            // than decoration bolted on.
            const a = dark ? "rgba(124,147,255,.55)" : "rgba(52,84,209,.42)";
            const b = dark ? "rgba(168,110,255,.42)" : "rgba(150,90,235,.30)";
            const c = dark ? "rgba(64,196,208,.32)" : "rgba(58,190,205,.26)";
            return [
              `radial-gradient(closest-side, ${a}, transparent) 8% 12% / 62% 58% no-repeat`,
              `radial-gradient(closest-side, ${b}, transparent) 88% 26% / 58% 62% no-repeat`,
              `radial-gradient(closest-side, ${c}, transparent) 42% 88% / 66% 55% no-repeat`,
            ].join(", ");
          },
        }}
      />
    </Box>
  );
}
