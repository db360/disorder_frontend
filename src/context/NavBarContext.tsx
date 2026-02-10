import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface NavBarContextValue {
  hidden: boolean;
  transparent: boolean;
  setHidden: (value: boolean) => void;
  setTransparent: (value: boolean) => void;
}

const NavBarContext = createContext<NavBarContextValue | undefined>(undefined);

export function NavBarProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [transparent, setTransparent] = useState(false);

  const value = useMemo(
    () => ({ hidden, transparent, setHidden, setTransparent }),
    [hidden, transparent]
  );

  return <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>;
}

export function useNavBar() {
  const ctx = useContext(NavBarContext);
  if (!ctx) {
    throw new Error("useNavBar must be used within NavBarProvider");
  }
  return ctx;
}
