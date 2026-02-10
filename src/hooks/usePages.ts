import { useContext } from "react";
import PagesContext from "../context/PagesContext";

export default function usePages() {
  const context = useContext(PagesContext);
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider");
  }
  return context;
}
