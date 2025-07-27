<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>Home - Asset Tracker</title>
</svelte:head>

<div class="welcome-container">
  <div class="welcome-title">Selamat Datang di Asset Tracker</div>
  <div class="welcome-desc">
    Tracking perkembangan nilai aset kamu dengan mudah.<br>
  </div>
  <div class="action-btns">
    <button class="btn-primary" on:click={() => goto('/login')}>Masuk</button>
    <button class="btn-primary" style="background:linear-gradient(90deg,#38c6ff 0%,#4f8cff 100%);" on:click={() => goto('/register')}>Daftar</button>
  </div>
</div>

<style>
  .welcome-container {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 4px 24px rgba(79, 140, 255, 0.08);
    padding: 2.5rem 2rem 2rem 2rem;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }

  .welcome-title {
    font-size: 2.1rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 0.5rem;
    text-align: center;
    letter-spacing: 1px;
  }

  .welcome-desc {
    font-size: 1.1rem;
    color: #4b5563;
    margin-bottom: 2.2rem;
    text-align: center;
    line-height: 1.6;
  }

  .action-btns {
    display: flex;
    gap: 1.2rem;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  .btn-primary { background:linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%); color:var(--color-header-text); border:none; border-radius:2rem; font-size:clamp(0.95rem,2.5vw,1.1rem); font-weight:600; cursor:pointer; box-shadow:0 2px 12px var(--color-btn-shadow,rgba(79,140,255,0.12)); transition:background 0.2s,transform 0.2s; display:flex; align-items:center; gap:0.5em; padding:0.5em 1em; width:100%; justify-content:center; margin-top:0.7em; box-sizing:border-box; }
  .btn-primary:hover { background:linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%); transform:translateY(-2px) scale(1.03); }
  @media (max-width:700px) {
    .btn-primary { padding:0.5rem 0.4rem; font-size:0.7rem; }
  }
  @media (max-width: 600px) {
    .welcome-container {
      padding: 1.2rem 0.5rem 1.5rem 0.5rem;
      max-width: 98vw;
    }
    .welcome-title {
      font-size: 1.3rem;
    }
    .welcome-desc {
      font-size: 0.98rem;
    }
    .action-btns {
      flex-direction: column;
      gap: 0.8rem;
    }
  }
</style>
