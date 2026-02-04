
const Page = ({ slug }: { slug: string }) => {
return <div><h1>Página: {slug}</h1></div>;
  // Aquí puedes hacer fetch de los datos de la página por slug
  // Y renderizar componentes diferentes según el slug
//   if (slug === "inicio") {
//     return <HomeComponent />;
//   }
//   if (slug === "contacto") {
//     return <ContactComponent />;
//   }
//   // ...otros casos
//   return <DefaultPageComponent slug={slug} />;
};

export default Page;