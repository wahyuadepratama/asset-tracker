<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';

  import { logout } from '$lib/supabase/auth';
  import { getCurrentUser, getAccessToken } from '$lib/supabase/auth';
  import { getAssetCategories, addAssetCategory, deleteAssetCategory } from '$lib/model/asset_categories';
  import { getAssets, addAsset, deleteAsset } from '$lib/model/assets';
  import { getAssetHistory, addAssetHistory, deleteAssetHistory, getDataChart, getDataChartByCategory } from '$lib/model/asset_history';

  import Modal from '$lib/components/Modal.svelte';
  import AssetGrowthChart from '$lib/components/AssetGrowthChart.svelte';

  let loading = true;

  let assetCategories: any[] = [];
  let assets: any[] = [];
  let assetHistory: any[] = [];
  let dataChart: any[] = [];
  let selectedChartCategoryId: string = '';

  let showAddCategoryModal = false;
  let showAddAssetModal = false;
  let showAddAssetHistoryModal = false;

  let categoryName = '';
  let categoryDescription = '';
  let isLiability = false;

  let assetName = '';
  let assetDescription = '';
  let assetCategoryId = '';
  let assetCurrency = '';
  let depreciationRate = '';

  let selectedAsset: any = null;
  let displayValueCurrency = '';
  let zeroValueAsset = 'hide';

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

        // Fetch categories
        const res = await getAssetCategories(access_token);
        if (res.status !== 200) {
          throw new Error('Failed to fetch categories');
        }
        const data = res.data;
        assetCategories = data;

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
        const dataChartRes = await getDataChart();
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
        const res = await getDataChart();
        if (Math.floor(res.status / 100) !== 2) {
          throw new Error('Failed to fetch data chart');
        }
        dataChart = [];
        dataChart = [...res.data];
      } else {
        const res = await getDataChartByCategory(selectedChartCategoryId);
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

      assetCategories = assetCategories.filter((category) => category.id !== categoryId);
    } catch (err) {
      console.error('Failed to delete category:', err);
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

      assets = assets.filter((asset) => asset.id !== assetId);
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

      assetHistory = assetHistory.filter((history: any) => history.id !== assetHistoryId);
      calculateTotalValueAssetHistory();
      rearrangeAssetHistory();

    } catch (err) {
      console.error('Failed to delete asset history:', err);
      alert('Failed to delete asset history');
    }
  }

  function handleLogout() {
    logout();
    goto('/login');
  }
</script>

<svelte:head>
  <title>Dashboard - Asset Tracker</title>
</svelte:head>

