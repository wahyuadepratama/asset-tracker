export async function refreshTokenIfNeeded() {
  const expiresAt = parseInt(localStorage.getItem('expires_at') || '0');
  const now = Math.floor(Date.now() / 1000);

  if (now >= expiresAt - 60) {
    const refresh_token = localStorage.getItem('refresh_token');

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token })
    });

    const data = await res.json();

    if (res.ok) {
      const new_expires_at = now + data.expires_in;

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_in', data.expires_in.toString());
      localStorage.setItem('expires_at', new_expires_at.toString());
    } else {
      console.error('Refresh token failed:', data);
      localStorage.clear();
      window.location.href = '/login';
    }
  }
}
