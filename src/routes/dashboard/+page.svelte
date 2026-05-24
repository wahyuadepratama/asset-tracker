<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';

  import { getCurrentUser, getAccessToken } from '$lib/supabase/auth';
  import { getAssetCategories, addAssetCategory, deleteAssetCategory, updateAssetCategory } from '$lib/model/asset_categories';
  import { getAssets, addAsset, deleteAsset } from '$lib/model/assets';
  import { getAssetHistory, addAssetHistory, deleteAssetHistory, getDataChart, getDataChartByCategory } from '$lib/model/asset_history';

  import Modal from '$lib/components/Modal.svelte';
  import AssetGrowthChart from '$lib/components/AssetGrowthChart.svelte';
  import AssetValueChart from '$lib/components/AssetValueChart.svelte';
  import AssetAllocationPie from '$lib/components/AssetAllocationPie.svelte';
  import AssetAllocationDoughnutExLiability from '$lib/components/AssetAllocationDoughnutExLiability.svelte';
  import AssetAllocationPieLiabilityvsNon from '$lib/components/AssetAllocationPieLiabilityvsNon.svelte';

  let loading = true;

  let assetCategories: any[] = [];
  let assets: any[] = [];
  let assetHistory: any[] = [];
  let dataChart: any[] = [];
  let selectedChartCategoryId: string = 'all';
  let startYear: string = '';
  let endYear: string = '';
  let currentYear: number = new Date().getFullYear();

  let showAddCategoryModal = false;
  let showAddAssetModal = false;
  let showAddAssetHistoryModal = false;

  let categoryName = '';
  let categoryDescription = '';
  let isLiability = false;

  let showUpdateCategoryModal = false;
  let selectedCategory: any = null;

  let assetName = '';
  let assetDescription = '';
  let assetCategoryId = '';
  let assetCurrency = '';
  let depreciationRate = '';

  let selectedAsset: any = null;
  let displayValueCurrency = '';
  let zeroValueAsset = 'show';

  let expandedCategories: Record<string, boolean> = {};

  type ActiveView = 'data' | 'statistics';
  let activeView: ActiveView = 'data';
  let showAppMenu = false;

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function setActiveView(view: ActiveView) {
    activeView = view;
    showAppMenu = false;
  }

  function toggleAppMenu() {
    showAppMenu = !showAppMenu;
  }

  function closeAppMenu() {
    showAppMenu = false;
  }

  function getCategoryById(categoryId: string) {
    return assetCategories.find((category) => category.id === categoryId);
  }

  function getAssetsByCategory(categoryId: string) {
    return assets.filter((asset) => asset.category_id === categoryId);
  }

  function getVisibleAssetsByCategory(categoryId: string) {
    return getAssetsByCategory(categoryId).filter(
      (asset) => asset.total_value > 0 || zeroValueAsset === 'show'
    );
  }

  $: totalAssets = assets.reduce((sum, asset) => {
    const category = getCategoryById(asset.category_id);
    const value = Number(asset.total_value) || 0;
    return category?.is_liability ? sum : sum + value;
  }, 0);

  $: totalLiabilities = assets.reduce((sum, asset) => {
    const category = getCategoryById(asset.category_id);
    const value = Number(asset.total_value) || 0;
    return category?.is_liability ? sum + value : sum;
  }, 0);

  $: netWorth = totalAssets - totalLiabilities;

  let newHistory: any = {
    year: new Date().getFullYear(),
    month: '',
    value: '',
    value_in_currency: '',
    note: '',
  };

  onMount(async () => {
    try {
      loading = true;
      const { user: currentUser } = await getCurrentUser();
      console.log(currentUser);

      try {
        if (!currentUser) {
          goto('/login');
          return;
        }

        const { access_token } = await getAccessToken(currentUser.id);
        if (!access_token) {
          throw new Error('Failed to get access token');
        }

        // Fetch categories
        const res = await getAssetCategories(access_token);
        if (res.status !== 200) {
          throw new Error('Failed to fetch categories');
        }
        const data = res.data;
        assetCategories = data;
        if (!data || data.length === 0) {
          // Tambahkan kategori: Asset Liquid
          categoryName = 'Asset Liquid';
          categoryDescription = 'Aset yang mudah dicairkan menjadi uang tunai tanpa kehilangan nilai signifikan. Contohnya: uang di rekening, emas, reksa dana, cryptocurrency, dan piutang';
          isLiability = false;
          await handleAddCategory();

          // Tambahkan kategori: Asset Non Liquid
          categoryName = 'Asset Non Liquid';
          categoryDescription = 'Aset yang membutuhkan waktu atau proses lebih lama untuk dicairkan menjadi uang tunai, biasanya memiliki nilai tetap atau mengalami penyusutan. Contohnya: mobil, rumah, laptop, dan properti lainnya';
          isLiability = false;
          await handleAddCategory();

          // Tambahkan kategori: Hutang
          categoryName = 'Hutang';
          categoryDescription = 'Kewajiban finansial yang harus dibayarkan di masa depan. Termasuk utang pribadi, cicilan kendaraan, pinjaman online, atau pinjaman dari teman/kerabat';
          isLiability = true;
          await handleAddCategory();

          categoryName = '';
          categoryDescription = '';
          isLiability = false;
        }

        // Fetch assets
        const assetsRes = await getAssets(access_token);
        if (assetsRes.status !== 200) {
          throw new Error('Failed to fetch assets');
        }
        const assetsData = assetsRes.data;
        assets = assetsData;

        // Fetch asset history
        const assetHistoryRes = await getAssetHistory(access_token);
        if (assetHistoryRes.status !== 200) {
          throw new Error('Failed to fetch asset history');
        }
        const assetHistoryData = assetHistoryRes.data;
        assetHistory = assetHistoryData;

        calculateTotalValueAssetHistory();

        // Get data chart
        const dataChartRes = await getDataChart(Number(startYear), Number(endYear));
        if (dataChartRes.status !== 200) {
          throw new Error('Failed to fetch data chart');
        }
        dataChart = [...dataChartRes.data];

      } catch (err) {
        console.error('Failed to load data:', err);
      }

    } catch (err) {
      console.error('Failed to get current user:', err);
      goto('/login');
    }

    loading = false;
  });

  function rearrangeAssetHistory() {
    assetHistory = assetHistory.sort((a: any, b: any) => {
      const dateA = Number(a.year) * 100 + Number(a.month);
      const dateB = Number(b.year) * 100 + Number(b.month);
      return dateB - dateA;
    });
  }

  function calculateTotalValueAssetHistory() {
    // Calculate total value for each asset
    assets = assets.map((asset) => {
      const histories = assetHistory
        .filter((history: any) => history.asset_id === asset.id)
        .sort((a: any, b: any) => {
          const dateA = Number(a.year) * 100 + Number(a.month);
          const dateB = Number(b.year) * 100 + Number(b.month);
          if (dateA !== dateB) return dateA - dateB;
          if (a.id && b.id) return a.id.localeCompare(b.id);
          return 0;
        });

      const lastHistory = histories[histories.length - 1];

      // Kembalikan objek asset baru dengan properti total_value
      return {
        ...asset, // Salin semua properti asset yang sudah ada
        total_value: lastHistory ? Number(lastHistory.value_in_currency) : 0,
      };
    });
  }

  function handleOnTypeInputNumber() {
    const value = newHistory.value_in_currency;

    // Convert value to string before replace
    let strValue = String(value);
    // Remove non-numeric except comma and dot
    let num = strValue.replace(/[^0-9.,]/g, '');
    // Replace comma with dot for decimal, but we will ignore decimals
    num = num.replace(',', '.');
    // Parse to float, then to int (ignore decimals)
    let intVal = parseInt(Number(num).toString().split('.')[0]);
    if (isNaN(intVal)) intVal = 0;
    // Format to Indonesian Rupiah without decimals
    displayValueCurrency = intVal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function checkDepreciationRate(asset: any) {
    let filteredHistory = assetHistory
      .filter((history: any) => history.asset_id === asset.id)
      .sort((a: any, b: any) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      });
    let latestHistory = filteredHistory[0] !== undefined ? filteredHistory[0] : 0;

    if (latestHistory !== 0) {
      newHistory.value = latestHistory.value;
      if(selectedAsset.depreciation_rate) {
        let result = latestHistory.value_in_currency * (1 - selectedAsset.depreciation_rate / 100);
        newHistory.value_in_currency = parseInt(String(result).replace(/,/g, ''));
      } else {
        newHistory.value_in_currency = latestHistory.value_in_currency;
      }
    }

    handleOnTypeInputNumber();
  }

  async function handleFilterChart() {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    try {
      if(selectedChartCategoryId === 'all') {
        const res = await getDataChart(Number(startYear), Number(endYear));
        if (Math.floor(res.status / 100) !== 2) {
          throw new Error('Failed to fetch data chart');
        }
        dataChart = [];
        dataChart = [...res.data];
      } else {
        const res = await getDataChartByCategory(selectedChartCategoryId, Number(startYear), Number(endYear));
        if (Math.floor(res.status / 100) !== 2) {
          throw new Error('Failed to fetch data chart by category');
        }
        dataChart = [...res.data];
      }

    } catch (err) {
      console.error('Failed to fetch data chart by category:', err);
    }
  }

  async function handleAddCategory() {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    if (categoryName.trim() === '') {
      alert('Category name cannot be empty');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      console.log(categoryName, categoryDescription, isLiability, user.id);
      const res = await addAssetCategory(access_token, categoryName, categoryDescription, isLiability, user.id);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to add category');
      }

      categoryName = '';
      categoryDescription = '';
      assetCategories = [...assetCategories, res.data[0]];

    } catch (err) {
      console.error('Failed to add category:', err);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const confirmed = confirm('Are you sure you want to delete this category?');
    if (!confirmed) {
      return;
    }

    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      let res;
      try {
        res = await deleteAssetCategory(access_token, categoryId);
      } catch (error) {
        // Best practice: safely check error type and property
        if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
          alert('Category is still in use');
          return;
        }

        console.log(error);
        throw error;
      }

      assetCategories = assetCategories.filter((category: any) => category.id !== categoryId);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  }

  async function handleUpdateCategory() {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    if (selectedCategory.name.trim() === '') {
      alert('Category name cannot be empty');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      const res = await updateAssetCategory(access_token, selectedCategory.id, selectedCategory.name, selectedCategory.description);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to update category');
      }

      assetCategories = assetCategories.map((category: any) => category.id === selectedCategory.id ? res.data[0] : category);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  }

  async function handleAddAsset() {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    if (assetName.trim() === '') {
      alert('Asset name cannot be empty');
      return;
    }

    if (assetCategoryId.trim() === '') {
      alert('Asset category cannot be empty');
      return;
    }

    if (assetCurrency.trim() === '') {
      alert('Asset currency cannot be empty');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      // Bersihkan input depreciationRate: hapus %, ganti koma dengan titik, lalu konversi ke number
      let cleanedDepreciationRate = depreciationRate.replace('%', '').replace(',', '.').trim();
      const depreciationRateNumber = Number(cleanedDepreciationRate);

      const res = await addAsset(access_token, assetName, assetDescription, assetCategoryId, assetCurrency, depreciationRateNumber, user.id);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to add asset');
      }

      assets = [...assets, res.data[0]];
      calculateTotalValueAssetHistory();
      rearrangeAssetHistory();

    } catch (err) {
      console.error('Failed to add asset:', err);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    const confirmed = confirm('Are you sure you want to delete this asset?');
    if (!confirmed) {
      return;
    }

    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      const res = await deleteAsset(access_token, assetId);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to delete asset');
      }

      assets = assets.filter((asset: any) => asset.id !== assetId);
      calculateTotalValueAssetHistory();
      rearrangeAssetHistory();

    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  }

  async function handleAddAssetHistory() {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    if (String(newHistory.year).trim() === '') {
      alert('Year cannot be empty');
      return;
    }

    if (newHistory.month.trim() === '') {
      alert('Month cannot be empty');
      return;
    }

    if (String(newHistory.value).trim() === '') {
      alert('Value cannot be empty');
      return;
    }

    if (String(newHistory.value_in_currency).trim() === '') {
      alert('Value in currency cannot be empty');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      let res;
          res = await addAssetHistory(
            access_token,
            selectedAsset.id,
            newHistory.month.toString(),
            newHistory.year.toString(),
            (() => {
              // Ganti koma dengan titik
              let val = String(newHistory.value).replaceAll(',', '.');
              // Cek apakah ada titik desimal
              if (val.includes('.')) {
                // Pisahkan bagian desimal
                const [intPart, decPart] = val.split('.');
                // Jika ada lebih dari 8 digit di belakang koma, potong jadi 8
                if (decPart.length > 8) {
                  return Number(intPart + '.' + decPart.slice(0, 8));
                }
              }
              return Number(val);
            })(),
            (() => {
              let val = String(newHistory.value_in_currency).replaceAll(',', '.');
              return Number(val);
            })(),
            newHistory.note
          );
          if (Math.floor(res.status / 100) !== 2) {
            throw new Error('Failed to add asset history for asset ' + selectedAsset.name);
          }

        assetHistory = [...assetHistory, res.data[0]];
        calculateTotalValueAssetHistory();
        rearrangeAssetHistory();

    } catch (err) {
      console.error('Failed to add asset history:', err);
      alert('Failed to add asset history');
    }
  }

  async function handleDeleteAssetHistory(assetHistoryId: string) {
    const { user } = await getCurrentUser();
    if (!user) {
      goto('/login');
      return;
    }

    try {
      const { access_token } = await getAccessToken(user.id);
      if (!access_token) {
        throw new Error('Failed to get access token');
      }

      const res = await deleteAssetHistory(access_token, assetHistoryId);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to delete asset history');
      }

      assetHistory = assetHistory.filter((history) => history.id !== assetHistoryId);
      calculateTotalValueAssetHistory();
      rearrangeAssetHistory();

    } catch (err) {
      console.error('Failed to delete asset history:', err);
      alert('Failed to delete asset history');
    }
  }

  // Make sure this is only once in your module context (put at top if not)
  // For this snippet's context, assume this addition:

  function toggleCategoryCollapse(categoryId: string) {
    expandedCategories = {
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId]
    };
  }
