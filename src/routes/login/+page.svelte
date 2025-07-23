<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import { login } from '$lib/supabase/auth';
  import { getCurrentUser } from '$lib/supabase/auth';

  let email = '';
  let password = '';
  let errorMsg = '';

  onMount(async () => {
    const { user } = await getCurrentUser();
    if (user) {
      goto('/dashboard');
    }
  });

  async function handleLogin() {
    errorMsg = '';
    try {
      const { error } = await login({ email, password });

      if (error) {
        errorMsg = error.message;
      } else {
        goto('/dashboard');
      }

    } catch (error: any) {
      errorMsg = 'Login failed';
    }
  }
</script>

<svelte:head>
  <title>Login - Asset Tracker</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="login-title">Login to your account</div>
    {#if errorMsg}
      <div class="login-error">{errorMsg}</div>
    {/if}
    <form class="login-form" on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          placeholder="Enter your email"
          autocomplete="username"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          placeholder="Enter your password"
          autocomplete="current-password"
        />
      </div>
      <button class="btn-primary" type="submit">
        <Icon icon="solar:login-3-broken" width="20" height="20" />
        <span style="white-space: nowrap;">Login</span>
      </button>
    </form>
    <div class="login-footer">
      Don't have an account?
      <a href="/register" class="register-link">Register</a>
    </div>
    <button
      class="btn-primary"
      on:click={() => goto('/')}
    >
      <Icon icon="mynaui:home" width="20" height="20" style="flex-shrink:0;" />
      <span style="white-space: nowrap;">Back to Home</span>
    </button>
  </div>
</div>

<style>
  .login-container {
    min-height: 25vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(120deg, #e0e7ff 0%, #f0f9ff 100%);
    padding: 1.5rem;
  }
  .login-card {
    background: #fff;
    border-radius: 1.5rem;
    box-shadow: 0 4px 24px rgba(79,140,255,0.10);
    padding: 2.5rem 2.2rem 2rem 2.2rem;
    max-width: 370px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  .login-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #2563eb;
    text-align: center;
    margin-bottom: 0.5rem;
    letter-spacing: 1px;
  }
  .login-error {
    color: #e11d48;
    background: #fef2f2;
    border-radius: 0.5rem;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  label {
    font-size: 1rem;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.1rem;
  }
  input[type="email"],
  input[type="password"] {
    padding: 0.5rem 0.7rem;
    border: 1.5px solid #dbeafe;
    border-radius: 0.7rem;
    font-size: 1rem;
    background: #f8fafc;
    transition: border 0.2s;
    outline: none;
  }
  input[type="email"]:focus,
  input[type="password"]:focus {
    border-color: #38bdf8;
    background: #fff;
  }
  .login-footer {
    text-align: center;
    font-size: 0.98rem;
    color: #64748b;
    margin-top: 0.7rem;
  }
  .register-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.2rem;
    transition: color 0.2s;
  }
  .register-link:hover {
    color: #38bdf8;
    text-decoration: underline;
  }
  @media (max-width: 600px) {
    .login-card {
      padding: 1.2rem 0.7rem 1.2rem 0.7rem;
      max-width: 98vw;
    }
    .login-title {
      font-size: 1.2rem;
    }
    input {
      padding: 0.5rem 0.7rem !important;
      font-size: 0.8rem !important;
    }
    label {
      font-size: 0.8rem !important;
    }
    .login-footer {
      font-size: 0.8rem !important;
    }
    .register-link {
      font-size: 0.8rem !important;
    }
    .login-error {
      font-size: 0.7rem !important;
      padding: 0.5rem 0.5rem !important;
    }
  }
</style>
