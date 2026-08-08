import { useEffect } from "react";

// A SPA has one static <title> in index.html, so each route sets its own.
// Also updates the meta description, which is what link previews read.
export function useDocumentTitle(title, description) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [title, description]);
}
