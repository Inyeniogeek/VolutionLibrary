import { useEffect, useState } from 'react';
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
      fetchLoans();
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Cargando préstamos...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Mis Préstamos</h1>
      
      {loans.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No tienes libros prestados actualmente.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {loans.map(loan => (
            <div key={loan.id} className="glass-panel flex" style={{ padding: '1rem', gap: '1rem' }}>
              <div style={{ width: '80px', height: '120px', flexShrink: 0, borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                {loan.cover_url ? (
                  <img src={loan.cover_url} alt={loan.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div className="flex flex-col" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{loan.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'auto' }}>{loan.author}</p>
                
                <div style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                  {loan.status === 'returned' ? (
                    <span style={{ color: 'var(--success)' }}>Devuelto</span>
                  ) : (
                    <>
                      <div style={{ color: isOverdue(loan.due_date) ? 'var(--danger)' : 'var(--warning)', marginBottom: '0.5rem' }}>
                        Vence: {new Date(loan.due_date).toLocaleDateString()}
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%' }} onClick={() => handleReturn(loan.id)}>
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
