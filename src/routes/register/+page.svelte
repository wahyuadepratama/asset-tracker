<script lang="ts">
  import '../../global.css';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import { register } from '$lib/supabase/auth';
  import { getCurrentUser } from '$lib/supabase/auth';

  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMsg = '';

  onMount(async () => {
    const { user } = await getCurrentUser();
    if (user) {
      goto('/dashboard');
    }
  });

  async function handleRegister() {
    errorMsg = '';
    try {
      if (password !== confirmPassword) {
        errorMsg = 'Password and confirm password do not match';
        return;
      }
      const { error } = await register({ email, password });

      if (error) {
        errorMsg = error.message;
      } else {
        goto('/dashboard');
      }

    } catch (error: any) {
      errorMsg = 'Register failed';
    }
  }
</script>

<svelte:head>
  <title>Register - Asset Tracker</title>
</svelte:head>

<div class="login-container">
  <div class="login-card">
    <div class="login-title">Register to your account</div>
    {#if errorMsg}
      <div class="login-error">{errorMsg}</div>
    {/if}
    <form class="login-form" on:submit|preventDefault={handleRegister}>
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
      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          bind:value={confirmPassword}
          required
          placeholder="Confirm your password"
          autocomplete="new-password"
        />
      </div>
      <button class="btn-primary" type="submit">
        <Icon icon="solar:login-3-broken" width="20" height="20" />
        <span style="white-space: nowrap;">Register</span>
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
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    background: var(--color-bg, #f7fafc);
    z-index: 1;
  }
  .login-card {
    background: var(--color-background-dark);
    border-radius: 1.5rem;
    box-shadow: 0 4px 24px var(--color-btn-shadow, rgba(79,140,255,0.10));
    padding: 2.5rem 2.2rem 2rem 2.2rem;
    max-width: 370px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    font-family: var(--font-family-sans);
    margin: 2rem;
  }
  .login-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--color-primary-dark);
    text-align: center;
    margin-bottom: 0.5rem;
    letter-spacing: 1px;
    font-family: var(--font-family-sans);
  }
  .login-error {
    color: #e11d48; /* No variable for error red, fallback to hex */
    background: #fef2f2; /* No variable for error bg, fallback to hex */
    border-radius: 0.5rem;
    padding: 0.7rem 1rem;
    font-size: 1rem;
    text-align: center;
    margin-bottom: 0.5rem;
    font-family: var(--font-family-sans);
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    font-family: var(--font-family-sans);
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  label {
    font-size: 1rem;
    color: var(--color-text-dark);
    font-weight: 500;
    margin-bottom: 0.1rem;
  }
  input[type="email"],
  input[type="password"] {
    padding: 0.5rem 0.7rem;
    border: 1.5px solid var(--color-secondary);
    border-radius: 0.7rem;
    font-size: 1rem;
    background: var(--color-background-light);
    transition: border 0.2s;
    outline: none;
    color: var(--color-text-dark);
  }
  input[type="email"]:focus,
  input[type="password"]:focus {
    border-color: #38bdf8; /* No variable for focus blue, fallback to hex */
    background: var(--color-background-dark);
  }
  .login-footer {
    text-align: center;
    font-size: 0.98rem;
    color: var(--color-text-light);
    margin-top: 0.7rem;
    font-family: var(--font-family-sans);
  }
  .register-link {
    color: var(--color-primary-dark);
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.2rem;
    transition: color 0.2s;
  }
  .register-link:hover {
    color: #38bdf8; /* No variable for hover blue, fallback to hex */
    text-decoration: underline;
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-header-text);
    border: none;
    border-radius: 2rem;
    font-size: clamp(0.95rem,2.5vw,1.1rem);
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 12px var(--color-btn-shadow,rgba(79,140,255,0.12));
    transition: background 0.2s,transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 1em;
    width: 100%;
    justify-content: center;
    margin-top: 0.7em;
    box-sizing: border-box;
  }
  .btn-primary:hover {
    background: linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%);
    transform: translateY(-2px) scale(1.03);
  }
  @media (max-width:700px) {
    .btn-primary { padding:0.2rem 0.4rem; font-size:0.7rem; }
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
    .login-container {
      min-height: 100vh;
      min-width: 100vw;
    }
  }
</style>
