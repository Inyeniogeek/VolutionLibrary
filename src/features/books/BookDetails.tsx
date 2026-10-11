import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
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
    if (!user) {
      toast.info('Por favor inicia sesión para pedir un préstamo');
      return navigate('/login');
    }
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
      toast.error('Error al procesar el préstamo');
    } else {
      toast.success('¡Libro prestado con éxito! Tienes 14 días para leerlo');
      navigate('/loans');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.info('Por favor inicia sesión para guardar en tu lista de deseos');
      return navigate('/login');
    }
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
      toast.error('Error al añadir a la lista de deseos');
    } else {
      toast.success('Añadido a tu lista de deseos con éxito');
      navigate('/wishlist');
    }
  };

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando detalles...</div>;
  if (error) return <div className="text-center text-red-400 py-16">{error}</div>;
  if (!book) return null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto w-full">
      <div className="glass-panel flex flex-col p-8 gap-8 border-t-4 border-indigo-500">
        <button onClick={() => navigate(-1)} className="bg-transparent border-0 text-zinc-400 hover:text-white cursor-pointer self-start text-base transition-colors">
          &larr; Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="rounded-xl shadow-2xl max-w-full max-h-[400px] object-cover" />
            ) : (
              <div className="w-[250px] h-[350px] bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                Sin Portada
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-white">
                {book.title}
              </h1>
              <p className="text-xl text-indigo-400 font-medium">{book.authors.join(', ')}</p>
            </div>

            {book.categories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {book.categories.map(cat => (
                  <span key={cat} className="bg-white/10 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {book.publishedDate && (
              <p className="text-zinc-400 text-sm">
                Fecha de publicación: {book.publishedDate}
              </p>
            )}

            <div className="text-zinc-300 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: book.description }} />

            <div className="flex gap-4 mt-auto pt-8">
              <button className="btn btn-primary flex-1 py-3 text-base" onClick={handleBorrow} disabled={actionLoading}>
                {actionLoading ? 'Procesando...' : 'Tomar Prestado'}
              </button>
              <button className="btn btn-secondary flex-1 py-3 text-base" onClick={handleWishlist} disabled={actionLoading}>
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
