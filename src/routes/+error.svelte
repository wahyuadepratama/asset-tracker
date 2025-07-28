<script>
  import '../global.css';
  export let error;
  export let status;
</script>

<div class="error-container">
  <div class="error-status">{status ?? 500}</div>
  <div class="error-title">Terjadi Kesalahan</div>
  <div class="error-message">{error?.message ?? 'Maaf, terjadi kesalahan yang tidak terduga.'}</div>
  <button class="btn-primary" on:click={() => window.history.back()}>
    Kembali
  </button>
</div>

<style>
  .error-container {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--color-bg);
    padding: 2rem 1rem;
    border-radius: 1.5rem;
    box-shadow: 0 4px 24px rgba(79, 140, 255, 0.08);
    margin: 3rem auto;
    max-width: 480px;
    font-family: var(--font-family-sans);
  }

  .error-status {
    font-size: 4rem;
    font-weight: 800;
    color: var(--color-footer-text);
    margin-bottom: 0.5rem;
    letter-spacing: 2px;
    font-family: var(--font-family-sans);
  }

  .error-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--color-footer-text-2);
    margin-bottom: 0.5rem;
    text-align: center;
    font-family: var(--font-family-sans);
  }

  .error-message {
    font-size: 1.1rem;
    color: var(--color-footer-text-3);
    margin-bottom: 2rem;
    text-align: center;
    word-break: break-word;
    font-family: var(--font-family-sans);
  }
  @media (max-width:600px) {
    .error-container { margin:2rem 0.5rem; padding:1.5rem 0.5rem; max-width:98vw; }
    .error-status { font-size:2.5rem; }
    .error-title { font-size:1.2rem; }
  }

  .btn-primary { background:linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%); color:var(--color-header-text); border:none; border-radius:2rem; font-size:clamp(0.95rem,2.5vw,1.1rem); font-weight:600; cursor:pointer; box-shadow:0 2px 12px var(--color-btn-shadow,rgba(79,140,255,0.12)); transition:background 0.2s,transform 0.2s; display:flex; align-items:center; gap:0.5em; padding:0.5em 1em; width:100%; justify-content:center; margin-top:0.7em; box-sizing:border-box; }
  .btn-primary:hover { background:linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%); transform:translateY(-2px) scale(1.03); }
  @media (max-width:700px) {
    .btn-primary { padding:0.5rem 0.4rem; font-size:0.7rem; }
  }
</style>
