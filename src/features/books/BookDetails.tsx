import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { getBookById } from '../../services/bookApi';
import type { Book } from '../../services/bookApi';
import { supabase } from '../../services/supabase';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getBookById(id)
        .then(data => {
          setBook(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleBorrow = async () => {
    if (!user) return navigate('/login');
    if (!book) return;
    
    setActionLoading(true);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const { error } = await supabase.from('loans').insert({
      user_id: user.id,
      book_id: book.id,
      title: book.title,
      author: book.authors[0],
      cover_url: book.coverUrl,
      due_date: dueDate.toISOString(),
      status: 'active'
    });

    setActionLoading(false);
    
    if (error) {
      alert('Error al procesar el préstamo');
    } else {
      alert('¡Libro prestado con éxito! Tienes 14 días para leerlo.');
      navigate('/loans');
    }
  };

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    if (!book) return;

    setActionLoading(true);
    
    const { error } = await supabase.from('wishlist').insert({
      user_id: user.id,
      book_id: book.id,
      title: book.title,
      author: book.authors[0],
      cover_url: book.coverUrl
    });

    setActionLoading(false);

    if (error) {
      alert('Error al añadir a la lista de deseos');
    } else {
      alert('Añadido a tu lista de deseos');
      navigate('/wishlist');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando detalles...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '4rem' }}>{error}</div>;
  if (!book) return null;

  return (
    <div className="animate-fade-in container" style={{ maxWidth: '900px' }}>
      <div className="glass-panel flex flex-col" style={{ padding: '2rem', gap: '2rem', borderTop: '4px solid var(--accent-primary)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '1rem' }}>
          &larr; Volver
        </button>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} style={{ borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-lg)', maxWidth: '100%', maxHeight: '400px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '250px', height: '350px', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Sin Portada
              </div>
            )}
          </div>

          <div className="flex flex-col" style={{ gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>{book.title}</h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>{book.authors.join(', ')}</p>
            </div>

            {book.categories.length > 0 && (
              <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                {book.categories.map(cat => (
                  <span key={cat} style={{ background: 'var(--bg-glass-light)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem' }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {book.publishedDate && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Fecha de publicación: {book.publishedDate}
              </p>
            )}

            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: book.description }} />

            <div className="flex" style={{ gap: '1rem', marginTop: 'auto', paddingTop: '2rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBorrow} disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : 'Tomar Prestado'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleWishlist} disabled={actionLoading}>
                Lista de Deseos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
