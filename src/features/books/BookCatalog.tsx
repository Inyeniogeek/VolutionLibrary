import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import type { RootState } from '../../store';
import { searchBooks } from '../../services/bookApi';
import { setBooks, setLoading, setError, setSearchQuery } from './bookSlice';

const GENRES = [
  { id: 'aventura', label: 'Aventura', query: 'adventure' },
  { id: 'accion', label: 'Acción', query: 'action' },
  { id: 'scifi', label: 'Ciencia Ficción', query: 'science fiction' },
  { id: 'fantasia', label: 'Fantasía', query: 'fantasy' },
  { id: 'misterio', label: 'Misterio', query: 'mystery' },
  { id: 'romance', label: 'Romance', query: 'romance' },
  { id: 'terror', label: 'Terror', query: 'horror' },
  { id: 'historia', label: 'Historia', query: 'history' },
  { id: 'tecnologia', label: 'Tecnología', query: 'technology' }
];

const BookCatalog = () => {
  const dispatch = useDispatch();
  const { items, loading, error, searchQuery } = useSelector((state: RootState) => state.books);
  const [localQuery, setLocalQuery] = useState(searchQuery || 'adventure');
  const [activeGenre, setActiveGenre] = useState<string>('aventura');

  const fetchBooks = useCallback(async (query: string) => {
    dispatch(setLoading(true));
    dispatch(setSearchQuery(query));
    try {
      const results = await searchBooks(query);
      dispatch(setBooks(results));
    } catch (err: any) {
      dispatch(setError(err.message));
    }
  }, [dispatch]);

  useEffect(() => {
    if (items.length === 0) {
      fetchBooks(localQuery);
    }
  }, [fetchBooks, items.length, localQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setActiveGenre('');
      fetchBooks(localQuery);
    }
  };

  const handleGenreSelect = (genreId: string, query: string) => {
    setActiveGenre(genreId);
    setLocalQuery(query);
    fetchBooks(query);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Catálogo de Libros</h1>
        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">Encuentra tu próxima lectura en nuestra biblioteca digital.</p>
        
        <form onSubmit={handleSearch} className="flex items-center justify-center gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Buscar por título, autor o palabra clave..."
              className="w-full p-4 pl-12 rounded-2xl border border-white/10 bg-white/5 text-white outline-none text-base focus:border-indigo-500 transition-colors shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          </div>
          <button type="submit" className="btn btn-primary px-8 py-4 rounded-2xl font-medium shadow-xl" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          <span className="text-xs text-zinc-400 flex items-center gap-1 mr-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Géneros:
          </span>
          {GENRES.map((genre) => {
            const isActive = activeGenre === genre.id;
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreSelect(genre.id, genre.query)}
                className={`text-xs px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md shadow-indigo-500/25 scale-105'
                    : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl text-center mb-8 max-w-xl mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-zinc-400">Cargando libros...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} className="block group">
              <div 
                className="glass-panel h-full flex flex-col transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] rounded-2xl overflow-hidden border border-white/10"
              >
                <div className="h-[380px] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      loading="lazy" 
                    />
                  ) : (
                    <span className="text-zinc-500">Sin Portada</span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2 text-white line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-zinc-400 mb-4 flex-1">{book.authors.join(', ')}</p>
                  {book.categories.length > 0 && (
                    <span className="text-xs bg-white/10 text-indigo-300 px-3 py-1 rounded-full self-start font-medium">
                      {book.categories[0]}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {items.length === 0 && !loading && !error && (
            <div className="col-span-full text-center text-zinc-500 py-12">
              No se encontraron libros para "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCatalog;
