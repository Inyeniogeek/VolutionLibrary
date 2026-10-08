import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './services/supabase';
import { setAuth, clearAuth } from './features/auth/authSlice';
import type { RootState } from './store';
const Auth = lazy(() => import('./features/auth/Auth'));
const BookCatalog = lazy(() => import('./features/books/BookCatalog'));
const BookDetails = lazy(() => import('./features/books/BookDetails'));
const Loans = lazy(() => import('./features/loans/Loans'));
const Wishlist = lazy(() => import('./features/loans/Wishlist'));
import './index.css';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(clearAuth());
  };

  return (
    <nav className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--border-radius-xl)' }}>
      <h2 style={{ margin: 0, fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VolutionLibrary</h2>
      <div className="flex" style={{ gap: '1rem', alignItems: 'center' }}>
        <Link to="/">Catálogo</Link>
        {user ? (
          <>
            <Link to="/loans">Mis Préstamos</Link>
            <Link to="/wishlist">Lista de Deseos</Link>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.25rem 1rem' }}>Salir</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.25rem 1rem' }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({ user: session?.user || null, session }));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setAuth({ user: session?.user || null, session }));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <div className="container flex flex-col" style={{ minHeight: '100vh', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Cargando página...</div>}>
            <Routes>
              <Route path="/" element={<BookCatalog />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Auth />} />
            </Routes>
          </Suspense>
        </main>
        <footer style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Desarrollado por Inyeniogeek
        </footer>
      </div>
    </Router>
  );
}

export default App;
