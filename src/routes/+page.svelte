<script lang="ts">
  import { goto } from '$app/navigation';
  import '../global.css';

  // State untuk mengontrol visibilitas menu mobile
  let isMobileMenuOpen = false;

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function handleLogin() {
    goto('/login');
    isMobileMenuOpen = false; // Tutup menu setelah klik
  }

  function handleRegister() {
    goto('/register');
    isMobileMenuOpen = false; // Tutup menu setelah klik
  }
</script>

<svelte:head>
  <title>Asset Tracker - Smart Asset Tracking</title>
  <meta name="description" content="Asset Tracker: A free, elegant, and modern solution to track all your assets efficiently.">
</svelte:head>

<div class="landing-page-container">
  <header class="header">
    <div class="logo">Asset Tracker</div>

    <button class="hamburger-menu" on:click={toggleMobileMenu} aria-label="Toggle navigation menu">
      <span class="bar" />
      <span class="bar" />
      <span class="bar" />
    </button>

    <nav class="nav" class:open={isMobileMenuOpen}>
      <button class="nav-button" on:click={handleLogin}>Login</button>
      <button class="nav-button primary" on:click={handleRegister}>Register</button>
    </nav>
  </header>

  <main class="hero-section">
    <div class="hero-content">
      <h1>Kelola Aset Pribadi & UMKM dengan Mudah.</h1>
      <p>Asset Tracker adalah solusi gratis dan modern untuk melacak semua aset kamu, pribadi maupun bisnis kecil - menengah dengan efisien. Monitoring pertumbuhan aset kamu dengan mudah.</p>
      <div class="hero-buttons">
        <button class="cta-button primary" on:click={handleRegister}>Mulai Gratis Sekarang</button>
        <button class="cta-button secondary" on:click={handleLogin}>Sudah Punya Akun?</button>
      </div>
    </div>
    <div class="hero-image">
      <svg width="250" height="250" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#4C6FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 7.27V17.73" stroke="#4C6FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 9.87L12 12L7 9.87" stroke="#4C6FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 7L12 12L22 7" stroke="#4C6FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </main>

  <section class="features-section">
    <h2>Mengapa Memilih Menggunakan Asset Tracker?</h2>
    <div class="features-grid">
      <div class="feature-card">
        <h3>Gratis</h3>
        <p>Nikmati semua fitur tanpa biaya tersembunyi. Pengelolaan aset kamu dengan mudah.</p>
      </div>
      <div class="feature-card">
        <h3>Antarmuka Modern</h3>
        <p>Desain intuitif dan bersih yang memudahkan kamu melacak, mengelompokkan, dan menganalisis aset.</p>
      </div>
      <div class="feature-card">
        <h3>Akses Universal</h3>
        <p>Akses data aset kamu kapan saja, di mana saja, dari perangkat apa pun.</p>
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>&copy; {new Date().getFullYear()} Asset Tracker. All rights reserved.</p>
  </footer>
</div>

