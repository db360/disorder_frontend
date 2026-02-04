import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
  <NavBar />
  <main className="min-h-screen bg-primary-100 dark:bg-primary-500 transition-colors">{children}</main>
  <Footer />
  </>
);

export default Layout;