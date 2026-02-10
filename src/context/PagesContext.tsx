import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getPagesSlugs } from "../lib/apiFunctions";
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