<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family-sans);
    line-height: 1.6;
    color: var(--color-text-dark);
    background-color: var(--color-background-light);
    scroll-behavior: smooth;
  }

  h1, h2, h3 {
    font-family: var(--font-family-sans);
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--color-primary-dark);
    margin-bottom: 0.5em;
    line-height: 1.3;
  }

  p, li {
    font-family: var(--font-family-sans);
    font-size: 1.05rem;
    color: var(--color-text-light);
    margin-bottom: 1em;
    line-height: 1.7;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* --- Layout & Container --- */
  .landing-page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header, .hero-section, .features-section, .footer {
    padding: var(--spacing-lg) var(--spacing-xl);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 768px) {
    .header, .hero-section, .features-section, .footer {
      padding: var(--spacing-md) var(--spacing-lg);
    }
  }

  /* --- Header --- */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    position: relative; /* Penting untuk posisi menu mobile */
    z-index: 1000; /* Pastikan header di atas elemen lain */
  }

  .logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-primary);
    text-decoration: none;
    font-family: var(--font-family-sans);
  }

  .nav-button {
    background: none;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    font-family: var(--font-family-sans);
  }

  .nav-button:not(:last-child) {
    margin-right: var(--spacing-md);
  }

  .nav-button:hover {
    background-color: var(--color-primary);
    color: white;
  }

  .nav-button.primary {
    background-color: var(--color-primary);
    color: white;
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .nav-button.primary:hover {
    background-color: var(--color-primary);
  }

  /* Hamburger Menu Styles */
  .hamburger-menu {
    display: none; /* Sembunyikan secara default di desktop */
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    position: relative;
    z-index: 1001; /* Pastikan di atas nav saat terbuka */
    font-family: var(--font-family-sans);
  }

  .hamburger-menu .bar {
    width: 100%;
    height: 3px;
    background-color: var(--color-text-dark);
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: left;
  }

  /* Responsive Header for Mobile */
  @media (max-width: 768px) {
    .header {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .hamburger-menu {
      display: flex; /* Tampilkan di mobile */
    }

    .nav {
      /* Sembunyikan secara default di mobile */
      display: none;
      flex-direction: column;
      position: absolute;
      top: 100%; /* Di bawah header */
      left: 0;
      width: 100%;
      background-color: var(--color-background-dark);
      box-shadow: 0 8px 15px var(--color-shadow);
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      opacity: 0; /* Sembunyikan dengan opacity untuk transisi */
      visibility: hidden;
      transform: translateY(-10px); /* Geser sedikit ke atas */
      transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
    }

    .nav.open {
      display: flex; /* Tampilkan saat menu terbuka */
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .nav-button {
      width: 100%;
      text-align: center;
      margin: var(--spacing-sm) 0 !important; /* Overwrite margin-right */
      padding: var(--spacing-md);
      font-size: 1.1rem;
    }

    /* Hamburger animation */
    .hamburger-menu.open .bar:nth-child(1) {
      transform: translateY(9px) rotate(45deg);
    }

    .hamburger-menu.open .bar:nth-child(2) {
      opacity: 0;
    }

    .hamburger-menu.open .bar:nth-child(3) {
      transform: translateY(-9px) rotate(-45deg);
    }
  }

  /* --- Hero Section --- */
  .hero-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xxl);
    padding: var(--spacing-xxl) var(--spacing-xl);
    text-align: left;
    min-height: calc(100vh - 120px); /* Sesuaikan tinggi header */
  }

  .hero-content {
    flex: 1;
    max-width: 600px;
  }

  .hero-content h1 {
    font-family: var(--font-family-sans);
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-dark);
    margin-bottom: var(--spacing-md);
  }

  .hero-content p {
    font-size: 1.15rem;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
    line-height: 1.7;
    font-family: var(--font-family-sans);
  }

  .hero-buttons {
    display: flex;
    gap: var(--spacing-md);
  }

  .cta-button {
    padding: var(--spacing-lg) var(--spacing-xxl);
    font-size: 1.1rem;
    font-weight: 600;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    font-family: var(--font-family-sans);
  }

  .cta-button.primary {
    background-color: var(--color-primary);
    color: white;
  }

  .cta-button.primary:hover {
    background-color: white;
    box-shadow: 0 8px 15px rgba(var(--color-primary), 0.2);
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  }

  .cta-button.secondary {
    background-color: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .cta-button.secondary:hover {
    background-color: var(--color-primary);
    color: white
  }

  .hero-image {
    flex: 0.8;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 250px;
    max-width: 400px; /* Batasi ukuran ilustrasi */
  }

  .hero-image svg {
    width: 100%;
    height: auto;
    max-height: 350px;
  }

  @media (max-width: 1024px) {
    .hero-content h1 {
      font-size: 3rem;
    }
    .hero-image {
      max-width: 300px;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      flex-direction: column;
      text-align: center;
      padding: var(--spacing-xxl) var(--spacing-lg);
    }
    .hero-content {
      max-width: 100%;
      order: 2; /* Pindahkan konten di bawah gambar pada mobile */
    }
    .hero-content h1 {
      font-size: 2.5rem;
    }
    .hero-content p {
      font-size: 1rem;
    }
    .hero-buttons {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    .cta-button {
      width: 100%;
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: 1rem;
    }
    .hero-image {
      order: 1; /* Pindahkan gambar di atas konten pada mobile */
      margin-bottom: var(--spacing-xl);
      max-width: 250px;
    }
  }

  /* --- Features Section --- */
  .features-section {
    background-color: var(--color-background-dark);
    padding: var(--spacing-xxl) var(--spacing-xl);
    text-align: center;
    border-top: 1px solid var(--color-border);
  }

  .features-section h2 {
    font-family: var(--font-family-sans);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text-dark);
    margin-bottom: var(--spacing-xxl);
  }

  .features-grid {
    display: grid;
    gap: var(--spacing-xl);
  }

  .feature-card {
    background-color: white;
    padding: var(--spacing-xxl);
    border-radius: 12px;
    box-shadow: 0 10px 20px var(--color-shadow);
    text-align: left;
    transition: transform 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-card h3 {
    font-family: var(--font-family-sans);
    font-size: 1.5rem;
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
  }

  .feature-card p {
    color: var(--color-text-light);
    font-size: 1rem;
    font-family: var(--font-family-sans);
  }

  @media (max-width: 768px) {
    .features-section h2 {
      font-size: 2rem;
      margin-bottom: var(--spacing-xl);
    }
    .feature-card {
      padding: var(--spacing-lg);
    }
  }

  /* --- Footer --- */
  .footer {
    padding: var(--spacing-lg) var(--spacing-xl);
    margin-top: auto; /* Mendorong footer ke bawah */
    background-color: var(--color-text-dark);
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family-sans);
  }

  .footer p {
    font-size: 0.9rem;
    margin-bottom: var(--spacing-sm);
    font-family: var(--font-family-sans);
    color: white;
  }
</style>
