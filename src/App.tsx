import "./App.css";

import {  useState } from "react";
import type { WordPressPage } from "./types/wordpress";

function App({page}: {page: WordPressPage}) {

  const [pages, setPages] = useState<WordPressPage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-3xl mb-4">Páginas de WordPress</h1>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.id} className="border p-3 rounded shadow">
            <div className="font-bold">{page.title}</div>
            <div className="text-sm text-gray-600">Slug: {page.slug}</div>
            <div className="text-xs text-gray-400">ID: {page.id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