{#if loading}
  <div class="loading-container">
    <h3 class="loading-title">Loading...</h3>
  </div>
{/if}

{#if !loading}
<!-- Logout Button -->
<div class="dashboard-navbar">
  <button
    class="btn-primary btn-logout"
    on:click={handleLogout}>
    <Icon
      icon="streamline-flex:logout-1"
      width="15"
      height="15"
      style="flex-shrink: 0; font-weight: bold;"
    />
    <span style="white-space: nowrap;">Logout</span>
  </button>
</div>
{/if}

{#if !loading}
  <!-- Asset Growth Chart -->
  <div class="asset-growth-chart-container-title">
    <select class="input" bind:value={selectedChartCategoryId} on:change={() => handleFilterChart()}>
      <option value="" disabled selected>Select Category</option>
      <option value="all">All Categories</option>
      {#each assetCategories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
    <select class="input" bind:value={zeroValueAsset}>
      <option value="hide">Hide Zero Value Asset</option>
      <option value="show">Show Zero Value Asset</option>
    </select>
  </div>
  {#if dataChart.length > 0}
    <div class="asset-growth-chart-container">
      <AssetGrowthChart assetHistory={dataChart} />
    </div>
  {/if}
  {#if dataChart.length === 0 && selectedChartCategoryId !== 'all'}
    <div class="asset-growth-chart-container-empty">
      <p class="asset-growth-chart-description">No Chart Data Available. Please select a category to see the chart.</p>
    </div>
  {/if}
{/if}

{#if assetCategories.length > 0}
<!-- Categories -->
  {#each assetCategories as category (category.id)}
  <div class="dashboard-container">
    <div class="dashboard-title-row">
      <div style="flex: 1 1 auto;">
        <h2 class="dashboard-title">{category.name} {#if category.is_liability} (Liability) {/if}</h2>
        {#if category.description}
          <small class="dashboard-title-description">
            {category.description}
          </small>
        {/if}
      </div>
      <div style="display: flex; gap: 0.5rem; margin-left: auto;">
        <button class="btn-primary" title="Add Asset" style="display: flex; align-items: center; gap: 0.3rem;" on:click={() => {
          showAddAssetModal = true;
          assetCategoryId = category.id;
        }}>
          <Icon icon="mdi:plus" width="22" height="22" />
        </button>
        {#if assets.filter((asset: any) => asset.category_id === category.id).length === 0}
        <button class="btn-primary btn-delete" title="Delete Category" style="display: flex; align-items: center; gap: 0.3rem;" on:click={() => {
          handleDeleteCategory(category.id);
        }}>
          <Icon icon="mdi:trash-can" width="20" height="20" />
        </button>
        {/if}
      </div>
    </div>
    <hr style="margin: 0.5rem 0;border-color: #d9dbdf4f;">
    {#if assets.filter((asset: any) => asset.category_id === category.id).length > 0}
      {#each assets.filter((asset: any) => asset.category_id === category.id) as asset (asset.id)}
      {#if asset.total_value > 0 || zeroValueAsset === 'show'}
      <div class="asset-title-row">
        <h5 class="asset-title-row-name">
          {asset.name} {#if asset.description} ({asset.description}) {/if}
          {#if asset.depreciation_rate}
            <small style="color: #9ca3af; font-size: 0.7em; margin-top: 0.5em; display: block;">
              <i>Depreciation: {asset.depreciation_rate}% / Month</i>
            </small>
          {/if}
        </h5>
        <h5 style="margin-bottom: 0.5rem; text-align: left;">
          {asset.currency} {Number(asset.total_value).toLocaleString('id-ID')}
        </h5>
      </div>
      <div class="table-responsive">
        <table class="asset-table">
          <thead class="table-header">
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Total Asset</th>
              <th>Value in Currency</th>
              <th>Note</th>
              <th style="text-align: center;">#</th>
            </tr>
          </thead>
          <tbody>
            {#if assetHistory.filter((history: any) => history.asset_id === asset.id).length > 0}
            {#each assetHistory.filter((history: any) => history.asset_id === asset.id) as history (history.id)}
            <tr>
              <td style="text-align: left; vertical-align: top; width: 10%;">{history.year}</td>
              <td style="text-align: left; vertical-align: top; width: 20%;">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(history.month)-1]}
              </td>
              <td style="text-align: left; vertical-align: top; width: 10%;">{history.value}</td>
              <td style="text-align: left; vertical-align: top; width: 10%;">{Number(history.value_in_currency).toLocaleString('id-ID')}</td>
              <td style="text-align: left; vertical-align: top; width: 20%;">{history.note}</td>
              <td style="text-align: right; vertical-align: top; width: 5%;">
                <button class="btn-delete-in-table" title="Delete Asset" on:click={() => handleDeleteAssetHistory(history.id)}>
                  <Icon icon="mdi:trash-can" width="14" height="14" style="margin-top: 0.2rem;"/>
                </button>
              </td>
            </tr>
            {/each}
            {/if}
          </tbody>
          <tfoot class="table-footer">
            {#if assetHistory.filter((history: any) => history.asset_id === asset.id).length === 0}
            <tr style="cursor: pointer;" on:click={() => {
              handleDeleteAsset(asset.id);
            }}>
              <td colspan="6" class="empty-row" style="color: #F76E6F;">
                <Icon icon="mdi:trash-can" width="17" height="17" /> Delete asset
              </td>
            </tr>
            {/if}
            <tr style="cursor: pointer;" on:click={() => {
              showAddAssetHistoryModal = true;
              selectedAsset = asset;
              checkDepreciationRate(asset);
            }}>
              <td colspan="6" class="empty-row">
                + Add new history
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/if}
    {/each}
    {/if}
  </div>
  {/each}
{/if}

{#if !loading}
<!-- Add Category Button -->
<div class="button-container">
  <button
    class="btn-primary"
    on:click={() => {
      showAddCategoryModal = true;
    }}>
    <Icon
      icon="mdi:plus"
      width="20"
      height="20"
      style="flex-shrink: 0;"
    />
    <span style="white-space: nowrap;">Add Category</span>
  </button>
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
        <input type="text" placeholder="Depreciation % per Month (Optional)" class="input" required bind:value={depreciationRate} />
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
  .asset-growth-chart-container-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    max-width: 900px;
    margin: 0 auto;
  }
  .asset-growth-chart-container-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem 0;
  }
  .asset-growth-chart-description {
    font-size: 1rem;
    font-weight: 500;
    color: #9ca3af;
    margin: 0;
  }
  .dashboard-container {
    max-width: 900px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 1.2rem;
    box-shadow: 0 2px 16px rgba(79,140,255,0.07);
    padding: 1.5rem 1.2rem 2rem 1.2rem;
  }
  .dashboard-navbar {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    justify-content: right;
    margin-bottom: 1.5rem;
  }
  .button-container{
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }
  .button-container button{
    width: 100%;
    max-width: 170px;
    margin: 0 0.5rem;
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
    margin-left: 0.5rem;
  }
  .dashboard-title-description {
    display:block;
    max-width:90%;
    word-break:break-word;
    margin-top:0.5rem;
    color:#9CA3AF;
    margin-left:0.5rem;
  }
  .btn-primary { background:linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%); color:var(--color-header-text); border:none; border-radius:2rem; font-size:clamp(0.95rem,2.5vw,1.1rem); font-weight:600; cursor:pointer; box-shadow:0 2px 12px var(--color-btn-shadow,rgba(79,140,255,0.12)); transition:background 0.2s,transform 0.2s; display:flex; align-items:center; gap:0.5em; padding:0.5em 1em; width:100%; justify-content:center; margin-top:0.7em; box-sizing:border-box; }
  .btn-primary:hover { background:linear-gradient(90deg, var(--color-secondary) 0%, var(--color-primary) 100%); transform:translateY(-2px) scale(1.03); }
  .btn-logout {
    background: linear-gradient(90deg, #e11d48 0%, #f87171 100%);
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(225, 29, 72, 0.10);
    transition: background 0.2s, transform 0.2s;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 0.5em;
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    padding: 0.5em 1em 0.5em 1em !important;
    max-width: 120px;
  }
  .btn-logout:hover {
    background: linear-gradient(90deg, #f87171 0%, #e11d48 100%);
    transform: translateY(-2px) scale(1.03);
  }
  .asset-growth-chart-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem 0;
  }
  .asset-title-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem;
    font-size: 1.2rem;
  }
  .asset-title-row-name {
    margin-bottom: 0.5rem;
    text-align: left;
    max-width: 50%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }
  .asset-title-row h5 {
    color: var(--color-primary);
  }
  .table-responsive {
    width: 100%;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
  }
  .table-header {
    position: sticky;
    top: 0;
    background: #f1f5f9;
    z-index: 1;
  }
  .table-footer {
    position: sticky;
    bottom: 0;
    background: #f9fafb;
    z-index: 1;
  }
  .table-footer tr:hover {
    background: #f1f5f9 !important;
    cursor: pointer;
  }
  .asset-table tr:hover td {
    background: #f1f5f9;
    cursor: pointer;
  }
  .asset-table {
    width: 100%;
    border-collapse: collapse;
    background: #f9fafb;
    border-radius: 0.7rem;
    /* overflow: hidden; */
    font-size: 1rem;
  }
  .asset-table th, .asset-table td {
    padding: 0.5rem 1rem !important;
    text-align: left;
  }
  .asset-table th {
    background: #f1f5f9;
    color: #2563eb;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding: 0.5rem 1rem !important;
  }
  .asset-table tr:not(:last-child) td {
    border-bottom: 1px solid #e5e7eb;
  }
  .empty-row {
    text-align: center !important;
    color: #9ca3af;
    font-style: italic;
    padding: 1rem;
  }
  .btn-delete {
    background: linear-gradient(90deg, #e11d48 0%, #f87171 100%);
    color: #fff;
    font-weight: 700;
    border: none;
    border-radius: 2rem;
  }
  .btn-delete-in-table {
    background: linear-gradient(90deg, #e11d48 0%, #f87171 100%);
    color: #fff;
    font-weight: 700;
    border: none;
    border-radius: 2rem;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.10);
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
    flex-direction: row;
  }
  .btn-delete-in-table:hover {
    background: linear-gradient(90deg, #f87171 0%, #e11d48 100%);
    transform: translateY(-2px) scale(1.03);
  }
  .modal-add-category {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1.2rem;
  }
  .modal-add-asset-history {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 0.5rem;
    text-align: center;
    letter-spacing: 0.5px;
  }
  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
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
    padding: 0.7rem 1rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 0.7rem;
    font-size: 1rem;
    background: #f8fafc;
    transition: border 0.18s;
    outline: none;
  }
  .input:focus {
    border-color: #4f8cff;
    background: #fff;
  }
  .btn-block {
    width: 100%;
    padding: 0.7rem 0;
    border-radius: 0.7rem;
    font-size: 1.05rem;
    font-weight: 600;
    background: linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: background 0.18s;
    margin-top: 0.2rem;
  }
  .btn-block:hover, .btn-block:focus {
    background: linear-gradient(90deg, #2563eb 0%, #4f8cff 100%);
  }
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .loading-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 0.5rem;
    text-align: center;
    letter-spacing: 0.5px;
  }
  @media (max-width: 700px) {
    .dashboard-container {
      padding: 1rem 0.3rem 1.2rem 0.3rem;
      margin: 1rem 0.2rem;
    }
    .dashboard-title {
      font-size: 1rem;
      text-align: left;
      margin-left: 0.5rem;
    }
    .asset-growth-chart-description {
      font-size: 0.7rem;
      font-weight: 500;
      color: #9ca3af;
      margin: 1rem;
    }
    .btn-primary { padding:0.2rem 0.4rem; font-size:0.7rem; }
    .btn-logout {
      padding: 0.2rem 0.4rem;
      font-size: 0.5rem;
    }
    .asset-table th, .asset-table td {
      padding: 0.5rem 0.5rem;
      font-size: 0.6rem;
    }
    .modal-add-category {
      padding: 0 0.2rem;
    }
    .modal-title {
      font-size: 1.05rem;
    }
    .input, .btn-block {
      font-size: 0.7rem;
      padding: 0.4rem 0.5rem;
    }
    .asset-title-row h5 {
      font-size: 0.8rem;
    }
  }
</style>
