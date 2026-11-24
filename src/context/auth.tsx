import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../lib/types';
import { getSession, getUsers, hashSenha, newId, saveUsers, setSession } from '../lib/storage';

type AuthState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'guest' }
  | { status: 'user'; user: User };

interface AuthContextValue {
  state: AuthState;
  login: (identificador: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  register: (dados: { nome: string; telefone: string; email: string; senha: string }) => Promise<{ ok: boolean; erro?: string }>;
  recover: (emailOuTelefone: string) => Promise<{ ok: boolean; erro?: string }>;
  explore: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizar(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, '');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) {
        setState({ status: 'none' });
        return;
      }
      if ('guest' in session) {
        setState({ status: 'guest' });
        return;
      }
      const users = await getUsers();
      const user = users.find((u) => u.id === session.userId) ?? null;
      setState(user ? { status: 'user', user } : { status: 'none' });
    })();
  }, []);

  const login = useCallback(async (identificador: string, senha: string) => {
    const users = await getUsers();
    const alvo = normalizar(identificador);
    const user = users.find(
      (u) => normalizar(u.email) === alvo || normalizar(u.telefone) === alvo,
    );
    if (!user) return { ok: false, erro: 'Conta não encontrada. Verifique o telefone/email.' };
    if (user.suspenso) return { ok: false, erro: 'Esta conta foi suspensa por abuso. Contacte o administrador.' };
    if (user.senhaHash !== hashSenha(senha)) return { ok: false, erro: 'Palavra-passe incorreta.' };
    await setSession({ userId: user.id });
    setState({ status: 'user', user });
    return { ok: true };
  }, []);

  const register = useCallback(
    async (dados: { nome: string; telefone: string; email: string; senha: string }) => {
      if (!dados.nome.trim()) return { ok: false, erro: 'Indique o seu nome.' };
      if (dados.senha.length < 6) return { ok: false, erro: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
      const users = await getUsers();
      const email = normalizar(dados.email);
      const telefone = normalizar(dados.telefone);
      if (users.some((u) => normalizar(u.email) === email)) return { ok: false, erro: 'Este email já está registado.' };
      if (users.some((u) => normalizar(u.telefone) === telefone)) return { ok: false, erro: 'Este telefone já está registado.' };
      const user: User = {
        id: newId(),
        nome: dados.nome.trim(),
        telefone: dados.telefone.trim(),
        email: dados.email.trim(),
        senhaHash: hashSenha(dados.senha),
        criadoEm: Date.now(),
      };
      await saveUsers([...users, user]);
      await setSession({ userId: user.id });
      setState({ status: 'user', user });
      return { ok: true };
    },
    [],
  );

  const recover = useCallback(async (emailOuTelefone: string) => {
    const users = await getUsers();
    const alvo = normalizar(emailOuTelefone);
    const user = users.find(
      (u) => normalizar(u.email) === alvo || normalizar(u.telefone) === alvo,
    );
    if (!user) return { ok: false, erro: 'Não encontrámos nenhuma conta com estes dados.' };
    return { ok: true };
  }, []);

  const explore = useCallback(async () => {
    await setSession({ guest: true });
    setState({ status: 'guest' });
  }, []);

  const logout = useCallback(async () => {
    await setSession(null);
    setState({ status: 'none' });
  }, []);

  const value = useMemo(
    () => ({ state, login, register, recover, explore, logout }),
    [state, login, register, recover, explore, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}
