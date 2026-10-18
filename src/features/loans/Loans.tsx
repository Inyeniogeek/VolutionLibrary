import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, RotateCcw, BookOpen } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Loan {
  id: string;
  book_id: string;
  title: string;
  author: string;
  cover_url: string;
  due_date: string;
  status: string;
  returned_at?: string;
}

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('due_date', { ascending: true });
      
    if (!error && data) {
      setLoans(data);
    }
    setLoading(false);
  };

  const handleReturn = async (id: string) => {
    const returnTimestamp = new Date().toISOString();
    const { error } = await supabase
      .from('loans')
      .update({ status: 'returned', returned_at: returnTimestamp })
      .eq('id', id);
      
    if (!error) {
      toast.success('Libro devuelto con éxito');
      fetchLoans();
    } else {
      toast.error('Error al registrar la devolución del libro');
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando préstamos...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-semibold mb-8">Mis Préstamos</h1>
      
      {loans.length === 0 ? (
        <div className="glass-panel p-12 text-center text-zinc-400">
          No tienes libros prestados actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => (
            <div key={loan.id} className="glass-panel flex p-5 gap-4">
              <Link to={`/book/${loan.book_id}`} className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 hover:opacity-80 transition-opacity">
                {loan.cover_url ? (
                  <img src={loan.cover_url} alt={loan.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-1">
                    Sin Portada
                  </div>
                )}
              </Link>
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <Link to={`/book/${loan.book_id}`} className="hover:underline">
                    <h3 className="text-base font-semibold mb-1 text-white line-clamp-2">{loan.title}</h3>
                  </Link>
                  <p className="text-xs text-zinc-400">{loan.author}</p>
                </div>
                
                <div className="text-xs mt-3 pt-3 border-t border-white/5">
                  {loan.status === 'returned' ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Devuelto
                      </span>
                      {loan.returned_at && (
                        <p className="text-zinc-400 text-[11px] leading-tight">
                          Devuelto el: {new Date(loan.returned_at).toLocaleDateString()} a las {new Date(loan.returned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      <Link 
                        to={`/book/${loan.book_id}`} 
                        className="btn btn-secondary py-1 px-2.5 text-[11px] mt-1 self-start flex items-center gap-1 hover:text-indigo-400"
                      >
                        <BookOpen className="w-3 h-3" />
                        Volver a pedir
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className={`mb-2 font-medium ${isOverdue(loan.due_date) ? 'text-red-400' : 'text-amber-400'}`}>
                        Vence: {new Date(loan.due_date).toLocaleDateString()}
                      </div>
                      <button 
                        className="btn btn-secondary py-1.5 px-3 text-xs w-full flex items-center justify-center gap-1.5" 
                        onClick={() => handleReturn(loan.id)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Devolver Libro
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
