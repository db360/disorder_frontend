import { useTheme } from "../hooks/useTheme";
import { usePages } from "../context/PagesContext";
import { Link } from "react-router-dom";

export default function NavBar() {
    const { theme, toggleTheme } = useTheme();
    const { pages, loading } = usePages();
    
    return (
        <header className="bg-primary-200 dark:bg-primary-800 transition-colors">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">Disorder</h1>
                    
                    {!loading && (
                        <ul className="flex gap-4">
                            {pages.map(page => (
                                <li key={page.id}>
                                    <Link 
                                        to={`/${page.slug}`}
                                        className="text-primary-900 dark:text-primary-100 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <button
                    onClick={toggleTheme}
                    className="px-2 py-2 rounded-full bg-primary-300 dark:bg-primary-700 hover:bg-primary-400 dark:hover:bg-primary-600 transition-colors text-primary-900 dark:text-primary-100"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </nav>
        </header>
    )
}