import { useEffect, useRef, useState } from "react";
import { Box, Divider, Stack, ToggleButton, Tooltip } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import HtmlIcon from "@mui/icons-material/DataObject";

// contenteditable + execCommand. Deprecated but universally supported, and it
// keeps the editor dependency-free. Swap for TipTap if this ever needs tables,
// collaborative editing, or a proper undo stack.
export default function RichTextEditor({ value, onChange, onRequestImage, editorApiRef }) {
  const editorRef = useRef(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [source, setSource] = useState(value || "");

  // Seed the DOM once. Writing innerHTML on every render would reset the
  // caret to the start on each keystroke.
  useEffect(() => {
    if (editorRef.current && !htmlMode && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, htmlMode]);

  function exec(command, arg = null) {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    emit();
  }

  function emit() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function toggleHtml() {
    if (htmlMode) {
      onChange(source);
      if (editorRef.current) editorRef.current.innerHTML = source;
      setHtmlMode(false);
    } else {
      setSource(editorRef.current?.innerHTML || value || "");
      setHtmlMode(true);
    }
  }

  function insertLink() {
    const url = window.prompt("Link URL", "https://");
    if (url) exec("createLink", url);
  }

  // Lets the parent insert an image once one is chosen from the library.
  useEffect(() => {
    if (!editorApiRef) return;
    editorApiRef.current = {
      insertImage(id) {
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, `<img src="/images/${id}" alt="">`);
        emit();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorApiRef]);

  const buttons = [
    { title: "Bold", icon: <FormatBoldIcon fontSize="small" />, run: () => exec("bold") },
    { title: "Italic", icon: <FormatItalicIcon fontSize="small" />, run: () => exec("italic") },
    { title: "Heading", label: "H2", run: () => exec("formatBlock", "h2") },
    { title: "Subheading", label: "H3", run: () => exec("formatBlock", "h3") },
    { title: "Paragraph", label: "¶", run: () => exec("formatBlock", "p") },
    { divider: true },
    { title: "Bullet list", icon: <FormatListBulletedIcon fontSize="small" />, run: () => exec("insertUnorderedList") },
    { title: "Numbered list", icon: <FormatListNumberedIcon fontSize="small" />, run: () => exec("insertOrderedList") },
    { title: "Quote", icon: <FormatQuoteIcon fontSize="small" />, run: () => exec("formatBlock", "blockquote") },
    { title: "Code block", icon: <CodeIcon fontSize="small" />, run: () => exec("formatBlock", "pre") },
    { divider: true },
    { title: "Insert link", icon: <LinkIcon fontSize="small" />, run: insertLink },
    { title: "Insert image", icon: <ImageIcon fontSize="small" />, run: () => onRequestImage?.() },
  ];

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.5}
        flexWrap="wrap"
        useFlexGap
        sx={{
          p: 1,
          border: 1,
          borderColor: "divider",
          borderBottom: 0,
          borderRadius: "8px 8px 0 0",
          bgcolor: "action.hover",
        }}
      >
        {buttons.map((btn, i) =>
          btn.divider ? (
            <Divider key={`d${i}`} orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          ) : (
            <Tooltip key={btn.title} title={btn.title}>
              <span>
                <ToggleButton
                  value={btn.title}
                  size="small"
                  selected={false}
                  disabled={htmlMode}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={btn.run}
                  sx={{ border: 0, px: 1.2, minWidth: 0 }}
                >
                  {btn.icon || btn.label}
                </ToggleButton>
              </span>
            </Tooltip>
          )
        )}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Edit raw HTML">
          <ToggleButton
            value="html"
            size="small"
            selected={htmlMode}
            onClick={toggleHtml}
            sx={{ border: 0, px: 1.2 }}
          >
            <HtmlIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </Stack>

      {htmlMode ? (
        <Box
          component="textarea"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          sx={{
            width: "100%",
            minHeight: 420,
            p: 2.5,
            border: 1,
            borderColor: "divider",
            borderRadius: "0 0 8px 8px",
            bgcolor: "background.paper",
            color: "text.primary",
            fontFamily: "monospace",
            fontSize: "0.86rem",
            resize: "vertical",
            "&:focus": { outline: "none", borderColor: "primary.main" },
          }}
        />
      ) : (
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          sx={{
            minHeight: 420,
            p: 2.5,
            border: 1,
            borderColor: "divider",
            borderRadius: "0 0 8px 8px",
            bgcolor: "background.paper",
            lineHeight: 1.7,
            overflowWrap: "break-word",
            "&:focus": { outline: "none", borderColor: "primary.main" },
            "& h2": { fontSize: "1.35rem", mt: 3, mb: 1 },
            "& h3": { fontSize: "1.12rem", mt: 2.5, mb: 1 },
            "& p": { my: 1.5 },
            "& ul, & ol": { pl: 3 },
            "& img": { maxWidth: "100%", borderRadius: 1, my: 2 },
            "& a": { color: "primary.main" },
            "& blockquote": {
              m: 0, my: 2, pl: 2, borderLeft: 3,
              borderColor: "primary.main", color: "text.secondary",
            },
            "& pre": {
              bgcolor: "action.hover", border: 1, borderColor: "divider",
              borderRadius: 1, p: 2, overflowX: "auto", fontSize: "0.88rem",
            },
          }}
        />
      )}
    </Box>
  );
}
