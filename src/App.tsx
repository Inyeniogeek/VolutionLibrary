import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
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
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <nav className="glass-panel p-6 mb-12 flex justify-between items-center rounded-3xl">
      <h2 className="m-0 text-3xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        VolutionLibrary
      </h2>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-zinc-300 hover:text-indigo-400 transition-colors">Catálogo</Link>
        {user ? (
          <>
            <Link to="/loans" className="text-zinc-300 hover:text-indigo-400 transition-colors">Mis Préstamos</Link>
            <Link to="/wishlist" className="text-zinc-300 hover:text-indigo-400 transition-colors">Lista de Deseos</Link>
            <button onClick={handleLogout} className="btn btn-secondary px-4 py-1 text-sm">Salir</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-secondary px-4 py-1 text-sm">Ingresar</Link>
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
      <Toaster position="top-right" richColors theme="dark" />
      <div className="max-w-7xl mx-auto px-6 min-h-screen flex flex-col py-6">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="text-center py-16 text-zinc-400">Cargando página...</div>}>
            <Routes>
              <Route path="/" element={<BookCatalog />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/login" element={<Auth />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="text-center mt-auto pt-8 text-zinc-500 text-sm">
          Desarrollado por Inyeniogeek
        </footer>
      </div>
    </Router>
  );
}

export default App;
