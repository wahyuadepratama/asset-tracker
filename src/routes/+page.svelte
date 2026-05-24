<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import '../global.css';

  let isMobileMenuOpen = false;

  const features = [
    {
      icon: 'solar:wallet-money-bold-duotone',
      title: 'Gratis',
      description: 'Semua fitur inti tanpa biaya tersembunyi. Kelola aset pribadi maupun UMKM dengan tenang.',
      accent: 'green',
    },
    {
      icon: 'solar:chart-2-bold-duotone',
      title: 'Antarmuka Modern',
      description: 'Desain bersih dan intuitif untuk melacak, mengelompokkan, dan menganalisis pertumbuhan aset.',
      accent: 'blue',
    },
    {
      icon: 'solar:smartphone-2-bold-duotone',
      title: 'Akses Universal',
      description: 'Pantau data aset kapan saja dari perangkat apa pun — desktop maupun mobile.',
      accent: 'violet',
    },
  ];

  const highlights = [
    { label: 'Kategori fleksibel', icon: 'solar:folder-with-files-bold-duotone' },
    { label: 'Grafik pertumbuhan', icon: 'solar:graph-up-bold-duotone' },
    { label: 'Net worth real-time', icon: 'solar:pie-chart-2-bold-duotone' },
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false;
  }

  function handleLogin() {
    goto('/login');
    closeMobileMenu();
  }

  function handleRegister() {
    goto('/register');
    closeMobileMenu();
  }
</script>

<svelte:head>
  <title>Asset Tracker - Smart Asset Tracking</title>
  <meta name="description" content="Asset Tracker: solusi gratis dan modern untuk melacak semua aset pribadi sampai bisnis kecil dengan efisien. Monitoring pertumbuhan aset kamu dengan mudah.">
  <meta name="keywords" content="Asset Tracker, Aset, Pribadi, Bisnis, UMKM, Efisien, Modern, Gratis, Solusi, Monitoring, Pertumbuhan, Aset">
  <meta name="author" content="Asset Tracker">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow">
  <meta name="google" content="notranslate">

  <meta property="og:title" content="Asset Tracker - Smart Asset Tracking">
  <meta property="og:url" content="https://tracker.ajakan.me">
  <meta property="og:description" content="Asset Tracker adalah solusi gratis dan modern untuk melacak semua aset kamu, pribadi maupun bisnis kecil - menengah dengan efisien. Monitoring pertumbuhan aset kamu dengan mudah.">
  <meta property="og:image" content="https://ajakan.me/admin-theme/dist/img/ajakan.png">
  <meta property="og:site_name" content="Asset Tracker">
  <meta property="og:type" content="website">
</svelte:head>

