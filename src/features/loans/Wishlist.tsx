import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
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
      toast.success('Libro eliminado de la lista de deseos');
      fetchWishlist();
    } else {
      toast.error('Error al eliminar el libro');
    }
  };

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando lista de deseos...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Mi Lista de Deseos</h1>
      
      {items.length === 0 ? (
        <div className="glass-panel p-12 text-center text-zinc-400">
          Tu lista de deseos está vacía.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map(item => (
            <div key={item.id} className="glass-panel flex flex-col overflow-hidden group hover:translate-y-[-4px] transition-all">
              <Link to={`/book/${item.book_id}`} className="h-52 bg-zinc-900 flex justify-center items-center overflow-hidden">
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-zinc-500 text-sm">Sin Portada</span>
                )}
              </Link>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-medium mb-1 line-clamp-2 text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 mb-4 flex-1">{item.author}</p>
                <button 
                  className="btn btn-secondary py-1.5 px-3 text-xs w-full text-red-400 border-red-500/30 hover:bg-red-500/20 flex items-center justify-center gap-1.5" 
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
