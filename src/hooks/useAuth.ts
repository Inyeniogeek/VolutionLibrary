import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { supabase } from '../services/supabase';
import { clearAuth } from '../features/auth/authSlice';

export const useAuth = () => {
  const { user, session, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(clearAuth());
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
};
