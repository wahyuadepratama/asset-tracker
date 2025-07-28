import { supabase } from './client';

export async function login({ email, password }: { email: string, password: string }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function register({ email, password }: { email: string, password: string }) {
  return await supabase.auth.signUp({ email, password });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

export async function getAccessToken(userId: string) {
  const { data, error } = await supabase.auth.getSession();
  return { access_token: data?.session?.access_token, error };
}
