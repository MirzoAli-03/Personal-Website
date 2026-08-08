import { useState } from "react";
import { Button, Menu, MenuItem, ListItemText } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";

import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../i18n";

export default function LanguageSwitcher({ size = "medium" }) {
  const { lang, setLang, t } = useApp();
  const [anchor, setAnchor] = useState(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <Button
        size={size}
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<LanguageIcon fontSize="small" />}
        aria-label={t("nav.language")}
        aria-haspopup="true"
        sx={{ color: "text.secondary", minWidth: 0, px: 1.2 }}
      >
        {current.short}
      </Button>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {LANGUAGES.map((option) => (
          <MenuItem
            key={option.code}
            selected={option.code === lang}
            onClick={() => {
              setLang(option.code);
              setAnchor(null);
            }}
            sx={{ gap: 1.5, minWidth: 170 }}
          >
            <ListItemText>{option.label}</ListItemText>
            {option.code === lang && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