<div class="page" class:page--menu-open={isMobileMenuOpen}>
  {#if isMobileMenuOpen}
    <button
      type="button"
      class="backdrop"
      aria-label="Tutup menu"
      on:click={closeMobileMenu}
    ></button>
  {/if}

  <header class="header">
    <div class="header__inner">
      <a href="/" class="brand">
        <span class="brand__icon" aria-hidden="true">
          <Icon icon="solar:box-bold-duotone" width="22" height="22" />
        </span>
        <span class="brand__text">Asset Tracker</span>
      </a>

      <nav class="nav-desktop" aria-label="Navigasi utama">
        <button type="button" class="btn btn--ghost" on:click={handleLogin}>Masuk</button>
        <button type="button" class="btn btn--primary" on:click={handleRegister}>Daftar Gratis</button>
      </nav>

      <button
        type="button"
        class="menu-toggle"
        class:menu-toggle--open={isMobileMenuOpen}
        on:click={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-nav"
        aria-label="Buka menu navigasi"
      >
        <span class="menu-toggle__bar"></span>
        <span class="menu-toggle__bar"></span>
        <span class="menu-toggle__bar"></span>
      </button>
    </div>

    <nav
      id="mobile-nav"
      class="nav-mobile"
      class:nav-mobile--open={isMobileMenuOpen}
      aria-label="Navigasi mobile"
    >
      <button type="button" class="btn btn--ghost btn--block" on:click={handleLogin}>Masuk</button>
      <button type="button" class="btn btn--primary btn--block" on:click={handleRegister}>Daftar Gratis</button>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero__glow" aria-hidden="true"></div>
      <div class="shell hero__grid">
        <div class="hero__copy">
          <span class="eyebrow">
            <Icon icon="solar:star-bold" width="14" height="14" />
            Gratis untuk pribadi & UMKM
          </span>
          <h1 class="hero__title">
            Kelola aset pribadi & UMKM dengan mudah
          </h1>
          <p class="hero__lead">
            Lacak semua aset kamu — dari tabungan hingga properti — dalam satu dashboard modern.
            Pantau pertumbuhan, kategori, dan net worth tanpa ribet.
          </p>

          <div class="hero__actions">
            <button type="button" class="btn btn--primary btn--lg" on:click={handleRegister}>
              <Icon icon="solar:rocket-2-bold" width="20" height="20" />
              Mulai Gratis Sekarang
            </button>
            <button type="button" class="btn btn--outline btn--lg" on:click={handleLogin}>
              Sudah punya akun?
            </button>
          </div>

          <ul class="hero__highlights">
            {#each highlights as item}
              <li>
                <Icon icon={item.icon} width="18" height="18" />
                <span>{item.label}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <div class="preview-card">
            <div class="preview-card__header">
              <span class="preview-card__dot preview-card__dot--red"></span>
              <span class="preview-card__dot preview-card__dot--amber"></span>
              <span class="preview-card__dot preview-card__dot--green"></span>
              <span class="preview-card__label">Dashboard</span>
            </div>
            <div class="preview-card__stats">
              <div class="stat-pill stat-pill--assets">
                <span class="stat-pill__label">Total Aset</span>
                <span class="stat-pill__value">Rp 842,5 jt</span>
              </div>
              <div class="stat-pill stat-pill--net">
                <span class="stat-pill__label">Net Worth</span>
                <span class="stat-pill__value">Rp 615,2 jt</span>
              </div>
            </div>
            <div class="preview-card__chart">
              <div class="chart-bar" style="height: 42%"></div>
              <div class="chart-bar" style="height: 68%"></div>
              <div class="chart-bar" style="height: 55%"></div>
              <div class="chart-bar" style="height: 82%"></div>
              <div class="chart-bar" style="height: 71%"></div>
              <div class="chart-bar" style="height: 90%"></div>
            </div>
            <div class="preview-card__rows">
              <div class="preview-row">
                <span class="preview-row__icon preview-row__icon--blue">
                  <Icon icon="solar:wallet-bold" width="16" height="16" />
                </span>
                <span class="preview-row__name">Asset Liquid</span>
                <span class="preview-row__amount">+12%</span>
              </div>
              <div class="preview-row">
                <span class="preview-row__icon preview-row__icon--violet">
                  <Icon icon="solar:home-2-bold" width="16" height="16" />
                </span>
                <span class="preview-row__name">Asset Non Liquid</span>
                <span class="preview-row__amount">+4%</span>
              </div>
            </div>
          </div>
          <div class="floating-badge floating-badge--top">
            <Icon icon="solar:shield-check-bold" width="18" height="18" />
            <span>Aman & privat</span>
          </div>
          <div class="floating-badge floating-badge--bottom">
            <Icon icon="solar:chart-bold" width="18" height="18" />
            <span>Statistik real-time</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features" id="fitur">
      <div class="shell">
        <div class="section-head">
          <p class="eyebrow eyebrow--center">Kenapa Asset Tracker?</p>
          <h2 class="section-head__title">Semua yang kamu butuhkan untuk mengelola aset</h2>
          <p class="section-head__lead">
            Dirancang ringan, cepat, dan mudah dipakai — cocok untuk pemula maupun yang sudah terbiasa mencatat keuangan.
          </p>
        </div>

        <div class="features__grid">
          {#each features as feature}
            <article class="feature-card feature-card--{feature.accent}">
              <div class="feature-card__icon">
                <Icon icon={feature.icon} width="28" height="28" />
              </div>
              <h3 class="feature-card__title">{feature.title}</h3>
              <p class="feature-card__text">{feature.description}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="shell">
        <div class="cta__card">
          <div class="cta__copy">
            <h2 class="cta__title">Siap mengatur aset dengan lebih rapi?</h2>
            <p class="cta__text">Buat akun gratis dalam hitungan menit dan mulai catat aset pertamamu hari ini.</p>
          </div>
          <div class="cta__actions">
            <button type="button" class="btn btn--white btn--lg" on:click={handleRegister}>
              Daftar Sekarang
            </button>
            <button type="button" class="btn btn--ghost-white btn--lg" on:click={handleLogin}>
              Masuk
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="shell footer__inner">
      <div class="footer__brand">
        <Icon icon="solar:box-bold-duotone" width="20" height="20" />
        <span>Asset Tracker</span>
      </div>
      <p class="footer__copy">&copy; {new Date().getFullYear()} Asset Tracker. Hak cipta dilindungi.</p>
    </div>
  </footer>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    color: #0f172a;
    font-family: var(--font-family-sans);
    overflow-x: hidden;
  }

  .page--menu-open {
    overflow: hidden;
  }

  .shell {
    width: 100%;
    max-width: 72rem;
    margin-inline: auto;
    padding-inline: clamp(1rem, 4vw, 2rem);
  }

  /* Header */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 0.75rem clamp(1rem, 4vw, 2rem);
    background: rgba(248, 250, 252, 0.72);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .page--menu-open .header,
  .header:has(.nav-mobile--open) {
    border-color: rgba(148, 163, 184, 0.2);
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
  }

  .header__inner {
    max-width: 72rem;
    margin-inline: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: inherit;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
  }

  .brand__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.65rem;
    background: linear-gradient(135deg, #4f8cff, #2563eb);
    color: #fff;
    box-shadow: 0 4px 14px rgba(79, 140, 255, 0.35);
  }

  .nav-desktop {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.35);
    border-radius: 0.65rem;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .menu-toggle__bar {
    display: block;
    height: 2px;
    width: 100%;
    background: #334155;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
  }

  .menu-toggle--open .menu-toggle__bar:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .menu-toggle--open .menu-toggle__bar:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle--open .menu-toggle__bar:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    border: none;
    background: rgba(15, 23, 42, 0.4);
    cursor: pointer;
    animation: fade-in 0.2s ease;
  }

  .nav-mobile {
    display: none;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 72rem;
    margin: 0.75rem auto 0;
    padding: 1rem;
    background: #fff;
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.1);
  }

  .nav-mobile--open {
    display: flex;
    animation: slide-down 0.25s ease;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border: none;
    border-radius: 999px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, background 0.2s, color 0.2s, border-color 0.2s;
    white-space: nowrap;
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn--primary {
    background: linear-gradient(135deg, #4f8cff 0%, #2563eb 100%);
    color: #fff;
    padding: 0.55rem 1.15rem;
    box-shadow: 0 4px 16px rgba(79, 140, 255, 0.35);
  }

  .btn--primary:hover {
    box-shadow: 0 6px 22px rgba(79, 140, 255, 0.45);
    transform: translateY(-1px);
  }

  .btn--ghost {
    background: transparent;
    color: #475569;
    padding: 0.55rem 1rem;
  }

  .btn--ghost:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .btn--outline {
    background: #fff;
    color: #2563eb;
    border: 1.5px solid rgba(79, 140, 255, 0.45);
    padding: 0.55rem 1.15rem;
  }

  .btn--outline:hover {
    background: #eff6ff;
    border-color: #4f8cff;
  }

  .btn--lg {
    padding: 0.75rem 1.35rem;
    font-size: 0.95rem;
  }

  .btn--block {
    width: 100%;
  }

  .btn--white {
    background: #fff;
    color: #1d4ed8;
    padding: 0.75rem 1.35rem;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.12);
  }

  .btn--white:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  }

  .btn--ghost-white {
    background: transparent;
    color: #fff;
    border: 1.5px solid rgba(255, 255, 255, 0.55);
    padding: 0.75rem 1.35rem;
  }

  .btn--ghost-white:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  /* Hero */
  .hero {
    position: relative;
    padding-block: clamp(2.5rem, 8vw, 5rem) clamp(3rem, 10vw, 6rem);
  }

  .hero__glow {
    position: absolute;
    top: -20%;
    right: -10%;
    width: min(55rem, 90vw);
    height: min(55rem, 70vh);
    background: radial-gradient(circle at 30% 30%, rgba(79, 140, 255, 0.18), transparent 65%),
      radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.1), transparent 55%);
    pointer-events: none;
  }

  .hero__grid {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 5vw, 4rem);
    align-items: center;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid rgba(79, 140, 255, 0.2);
    border-radius: 999px;
  }

  .eyebrow--center {
    margin-inline: auto;
  }

  .hero__title {
    margin: 0 0 1rem;
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .hero__lead {
    margin: 0 0 1.75rem;
    font-size: clamp(1rem, 2.2vw, 1.125rem);
    line-height: 1.7;
    color: #64748b;
    max-width: 34rem;
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
  }

  .hero__highlights {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem 1.25rem;
  }

  .hero__highlights li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: #475569;
  }

  .hero__highlights :global(svg) {
    color: #4f8cff;
    flex-shrink: 0;
  }

  /* Preview card */
  .hero__visual {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .preview-card {
    width: 100%;
    max-width: 22rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 1.25rem;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(79, 140, 255, 0.08);
    backdrop-filter: blur(12px);
    animation: float 6s ease-in-out infinite;
  }

  .preview-card__header {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .preview-card__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .preview-card__dot--red { background: #f87171; }
  .preview-card__dot--amber { background: #fbbf24; }
  .preview-card__dot--green { background: #4ade80; }

  .preview-card__label {
    margin-left: auto;
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .preview-card__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stat-pill {
    padding: 0.65rem 0.75rem;
    border-radius: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .stat-pill--assets {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
  }

  .stat-pill--net {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  }

  .stat-pill__label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .stat-pill__value {
    font-size: 0.82rem;
    font-weight: 700;
    color: #0f172a;
  }

  .preview-card__chart {
    display: flex;
    align-items: flex-end;
    gap: 0.35rem;
    height: 5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }

  .chart-bar {
    flex: 1;
    border-radius: 0.35rem 0.35rem 0.15rem 0.15rem;
    background: linear-gradient(180deg, #4f8cff, #93c5fd);
    min-height: 20%;
  }

  .preview-card__rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.6rem;
    background: #f8fafc;
    border-radius: 0.65rem;
  }

  .preview-row__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 0.5rem;
    color: #fff;
  }

  .preview-row__icon--blue { background: linear-gradient(135deg, #4f8cff, #2563eb); }
  .preview-row__icon--violet { background: linear-gradient(135deg, #8b5cf6, #6366f1); }

  .preview-row__name {
    flex: 1;
    font-size: 0.78rem;
    font-weight: 600;
    color: #334155;
  }

  .preview-row__amount {
    font-size: 0.75rem;
    font-weight: 700;
    color: #16a34a;
  }

  .floating-badge {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.75rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: #334155;
    background: #fff;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 999px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  .floating-badge :global(svg) {
    color: #4f8cff;
  }

  .floating-badge--top {
    top: 0;
    right: 0;
    animation: float 5s ease-in-out infinite reverse;
  }

  .floating-badge--bottom {
    bottom: 0;
    left: 0;
    animation: float 7s ease-in-out infinite 0.5s;
  }

  /* Features */
  .features {
    padding-block: clamp(3rem, 8vw, 5rem);
    background: #fff;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
  }

  .section-head {
    text-align: center;
    max-width: 40rem;
    margin: 0 auto 2.5rem;
  }

  .section-head__title {
    margin: 0 0 0.75rem;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #0f172a;
  }

  .section-head__lead {
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    color: #64748b;
  }

  .features__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .feature-card {
    padding: 1.5rem;
    border-radius: 1.15rem;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: #f8fafc;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    border-color: rgba(79, 140, 255, 0.25);
  }

  .feature-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.85rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .feature-card--green .feature-card__icon {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }

  .feature-card--blue .feature-card__icon {
    background: linear-gradient(135deg, #4f8cff, #2563eb);
  }

  .feature-card--violet .feature-card__icon {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
  }

  .feature-card__title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #0f172a;
  }

  .feature-card__text {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.65;
    color: #64748b;
  }

  /* CTA */
  .cta {
    padding-block: clamp(2.5rem, 6vw, 4rem);
  }

  .cta__card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: clamp(1.5rem, 4vw, 2.5rem);
    border-radius: 1.25rem;
    background: linear-gradient(135deg, #4f8cff 0%, #2563eb 55%, #1d4ed8 100%);
    box-shadow: 0 20px 50px rgba(37, 99, 235, 0.35);
  }

  .cta__title {
    margin: 0 0 0.5rem;
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .cta__text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.88);
    max-width: 28rem;
  }

  .cta__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  /* Footer */
  .footer {
    margin-top: auto;
    padding-block: 1.5rem;
    background: #0f172a;
    color: #94a3b8;
  }

  .footer__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .footer__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: #f8fafc;
  }

  .footer__brand :global(svg) {
    color: #4f8cff;
  }

  .footer__copy {
    margin: 0;
    font-size: 0.85rem;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  /* Responsive */
  @media (max-width: 900px) {
    .hero__grid {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .hero__lead {
      margin-inline: auto;
    }

    .hero__actions {
      justify-content: center;
    }

    .hero__highlights {
      justify-content: center;
    }

    .hero__visual {
      order: -1;
    }

    .features__grid {
      grid-template-columns: 1fr;
      max-width: 24rem;
      margin-inline: auto;
    }

    .cta__card {
      flex-direction: column;
      text-align: center;
    }

    .cta__actions {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .nav-desktop {
      display: none;
    }

    .menu-toggle {
      display: flex;
    }

    .hero__actions {
      flex-direction: column;
      width: 100%;
      max-width: 20rem;
      margin-inline: auto;
    }

    .hero__actions .btn {
      width: 100%;
    }

    .floating-badge--top {
      right: 0.5rem;
    }

    .floating-badge--bottom {
      left: 0.5rem;
    }

    .footer__inner {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (min-width: 769px) {
    .nav-mobile {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .preview-card,
    .floating-badge--top,
    .floating-badge--bottom {
      animation: none;
    }

    .btn:hover {
      transform: none;
    }
  }
</style>
