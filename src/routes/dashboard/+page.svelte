<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { refreshTokenIfNeeded } from '$lib/auth';
  import Icon from '@iconify/svelte';

  let assetCategories: any[] = [];

  onMount(async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      goto('/login');
      return;
    }

    await refreshTokenIfNeeded(); // cek dan refresh jika perlu

    const access_token = localStorage.getItem('access_token');

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_categories?select=*`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`
      }
    });

    const data = await res.json();
    assetCategories = data;
  });

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    goto('/login');
  }
</script>

<svelte:head>
  <title>Dashboard - Asset Tracker</title>
</svelte:head>

<div class="dashboard-container">
  <div class="dashboard-title-row">
    <h2 class="dashboard-title">Kategori Aset</h2>
  </div>
  <div class="table-responsive">
    <table class="asset-table">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Deskripsi</th>
        </tr>
      </thead>
      <tbody>
        {#if assetCategories.length > 0}
          {#each assetCategories as category}
            <tr>
              <td>{category.name}</td>
              <td>{category.description}</td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="2" class="empty-row">Belum ada kategori aset.</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
<div class="dashboard-footer">
  <button
    class="btn-primary logout-btn"
    on:click={handleLogout}>
    <Icon
      icon="streamline-flex:logout-1"
      width="20"
      height="20"
      style="flex-shrink: 0;"
    />
    <span style="white-space: nowrap;">Logout</span>
  </button>
</div>

<style>
  .dashboard-container {
    max-width: 700px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 1.2rem;
    box-shadow: 0 2px 16px rgba(79,140,255,0.07);
    padding: 1.5rem 1.2rem 2rem 1.2rem;
  }
  .dashboard-footer {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .dashboard-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }
  .dashboard-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2563eb;
    margin: 0;
  }
  .logout-btn {
    background: linear-gradient(90deg, #e11d48 0%, #f87171 100%);
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(225, 29, 72, 0.10);
    transition: background 0.2s, transform 0.2s;
    display: flex;
    width: 50%;
    align-items: center;
    gap: 0.5em;
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: 0.5em 1em 0.5em 1em !important;
  }
  .logout-btn:hover {
    background: linear-gradient(90deg, #f87171 0%, #e11d48 100%);
    transform: translateY(-2px) scale(1.03);
  }
  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }
  .asset-table {
    width: 100%;
    border-collapse: collapse;
    background: #f9fafb;
    border-radius: 0.7rem;
    overflow: hidden;
    font-size: 1rem;
  }
  .asset-table th, .asset-table td {
    padding: 0.7rem 1rem;
    text-align: left;
  }
  .asset-table th {
    background: #f1f5f9;
    color: #2563eb;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
  }
  .asset-table tr:not(:last-child) td {
    border-bottom: 1px solid #e5e7eb;
  }
  .empty-row {
    text-align: center;
    color: #9ca3af;
    font-style: italic;
  }
  @media (max-width: 600px) {
    .dashboard-container {
      padding: 1rem 0.3rem 1.2rem 0.3rem;
      margin: 1rem 0.2rem;
    }
    .dashboard-title-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.7rem;
    }
    .dashboard-title {
      font-size: 1.05rem;
      text-align: left;
    }
    .logout-btn {
      width: 100%;
      padding: 0.45rem 0;
      font-size: 0.95rem;
    }
    .asset-table th, .asset-table td {
      padding: 0.5rem 0.5rem;
      font-size: 0.97rem;
    }
  }
</style>
