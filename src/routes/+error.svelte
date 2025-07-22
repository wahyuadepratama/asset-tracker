<script>
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
  }

  .error-status {
    font-size: 4rem;
    font-weight: 800;
    color: var(--color-footer-text);
    margin-bottom: 0.5rem;
    letter-spacing: 2px;
  }

  .error-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--color-footer-text-2);
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .error-message {
    font-size: 1.1rem;
    color: var(--color-footer-text-3);
    margin-bottom: 2rem;
    text-align: center;
    word-break: break-word;
  }
  @media (max-width:600px) {
    .error-container { margin:2rem 0.5rem; padding:1.5rem 0.5rem; max-width:98vw; }
    .error-status { font-size:2.5rem; }
    .error-title { font-size:1.2rem; }
  }
</style>
