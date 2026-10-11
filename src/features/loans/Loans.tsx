import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Loan {
  id: string;
  book_id: string;
  title: string;
  author: string;
  cover_url: string;
  due_date: string;
  status: string;
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
    const { error } = await supabase
      .from('loans')
      .update({ status: 'returned', returned_at: new Date().toISOString() })
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
              <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                {loan.cover_url ? (
                  <img src={loan.cover_url} alt={loan.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="text-base font-semibold mb-1 text-white">{loan.title}</h3>
                <p className="text-xs text-zinc-400 mb-auto">{loan.author}</p>
                
                <div className="text-xs mt-4">
                  {loan.status === 'returned' ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Devuelto
                    </span>
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
