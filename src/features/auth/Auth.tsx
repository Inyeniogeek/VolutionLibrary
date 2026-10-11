import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../services/supabase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Bienvenido de nuevo');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.info('Revisa tu correo para verificar tu cuenta');
      }
    } catch (err: any) {
      const msg = err.message || 'Error durante la autenticación';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-wrap items-center justify-between gap-12 flex-1">
      <div className="flex-1 min-w-[320px] p-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          VolutionLibrary
        </h1>
        <p className="text-xl text-zinc-300 leading-relaxed max-w-lg">
          Encuentra tus libros favoritos y tu próxima gran lectura en este catálogo digital.
        </p>
      </div>

      <div className="flex-1 min-w-[320px] flex justify-center">
        <div className="glass-panel animate-float p-10 md:p-14 w-full max-w-[450px] rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-center mb-8 text-2xl font-semibold text-white">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-zinc-400 font-medium">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none text-base focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm text-zinc-400 font-medium">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none text-base focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <button type="submit" className="btn btn-primary mt-4 py-3.5 text-base rounded-xl font-medium" disabled={loading}>
              {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear Cuenta'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-zinc-500">
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="bg-transparent border-0 text-indigo-400 cursor-pointer font-semibold hover:underline"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
