import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getPagesSlugs } from "../lib/apiFunctions";
import type { WPMenuItem } from "../types/wordpress";

interface PagesContextType {
  pages: WPMenuItem[];
  loading: boolean;
  error: string | null;
}

const PagesContext = createContext<PagesContextType | undefined>(undefined);

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<WPMenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPagesSlugs()
      .then(setPages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PagesContext.Provider value={{ pages, loading, error }}>
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PagesContext);
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider");
  }
  return context;
}
