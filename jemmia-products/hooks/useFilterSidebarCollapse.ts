import { useCallback, useEffect, useState } from "react";

export function useFilterSidebarCollapse(storageKey: string, defaultCollapsed = false) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return defaultCollapsed;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "true") return true;
      if (stored === "false") return false;
    } catch {
      /* ignore */
    }
    return defaultCollapsed;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, storageKey]);

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);
  const expand = useCallback(() => setCollapsed(false), []);
  const collapse = useCallback(() => setCollapsed(true), []);

  return { collapsed, setCollapsed, toggle, expand, collapse };
}
