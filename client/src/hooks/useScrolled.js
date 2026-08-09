import { useEffect, useState } from "react";

// True once the page has scrolled past `threshold`.
//
// Replaces MUI's useScrollTrigger, which did not fire reliably in the admin
// layout. This reads window.scrollY directly, checks once on mount so a page
// restored mid-scroll starts in the right state, and uses a passive listener
// so it never blocks scrolling.
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > threshold
  );

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}
