import React from "react";
import NavBar from "./NavBar";
import ScrollYProgress from "../ui/ScrollYProgress";
import Footer from "./Footer";


const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
  <ScrollYProgress />
  <NavBar />
  <main className="min-h-screen bg-primary-100 dark:bg-primary-500 transition-colors">
    {children}
  </main>
  {/* <div className="fixed bottom-0 left-0 w-full pointer-events-none z-99">
    <video
      className="w-full h-32 sm:h-36 md:h-40 object-cover"
      autoPlay
      muted
      loop
      playsInline
    >
      <source src="/videos/Fire_Wall_1.webm" type="video/webm" />
    </video>
  </div> */}
  <Footer />
  </>

);

export default Layout;