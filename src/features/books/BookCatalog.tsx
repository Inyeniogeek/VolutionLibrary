import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { searchBooks } from '../../services/bookApi';
import { setBooks, setLoading, setError, setSearchQuery } from './bookSlice';

const BookCatalog = () => {
  const dispatch = useDispatch();
  const { items, loading, error, searchQuery } = useSelector((state: RootState) => state.books);
  const [localQuery, setLocalQuery] = useState(searchQuery || 'programming');

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
      fetchBooks(localQuery);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Catálogo de Libros</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Encuentra tu próxima lectura en nuestra biblioteca digital.</p>
        
        <form onSubmit={handleSearch} className="flex items-center justify-center" style={{ gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Buscar por título, autor o palabra clave..."
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', borderRadius: 'var(--border-radius-lg)' }} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--border-radius-md)', textAlign: 'center', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Cargando libros...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
          {items.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} style={{ display: 'block' }}>
              <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all var(--transition-normal)' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
                <div style={{ height: '380px', overflow: 'hidden', borderTopLeftRadius: 'var(--border-radius-lg)', borderTopRightRadius: 'var(--border-radius-lg)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Sin Portada</span>
                  )}
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{book.authors.join(', ')}</p>
                  {book.categories.length > 0 && (
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-glass-light)', padding: '0.25rem 0.75rem', borderRadius: '999px', alignSelf: 'flex-start', color: 'var(--accent-primary)' }}>
                      {book.categories[0]}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {items.length === 0 && !loading && !error && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No se encontraron libros para "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCatalog;
