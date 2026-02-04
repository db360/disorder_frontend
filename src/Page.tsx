import Contacto from "./pages/Contacto";
import Equipo from "./pages/Equipo";
import Error from "./pages/Error";
import Gallery from "./pages/Gallery";
import Historia from "./pages/Historia";
import Index from "./pages/Index";

const Page = ({ slug, loading }: { slug: string, loading: boolean }) => {

  if (loading) {
    return <div>Loading...</div>;
  }

  if (slug === "inicio") {
    return <Index />;
  }
  if (slug === "contacto") {
    return <Contacto />;
  }
  if( slug === "historia"){
    return <Historia />;
  }
  if( slug === "galeria"){
    return <Gallery />;
  }
  if( slug === "nuestro-equipo"){
    return <Equipo />;
  }
  // ...otros casos
  return <Error />;
};

export default Page;