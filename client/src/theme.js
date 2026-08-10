import { createTheme } from "@mui/material/styles";

/*
  Type: Fraunces for display, Public Sans for everything else.
  Both self-hosted variable fonts, so there is no CDN request and no flash of
  fallback text. A serif display against a neutral grotesque is the standard
  editorial pairing and it carries the personality the system stack could not.

  Colour: cool near-white ground, near-black ink, one deep green accent used
  sparingly. Green rather than the obvious blue, and a cool ground rather than
  cream, so the page does not land on either of the two looks every developer
  portfolio already has.
*/

const DISPLAY = '"Fraunces Variable", Georgia, "Times New Roman", serif';
const BODY = '"Public Sans Variable", -apple-system, "Segoe UI", system-ui, sans-serif';
const MONO = 'ui-monospace, "Cascadia Mono", Consolas, monospace';

const light = {
  mode: "light",
  primary: { main: "#1E5E4E", light: "#2C7A66", dark: "#14453A", contrastText: "#FFFFFF" },
  background: { default: "#FCFCFD", paper: "#FFFFFF" },
  text: { primary: "#15161A", secondary: "#5D606B" },
  divider: "#E4E5E8",
};

const dark = {
  mode: "dark",
  primary: { main: "#68BCA4", light: "#8CD0BC", dark: "#3F9880", contrastText: "#0B1512" },
  background: { default: "#0F1013", paper: "#16181C" },
  text: { primary: "#ECEDEF", secondary: "#969AA4" },
  divider: "#25272C",
};

export function buildTheme(mode) {
  const palette = mode === "dark" ? dark : light;

  return createTheme({
    palette,

    shape: { borderRadius: 8 },

    typography: {
      fontFamily: BODY,
      // Optical sizing and a low "soft" axis keep Fraunces authoritative
      // rather than whimsical at display sizes.
      h1: {
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontVariationSettings: '"SOFT" 0, "WONK" 0, "opsz" 144',
        letterSpacing: "-0.035em",
        lineHeight: 0.98,
      },
      h2: {
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontVariationSettings: '"SOFT" 0, "WONK" 0, "opsz" 72',
        letterSpacing: "-0.025em",
        lineHeight: 1.1,
      },
      h3: {
        fontFamily: DISPLAY,
        fontWeight: 600,
        fontVariationSettings: '"SOFT" 0, "WONK" 0, "opsz" 48',
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
      },
      h4: { fontFamily: DISPLAY, fontWeight: 600, letterSpacing: "-0.02em" },
      h5: { fontWeight: 650, letterSpacing: "-0.015em" },
      h6: { fontWeight: 650, letterSpacing: "-0.01em" },
      body1: { fontSize: "1rem", lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      overline: {
        fontWeight: 700,
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        lineHeight: 1.6,
      },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
    },

    components: {
      // Material's ripple is the loudest tell that a site is "a MUI app".
      MuiButtonBase: { defaultProps: { disableRipple: true } },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 6, paddingInline: 18, paddingBlock: 8 },
          sizeLarge: { paddingInline: 24, paddingBlock: 11, fontSize: "0.98rem" },
          outlined: { borderColor: palette.divider },
        },
      },

      MuiCard: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "border-color .18s ease, transform .18s ease",
          },
        },
      },

      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 5, fontWeight: 600, fontSize: "0.74rem" },
          outlined: { borderColor: palette.divider },
        },
      },

      MuiTextField: { defaultProps: { size: "small" } },

      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 6 },
          notchedOutline: { borderColor: palette.divider },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600, minHeight: 44, letterSpacing: 0 },
        },
      },

      MuiCssBaseline: {
        styleOverrides: {
          // Selection and focus deserve to be designed, not inherited.
          "::selection": {
            background: palette.primary.main,
            color: palette.primary.contrastText,
          },
          ":focus-visible": {
            outline: `2px solid ${palette.primary.main}`,
            outlineOffset: 2,
          },
          code: { fontFamily: MONO },
        },
      },
    },
  });
}
