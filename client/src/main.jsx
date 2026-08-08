import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import { AppProvider, useApp } from "./context/AppContext";
import { buildTheme } from "./theme";

function Themed({ children }) {
  const { mode } = useApp();
  const theme = React.useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Themed>
          <App />
        </Themed>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
