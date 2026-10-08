import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface WishlistItem {
  id: string;
  book_id: string;
  title: string;
  author: string;
  cover_url: string;
}

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .order('added_at', { ascending: false });
      
    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', id);
      
    if (!error) {
      fetchWishlist();
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando lista de deseos...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Mi Lista de Deseos</h1>
      
      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Tu lista de deseos está vacía.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
          {items.map(item => (
            <div key={item.id} className="glass-panel flex flex-col" style={{ overflow: 'hidden' }}>
              <Link to={`/book/${item.book_id}`} style={{ display: 'block', height: '200px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Sin Portada</span>
                )}
              </Link>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{item.author}</p>
                <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', width: '100%', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleRemove(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