</script>

<svelte:head>
  <title>Dashboard - Asset Tracker</title>
</svelte:head>

{#if loading}
  <div class="loading-container">
    <div class="loading-spinner" aria-hidden="true"></div>
    <h3 class="loading-title">Memuat data...</h3>
  </div>
{/if}

{#if !loading}
<div class="dashboard-shell">
  <section class="view-header">
    <div class="view-header__text">
      <p class="view-eyebrow">{activeView === 'statistics' ? 'Ringkasan' : 'Portfolio'}</p>
      <h1 class="view-title">{activeView === 'statistics' ? 'Statistik' : 'Data Aset'}</h1>
    </div>
    {#if activeView === 'data'}
      <div class="view-header__actions">
        <select class="input input-compact" bind:value={zeroValueAsset} aria-label="Filter aset nol">
          <option value="hide">Sembunyikan nilai 0</option>
          <option value="show">Tampilkan nilai 0</option>
        </select>
      </div>
    {/if}
  </section>

  {#if activeView === 'statistics'}
    <section class="summary-grid" aria-label="Ringkasan keuangan">
      <article class="summary-card summary-card--primary">
        <span class="summary-label">Net Worth</span>
        <strong class="summary-value">IDR {netWorth.toLocaleString('id-ID')}</strong>
      </article>
      <article class="summary-card">
        <span class="summary-label">Total Aset</span>
        <strong class="summary-value">IDR {totalAssets.toLocaleString('id-ID')}</strong>
      </article>
      <article class="summary-card summary-card--danger">
        <span class="summary-label">Total Hutang</span>
        <strong class="summary-value">IDR {totalLiabilities.toLocaleString('id-ID')}</strong>
      </article>
    </section>

    <section class="panel" aria-label="Filter statistik">
      <div class="panel-heading">
        <Icon icon="mdi:filter-variant" width="18" height="18" />
        <span>Filter Chart</span>
      </div>
      <div class="filter-stack">
        <select class="input" bind:value={selectedChartCategoryId} on:change={() => handleFilterChart()}>
          <option value="" disabled selected>Pilih Kategori</option>
          <option value="all">Semua Kategori</option>
          {#each assetCategories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
        <div class="filter-row">
          <select id="startYear" class="input" bind:value={startYear} on:change={async () => { await handleFilterChart(); }}>
            <option value="" disabled selected={startYear === ''}>Tahun Awal</option>
            {#each Array.from({ length: 11 }, (_, i) => currentYear - 5 + i) as year}
              <option value={year} selected={+startYear === year}>{year}</option>
            {/each}
          </select>
          <select id="endYear" class="input" bind:value={endYear} on:change={async () => { await handleFilterChart(); }}>
            <option value="" disabled selected={endYear === ''}>Tahun Akhir</option>
            {#each Array.from({ length: 11 }, (_, i) => currentYear - 5 + i) as year}
              <option value={year} selected={+endYear === year}>{year}</option>
            {/each}
          </select>
        </div>
      </div>
    </section>

    {#if dataChart.length > 0}
      <section class="chart-card">
        <h2 class="chart-title">Pertumbuhan Aset</h2>
        <div class="chart-body">
          <AssetGrowthChart assetHistory={dataChart} />
        </div>
      </section>
      {#if selectedChartCategoryId !== 'all'}
        <section class="chart-card">
          <h2 class="chart-title">Nilai Aset</h2>
          <div class="chart-body">
            <AssetValueChart assetHistory={dataChart} />
          </div>
        </section>
      {/if}
      {#if selectedChartCategoryId === 'all'}
        <section class="chart-card">
          <h2 class="chart-title">Alokasi Aset</h2>
          <div class="chart-body">
            <AssetAllocationPie assets={assets} assetCategories={assetCategories} />
          </div>
        </section>
        <section class="chart-card">
          <h2 class="chart-title">Alokasi Tanpa Hutang</h2>
          <div class="chart-body">
            <AssetAllocationDoughnutExLiability assets={assets} assetCategories={assetCategories} />
          </div>
        </section>
        <section class="chart-card">
          <h2 class="chart-title">Hutang vs Non-Hutang</h2>
          <div class="chart-body">
            <AssetAllocationPieLiabilityvsNon assets={assets} assetCategories={assetCategories} />
          </div>
        </section>
      {/if}
    {:else if selectedChartCategoryId !== 'all'}
      <section class="empty-state">
        <Icon icon="mdi:chart-line-variant" width="40" height="40" />
        <p>Belum ada data chart. Pilih kategori atau rentang tahun lain.</p>
      </section>
    {/if}
  {/if}

  {#if activeView === 'data'}
    {#if assetCategories.length > 0}
      {#each assetCategories as category (category.id)}
        {@const categoryAssets = getVisibleAssetsByCategory(category.id)}
        <article class="category-card">
          <header class="category-header">
            <button
              type="button"
              class="category-toggle"
              aria-label={expandedCategories[category.id] ? 'Tutup kategori' : 'Buka kategori'}
              on:click={() => toggleCategoryCollapse(category.id)}
            >
              <Icon icon={expandedCategories[category.id] ? 'mdi:chevron-up' : 'mdi:chevron-down'} width="22" height="22" />
            </button>
            <div class="category-meta">
              <button
                type="button"
                class="category-name-btn"
                on:click={() => {
                  showUpdateCategoryModal = true;
                  selectedCategory = category;
                }}
              >
                {category.name}
                {#if category.is_liability}
                  <span class="badge badge--danger">Hutang</span>
                {/if}
                <Icon icon="mdi:pencil-outline" width="16" height="16" />
              </button>
              {#if category.description}
                <p class="category-desc">{category.description}</p>
              {/if}
            </div>
            <div class="category-actions">
              <button
                type="button"
                class="icon-btn icon-btn--primary"
                title="Tambah Aset"
                on:click={() => {
                  showAddAssetModal = true;
                  assetCategoryId = category.id;
                }}
              >
                <Icon icon="mdi:plus" width="20" height="20" />
              </button>
              {#if getAssetsByCategory(category.id).length === 0}
                <button
                  type="button"
                  class="icon-btn icon-btn--danger"
                  title="Hapus Kategori"
                  on:click={() => handleDeleteCategory(category.id)}
                >
                  <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                </button>
              {/if}
            </div>
          </header>
          {#if expandedCategories[category.id]}
            {#if categoryAssets.length > 0}
              {#each categoryAssets as asset (asset.id)}
                <section class="asset-card">
                  <div class="asset-header">
                    <div>
                      <h3 class="asset-name">{asset.name}</h3>
                      {#if asset.description}
                        <p class="asset-desc">{asset.description}</p>
                      {/if}
                      {#if asset.depreciation_rate}
                        <p class="asset-depreciation">Depresiasi: {asset.depreciation_rate}% / bulan</p>
                      {/if}
                    </div>
                    <p class="asset-value">{asset.currency} {Number(asset.total_value).toLocaleString('id-ID')}</p>
                  </div>
                  <div class="history-list">
                    <div class="history-scroll">
                      {#each assetHistory.filter((history) => history.asset_id === asset.id) as history (history.id)}
                      <div class="history-item">
                        <div class="history-main">
                          <span class="history-date">{monthLabels[Number(history.month) - 1]} {history.year}</span>
                          <span class="history-amount">{Number(history.value_in_currency).toLocaleString('id-ID')}</span>
                        </div>
                        <div class="history-sub">
                          <span>Qty: {history.value}</span>
                          {#if history.note}
                            <span class="history-note">{history.note}</span>
                          {/if}
                        </div>
                        <button
                          type="button"
                          class="history-delete"
                          title="Hapus riwayat"
                          on:click={() => handleDeleteAssetHistory(history.id)}
                        >
                          <Icon icon="mdi:trash-can-outline" width="16" height="16" />
                        </button>
                      </div>
                    {:else}
                      <button type="button" class="history-empty" on:click={() => handleDeleteAsset(asset.id)}>
                        <Icon icon="mdi:trash-can-outline" width="16" height="16" />
                        Hapus aset (belum ada riwayat)
                      </button>
                    {/each}
                    </div>
                    <button
                      type="button"
                      class="history-add"
                      on:click={() => {
                        showAddAssetHistoryModal = true;
                        selectedAsset = asset;
                        checkDepreciationRate(asset);
                      }}
                    >
                      <Icon icon="mdi:plus" width="18" height="18" />
                      Tambah riwayat
                    </button>
                  </div>
                </section>
              {/each}
            {:else if getAssetsByCategory(category.id).length === 0}
              <p class="category-empty">Belum ada aset di kategori ini.</p>
            {:else}
              <p class="category-empty">Semua aset disembunyikan (nilai 0).</p>
            {/if}
          {/if}
        </article>
      {/each}
    {:else}
      <section class="empty-state">
        <Icon icon="mdi:folder-open-outline" width="40" height="40" />
        <p>Belum ada kategori. Tambahkan kategori pertama Anda.</p>
      </section>
    {/if}
    <button type="button" class="add-category-btn" on:click={() => { showAddCategoryModal = true; }}>
      <Icon icon="mdi:folder-plus-outline" width="20" height="20" />
      Tambah Kategori
    </button>
  {/if}

  {#if showAppMenu}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="app-menu-backdrop" on:click={closeAppMenu} role="presentation"></div>
  {/if}

  <nav class="floating-nav" aria-label="Navigasi utama">
    {#if showAppMenu}
      <div class="app-menu-sheet">
        <p class="app-menu-label">Menu</p>
        <div class="app-menu-grid">
          <button type="button" class="app-menu-item" class:app-menu-item--active={activeView === 'data'} on:click={() => setActiveView('data')}>
            <span class="app-menu-icon app-menu-icon--blue"><Icon icon="mdi:database-outline" width="24" height="24" /></span>
            <span>Data</span>
          </button>
          <button type="button" class="app-menu-item" class:app-menu-item--active={activeView === 'statistics'} on:click={() => setActiveView('statistics')}>
            <span class="app-menu-icon app-menu-icon--violet"><Icon icon="mdi:chart-areaspline" width="24" height="24" /></span>
            <span>Statistik</span>
          </button>
          <button type="button" class="app-menu-item" on:click={() => { closeAppMenu(); showAddCategoryModal = true; }}>
            <span class="app-menu-icon app-menu-icon--green"><Icon icon="mdi:folder-plus-outline" width="24" height="24" /></span>
            <span>Kategori</span>
          </button>
          <button type="button" class="app-menu-item" on:click={() => { closeAppMenu(); showAddAssetModal = true; }}>
            <span class="app-menu-icon app-menu-icon--amber"><Icon icon="mdi:plus-box-outline" width="24" height="24" /></span>
            <span>Aset</span>
          </button>
        </div>
      </div>
    {/if}
    <div class="floating-dock">
      <button type="button" class="dock-btn" class:dock-btn--active={activeView === 'data'} on:click={() => setActiveView('data')}>
        <Icon icon="mdi:database-outline" width="22" height="22" />
        <span>Data</span>
      </button>
      <button type="button" class="dock-menu-btn" class:dock-menu-btn--open={showAppMenu} aria-label="Buka menu aplikasi" aria-expanded={showAppMenu} on:click={toggleAppMenu}>
        <Icon icon={showAppMenu ? 'mdi:close' : 'mdi:apps'} width="26" height="26" />
      </button>
      <button type="button" class="dock-btn" class:dock-btn--active={activeView === 'statistics'} on:click={() => setActiveView('statistics')}>
        <Icon icon="mdi:chart-areaspline" width="22" height="22" />
        <span>Statistik</span>
      </button>
    </div>
  </nav>
</div>
{/if}

<!-- Add Category Modal -->
<Modal show={showAddCategoryModal} onClose={() => showAddCategoryModal = false}>
  <div class="modal-add-category">
    <h3 class="modal-title">New Category</h3>
    <form class="modal-form" on:submit|preventDefault={() => {
      handleAddCategory();
      showAddCategoryModal = false;
    }}>
      <div class="form-group">
        <input
          type="text"
          placeholder="Category Name"
          class="input"
          required
          bind:value={categoryName}
        />
      </div>
      <div class="form-group">
        <input
          type="text"
          placeholder="Description (Optional)"
          class="input"
          bind:value={categoryDescription}
        />
      </div>
      <div class="form-group">
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="padding: 0.25rem 0; font-weight: 500;">Is Liability?</td>
              <td style="text-align: right; padding: 0.25rem 0;">
                <span class="switch">
                  <input
                    type="checkbox"
                    id="isLiability"
                    name="isLiability"
                    checked={isLiability}
                    style="display: none;"
                  />
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <span aria-label="Toggle Liability" class="slider" on:click={() => { isLiability = !isLiability; }}></span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <style>
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        .switch input:checked + .slider {
          background-color: #2563eb;
        }
        .switch input:focus + .slider {
          box-shadow: 0 0 1px #2563eb;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 22px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        .switch input:checked + .slider:before {
          transform: translateX(18px);
        }
      </style>
      <button
        type="submit"
        class="btn-primary btn-block">
        Add
      </button>
    </form>
  </div>
</Modal>

<!-- Update Category Modal -->
<Modal show={showUpdateCategoryModal} onClose={() => showUpdateCategoryModal = false}>
  <div class="modal-add-category">
    <h3 class="modal-title">Update Category</h3>
    <form class="modal-form" on:submit|preventDefault={() => {
      handleUpdateCategory();
      showUpdateCategoryModal = false;
    }}>
      <div class="form-group">
        <input
          type="text"
          placeholder="Category Name"
          class="input"
          required
          bind:value={selectedCategory.name}
        />
      </div>
      <div class="form-group">
        <input
          type="text"
          placeholder="Description (Optional)"
          class="input"
          bind:value={selectedCategory.description}
        />
      </div>
      <style>
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        .switch input:checked + .slider {
          background-color: #2563eb;
        }
        .switch input:focus + .slider {
          box-shadow: 0 0 1px #2563eb;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 22px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        .switch input:checked + .slider:before {
          transform: translateX(18px);
        }
      </style>
      <button
        type="submit"
        class="btn-primary btn-block">
        Update
      </button>
    </form>
  </div>
</Modal>

<!-- Add Asset Modal -->
<Modal show={showAddAssetModal} onClose={() => showAddAssetModal = false}>
  <div class="modal-add-asset">
    <h3 class="modal-title">New Asset</h3>
    <form class="modal-form" on:submit|preventDefault={() => {
      handleAddAsset();
      showAddAssetModal = false;
    }}>
      <div class="form-group">
        <input type="text" placeholder="Asset Name" class="input" required bind:value={assetName} />
      </div>
      <div class="form-group">
        <input type="text" placeholder="Asset Description" class="input" bind:value={assetDescription} />
      </div>
      <div class="form-group">
        {#if assetCategories.length > 0}
          <select class="input" bind:value={assetCategoryId}>
            <option value="" disabled selected>Select Category</option>
            {#each assetCategories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        {/if}
      </div>
      <div class="form-group">
        <select class="input" bind:value={assetCurrency}>
          <option value="" disabled selected>Select Currency for Asset Value</option>
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="AUD">AUD</option>
        </select>
      </div>
      <div class="form-group">
        <input type="text" placeholder="Depreciation % per Month (Optional)" class="input" bind:value={depreciationRate} />
        <small style="color: #9ca3af; font-size: 0.7em; margin-bottom: 0.5em; margin-left: 0.5em; display: block;">
          <i>Eg: Car: 1.5%, Laptop: 1.6%, Phone: 2.8%</i>
        </small>
      </div>
      <button type="submit" class="btn-primary btn-block">Add</button>
    </form>
  </div>
</Modal>

<!-- Add Asset History Modal -->
<Modal show={showAddAssetHistoryModal} onClose={() => showAddAssetHistoryModal = false}>
  <div class="modal-add-asset-history">
    <h3 class="modal-title">New Asset History</h3>
    <form class="modal-form" on:submit|preventDefault={() => {
      handleAddAssetHistory();
      showAddAssetHistoryModal = false;
    }}>
      <div class="form-group">
        <label for="year">Year</label>
        <select name="year" id="year" class="input" bind:value={newHistory.year}>
          {#each Array.from({ length: 11 }, (_, i) => {
            const currentYear = new Date().getFullYear();
            return currentYear - 5 + i;
          }) as year}
            <option value={year} selected={+newHistory.year === year}>{year}</option>
          {/each}
        </select>
      </div>
      <div class="form-group">
        <label for="month">Month</label>
        <select name="month" id="month" class="input" bind:value={newHistory.month}>
          <option value="" disabled selected>Select Month</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>
        <div class="form-group">
          <label for="assetId">{selectedAsset.name} {#if selectedAsset.description} ({selectedAsset.description}) {/if}</label>
          <input type="text" placeholder="Asset Value" class="input" required bind:value={newHistory.value} />
          <input type="number" placeholder="Asset Value in Currency" class="input" required bind:value={newHistory.value_in_currency} on:input={handleOnTypeInputNumber} />
          <small style="color: #9ca3af; font-size: 0.7em; margin-bottom: 0.5em; margin-left: 0.5em; display: block;">
            <i>Currency Format: {selectedAsset.currency} {displayValueCurrency}</i>
          </small>
          <input type="text" placeholder="Note" class="input" bind:value={newHistory.note} />
        </div>
      <button
        type="submit"
        class="btn-primary btn-block">
        Add
      </button>
    </form>
  </div>
</Modal>

<style>
  .dashboard-shell {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .view-header {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.65rem;
    box-sizing: border-box;
  }

  .view-header__text {
    width: 100%;
    min-width: 0;
  }

  .view-header__actions {
    width: 100%;
  }

  .view-eyebrow {
    margin: 0;
    font-size: clamp(0.65rem, 2.8vw, 0.72rem);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .view-title {
    margin: 0.15rem 0 0;
    font-size: clamp(1.05rem, 5vw, 1.35rem);
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.25;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .input-compact {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    font-size: clamp(0.75rem, 3.2vw, 0.85rem);
    padding: 0.55rem 0.75rem;
    box-sizing: border-box;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .summary-card {
    background: #fff;
    border: 1px solid #e8eef6;
    border-radius: 1rem;
    padding: 0.85rem 1rem;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
  }

  .summary-card--primary {
    background: linear-gradient(135deg, #4f8cff 0%, #6ea8ff 100%);
    border-color: transparent;
    color: #fff;
  }

  .summary-card--danger .summary-label {
    color: #f87171;
  }

  .summary-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: inherit;
    opacity: 0.85;
    margin-bottom: 0.35rem;
  }

  .summary-card:not(.summary-card--primary) .summary-label {
    color: #64748b;
  }

  .summary-value {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    word-break: break-word;
  }

  .summary-card--danger .summary-value {
    color: #dc2626;
  }

  .panel,
  .chart-card,
  .category-card {
    background: #fff;
    border: 1px solid #e8eef6;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .panel-heading {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.75rem;
  }

  .filter-stack {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .filter-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem;
  }

  .chart-title {
    margin: 0 0 0.75rem;
    font-size: clamp(0.78rem, 3.4vw, 0.95rem);
    font-weight: 600;
    color: #475569;
    line-height: 1.35;
    word-break: break-word;
    overflow-wrap: anywhere;
    text-wrap: balance;
  }

  .chart-body {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .chart-body :global(> div) {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-sizing: border-box;
  }

  .chart-body :global(canvas) {
    max-width: 100%;
    height: auto !important;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    padding: 2rem 1rem;
    text-align: center;
    color: #94a3b8;
    background: #fff;
    border: 1px dashed #dbeafe;
    border-radius: 1rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .category-header {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .category-toggle {
    border: none;
    background: #f1f5f9;
    color: #475569;
    border-radius: 0.65rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .category-meta {
    flex: 1;
    min-width: 0;
  }

  .category-name-btn {
    all: unset;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e40af;
  }

  .category-desc {
    margin: 0.35rem 0 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: #94a3b8;
  }

  .category-actions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .badge {
    font-size: 0.62rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .badge--danger {
    background: #fee2e2;
    color: #dc2626;
  }

  .icon-btn {
    border: none;
    border-radius: 0.65rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .icon-btn--primary {
    background: linear-gradient(135deg, #4f8cff, #6ea8ff);
    color: #fff;
  }

  .icon-btn--danger {
    background: #fee2e2;
    color: #dc2626;
  }

  .category-empty {
    margin: 0.75rem 0 0;
    font-size: 0.82rem;
    color: #94a3b8;
    text-align: center;
    padding: 0.5rem;
  }

  .asset-card {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px solid #f1f5f9;
  }

  .asset-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.65rem;
  }

  .asset-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f172a;
  }

  .asset-desc,
  .asset-depreciation {
    margin: 0.2rem 0 0;
    font-size: 0.72rem;
    color: #94a3b8;
  }

  .asset-value {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #2563eb;
    white-space: nowrap;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .history-scroll {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    max-height: 12.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-right: 0.2rem;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .history-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .history-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  .history-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .history-item {
    position: relative;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    border-radius: 0.75rem;
    padding: 0.6rem 2.2rem 0.6rem 0.75rem;
  }

  .history-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .history-date {
    font-size: 0.78rem;
    font-weight: 600;
    color: #334155;
  }

  .history-amount {
    font-size: 0.82rem;
    font-weight: 700;
    color: #2563eb;
  }

  .history-sub {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.75rem;
    margin-top: 0.25rem;
    font-size: 0.72rem;
    color: #94a3b8;
  }

  .history-note {
    font-style: italic;
  }

  .history-delete {
    position: absolute;
    top: 0.45rem;
    right: 0.45rem;
    border: none;
    background: transparent;
    color: #f87171;
    cursor: pointer;
    padding: 0.15rem;
    border-radius: 0.35rem;
  }

  .history-empty,
  .history-add,
  .add-category-btn {
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    color: #64748b;
    border-radius: 0.75rem;
    padding: 0.65rem;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .history-empty {
    color: #dc2626;
    border-color: #fecaca;
    background: #fff5f5;
  }

  .history-add:hover,
  .add-category-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #2563eb;
  }

  .add-category-btn {
    margin-top: 0.25rem;
    border-style: solid;
    background: linear-gradient(135deg, #4f8cff, #6ea8ff);
    border-color: transparent;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 6px 20px rgba(79, 140, 255, 0.25);
  }

  .floating-nav {
    position: fixed;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: calc(100% - 1.5rem);
    max-width: 400px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    pointer-events: none;
  }

  .floating-nav > * {
    pointer-events: auto;
  }

  .app-menu-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.25);
    backdrop-filter: blur(2px);
    z-index: 40;
  }

  .app-menu-sheet {
    width: 100%;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 1.25rem;
    padding: 1rem;
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
    animation: sheetUp 0.22s ease-out;
  }

  @keyframes sheetUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .app-menu-label {
    margin: 0 0 0.75rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    text-align: center;
  }

  .app-menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .app-menu-item {
    border: none;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem;
    cursor: pointer;
    font-size: 0.68rem;
    font-weight: 600;
    color: #64748b;
    border-radius: 0.75rem;
    transition: background 0.15s;
  }

  .app-menu-item:hover,
  .app-menu-item--active {
    background: #f1f5f9;
    color: #1e40af;
  }

  .app-menu-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .app-menu-icon--blue { background: linear-gradient(135deg, #4f8cff, #2563eb); }
  .app-menu-icon--violet { background: linear-gradient(135deg, #8b5cf6, #6366f1); }
  .app-menu-icon--green { background: linear-gradient(135deg, #22c55e, #16a34a); }
  .app-menu-icon--amber { background: linear-gradient(135deg, #f59e0b, #d97706); }

  .floating-dock {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    padding: 0.45rem;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 999px;
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(79, 140, 255, 0.08);
  }

  .dock-btn {
    flex: 1;
    border: none;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.4rem 0.25rem;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.65rem;
    font-weight: 600;
    color: #94a3b8;
    transition: background 0.15s, color 0.15s;
  }

  .dock-btn--active {
    background: #eff6ff;
    color: #2563eb;
  }

  .dock-menu-btn {
    width: 3.25rem;
    height: 3.25rem;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f8cff 0%, #2563eb 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(79, 140, 255, 0.4);
    flex-shrink: 0;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .dock-menu-btn--open {
    transform: rotate(90deg);
    background: linear-gradient(135deg, #64748b, #475569);
    box-shadow: 0 6px 20px rgba(71, 85, 105, 0.35);
  }

  .btn-primary {
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: var(--color-header-text);
    border: none;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 12px var(--color-btn-shadow, rgba(79, 140, 255, 0.12));
    transition: background 0.2s, transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.65em 1em;
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }

  .btn-primary:hover {
    background: linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%);
    transform: translateY(-1px);
  }

  .modal-add-category,
  .modal-add-asset-history {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .modal-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 0.5rem;
    text-align: center;
    letter-spacing: -0.01em;
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .form-group label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #2563eb;
    margin-bottom: 0.3rem;
  }

  .input {
    padding: 0.65rem 0.85rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.9rem;
    background: #f8fafc;
    transition: border 0.18s, background 0.18s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .input:focus {
    border-color: #4f8cff;
    background: #fff;
  }

  .btn-block {
    width: 100%;
    padding: 0.7rem 0;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    font-weight: 600;
    background: linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
    margin-top: 0.2rem;
  }

  .btn-block:hover,
  .btn-block:focus {
    background: linear-gradient(90deg, #2563eb 0%, #4f8cff 100%);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    height: 60vh;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #dbeafe;
    border-top-color: #4f8cff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #64748b;
    margin: 0;
    text-align: center;
  }
</style>
