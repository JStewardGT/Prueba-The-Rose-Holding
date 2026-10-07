import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getFriendlyErrorMessage } from '../lib/utils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión activa inicial
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error al recuperar sesión inicial:', error.message);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // 2. Suscribirse a cambios de estado en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Registro con correo y contraseña.
   * Si Supabase devuelve la sesión de inmediato la establece en el estado.
   * Si por alguna razón la sesión no viene en la respuesta, realiza signIn de inmediato.
   */
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) };
      }

      // Si data.session existe, actualizar el estado
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        return { success: true, user: data.user, session: data.session };
      }

      // Fallback: si no vino sesión de inmediato, autenticar directamente
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInRes.error) {
        // En caso extremo de que el proveedor aún requiera confirmación
        return {
          success: false,
          error:
            'Cuenta creada con éxito. Sin embargo, su confirmación de correo está pendiente en Supabase.',
        };
      }

      setSession(signInRes.data.session);
      setUser(signInRes.data.user);
      return { success: true, user: signInRes.data.user, session: signInRes.data.session };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  };

  /**
   * Inicio de sesión con correo y contraseña.
   */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: getFriendlyErrorMessage(error) };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      return { success: false, error: getFriendlyErrorMessage(err) };
    }
  };

  /**
   * Cierre de sesión voluntario.
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error.message);
      }
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Excepción al cerrar sesión:', err);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
