import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { WPMenuItem } from "../types/wordpress";

interface PagesContextType {
  pages: WPMenuItem[];
  loading: boolean;
  error: string | null;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);
export default PagesContext;

export function PagesProvider({ children }: { children: ReactNode }) {

  const [pages, setPages] = useState<WPMenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMenuPages = async () => {
      try {
        const { getMenuPageSlugs } = await import("../lib/pagesMenuApi");
        const menuPages = await getMenuPageSlugs();

        if (!isMounted) {
          return;
        }

        setPages(menuPages);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMenuPages();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PagesContext.Provider value={{ pages, loading, error }}>
      {children}
    </PagesContext.Provider>
  );
}

