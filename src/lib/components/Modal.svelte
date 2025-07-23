
<script>
  import { fade, scale } from 'svelte/transition';
  export let show = false;
  export let onClose = () => {};
</script>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="modal-backdrop"
    on:click={onClose}
    transition:fade={{ duration: 30 }}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="modal"
      on:click|stopPropagation
      transition:scale={{ duration: 30, start: 0.96 }}>
      <slot />
      <button class="modal-close-btn" on:click={onClose} aria-label="Tutup modal">
        &times;
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(30, 41, 59, 0.32);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: background 0.2s;
    backdrop-filter: blur(1.5px);
  }
  .modal {
    position: relative;
    background: #fff;
    padding: 2.2rem 1.5rem 1.5rem 1.5rem;
    border-radius: 1.1rem;
    width: 100%;
    max-width: 410px;
    box-shadow: 0 8px 32px rgba(79, 140, 255, 0.13), 0 1.5px 8px rgba(0,0,0,0.04);
    animation: modal-pop 0.22s cubic-bezier(.4,1.4,.6,1) both;
    overflow: visible;
    margin: 1rem;
  }
  @keyframes modal-pop {
    0% { transform: scale(0.96) translateY(16px); opacity: 0.7; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  .modal-close-btn {
    position: absolute;
    top: 1.1rem;
    right: 1.1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #64748b;
    cursor: pointer;
    padding: 0.1em 0.4em;
    border-radius: 50%;
    transition: background 0.15s, color 0.15s;
    line-height: 1;
  }
  .modal-close-btn:hover, .modal-close-btn:focus {
    background: #f1f5f9;
    color: #2563eb;
    outline: none;
  }
  @media (max-width: 600px) {
    .modal {
      max-width: 97vw;
      padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    }
    .modal-close-btn {
      top: 0.7rem;
      right: 0.7rem;
      font-size: 1.2rem;
    }
  }
</style>
