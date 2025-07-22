<script>
  import '../global.css';
</script>

<div class="layout-container">
  <header>
    Asset Tracker
  </header>
  <main>
    <slot />
  </main>
  <footer>
    &copy; {new Date().getFullYear()} Asset Tracker &mdash; Created by Wahyu Ade Pratama
  </footer>
</div>

<style>
  .layout-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  }

  header {
    background: var(--color-header-bg);
    color: var(--color-header-text);
    padding: 1.5rem 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    box-shadow: var(--color-header-shadow);
  }

  main {
    flex: 1;
    padding: 2rem 1rem;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  footer {
    background: var(--color-footer-bg);
    color: var(--color-footer-text);
    text-align: center;
    padding: 1rem 0;
    font-size: 1rem;
    letter-spacing: 0.5px;
  }

  @media (max-width: 900px) {
    main {
      max-width: 100%;
      padding: 1.5rem 1rem;
    }
    header {
      padding: 1.2rem 1rem;
      font-size: 1.2rem;
    }
  }

  @media (max-width: 600px) {
    .layout-container {
      font-size: 0.97rem;
    }
    header {
      padding: 1rem 0.5rem;
      font-size: 1rem;
      text-align: center;
    }
    main {
      padding: 1rem 0.3rem;
    }
    footer {
      font-size: 0.7rem;
      padding: 0.7rem 0;
    }
  }
</style>
