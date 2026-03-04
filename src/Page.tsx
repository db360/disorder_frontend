import Contacto from "./pages/Contacto";
import Equipo from "./pages/Equipo";
import Error from "./pages/Error";
import Gallery from "./pages/Gallery";
import Historia from "./pages/Historia";
import Index from "./pages/Index";
import StillBurning from "./pages/StillBurning";
import LoadingSpinner from "./ui/LoadingSpinner";

const Page = ({ slug, loading }: { slug: string, loading: boolean }) => {

  if (loading) {
    return <LoadingSpinner />;
  }

  if (slug === "inicio") {
    return <Index />;
  }
  if (slug === "contacto") {
    return <Contacto />;
  }
  if( slug === "estudio"){
    return <Historia />;
  }
  if( slug === "galeria"){
    return <Gallery />;
  }
  if( slug === "nuestro-equipo"){
    return <Equipo />;
  }
  if( slug === "still-burning"){
    return <StillBurning />;
  }
  // ...otros casos
  return <Error />;
};

export default Page;