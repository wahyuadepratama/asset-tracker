<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';

  import { logout } from '$lib/supabase/auth';
  import { getCurrentUser, getAccessToken } from '$lib/supabase/auth';
  import { getAssetCategories, addAssetCategory, deleteAssetCategory } from '$lib/model/asset_categories';

  import Modal from '$lib/components/Modal.svelte';

  let assetCategories: any[] = [];
  let loadingCategories = false;

  let showAddCategoryModal = false;
  let categoryName = '';
  let categoryDescription = '';

  onMount(async () => {
    try {
      const { user } = await getCurrentUser();

      if (!user) {
        goto('/login');
        return;
      }

      try {
        loadingCategories = true;
        const { access_token } = await getAccessToken(user.id);
        if (!access_token) {
          throw new Error('Failed to get access token');
        }

        const res = await getAssetCategories(access_token);
        if (res.status !== 200) {
          throw new Error('Failed to fetch categories');
        }
        const data = res.data;
        assetCategories = data;
        loadingCategories = false;
      } catch (err) {
        loadingCategories = false;
        console.error('Failed to fetch categories:', err);
      }

    } catch (err) {
      console.error('Failed to get current user:', err);
      goto('/login');
    }
  });

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

      const res = await addAssetCategory(access_token, categoryName, categoryDescription, user.id);
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

      const res = await deleteAssetCategory(access_token, categoryId);
      console.log('Delete category response:', res);
      if (Math.floor(res.status / 100) !== 2) {
        throw new Error('Failed to delete category');
      }

      assetCategories = assetCategories.filter((category) => category.id !== categoryId);
    } catch (err) {
      console.error('Failed to delete category:', err);
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

<div class="dashboard-container">
  <div class="dashboard-title-row">
    <h2 class="dashboard-title">Categories</h2>
    <button class="btn-add-category" title="Add Category" style="display: flex; align-items: center; gap: 0.3rem;" on:click={() => showAddCategoryModal = true}>
      <Icon icon="mdi:plus" width="20" height="20" />
    </button>
  </div>
  <div class="table-responsive">
    <table class="asset-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th style="text-align: center;">#</th>
        </tr>
      </thead>
      <tbody>
        {#if assetCategories.length > 0}
          {#each assetCategories as category}
            <tr>
              <td style="text-align: left; vertical-align: top; width: 30%;">{category.name}</td>
              <td style="text-align: left; vertical-align: top; width: 45%;">{category.description}</td>
              <td style="text-align: center; vertical-align: top; width: 5%;">
                <button class="btn-delete-category" title="Delete Category" on:click={() => handleDeleteCategory(category.id)}>
                  <Icon icon="mdi:trash-can" width="18" height="18" />
                </button>
              </td>
            </tr>
          {/each}
        {:else}
          {#if loadingCategories}
            <tr>
              <td colspan="2" class="empty-row">No categories found.</td>
            </tr>
          {:else}
          <tr>
            <td colspan="3" class="empty-row" style="text-align: center;">
              <svg style="vertical-align:middle;" width="22" height="22" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-dasharray="31.4 31.4" transform="rotate(-90 25 25)">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </td>
          </tr>
          {/if}
        {/if}
      </tbody>
    </table>
  </div>
</div>

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
      <button
        type="submit"
        class="btn-primary btn-block">
        Add
      </button>
    </form>
  </div>
</Modal>

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
    margin-left: 0.5rem;
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
  .btn-add-category {
    background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    font-size: 1.05rem;
    margin-left: auto;
    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.10);
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
    flex-direction: row;
  }

  .modal-add-category {
      width: 100%;
      max-width: 370px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1.2rem;
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
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
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
    .btn-delete-category {
      background: none;
      border: none;
      cursor: pointer;
      transition: background 0.18s;
      color: #f87171;
    }
    .btn-delete-category:hover {
      background: #f8fafc;
    }

  @media (max-width: 600px) {
    .dashboard-container {
      padding: 1rem 0.3rem 1.2rem 0.3rem;
      margin: 1rem 0.2rem;
    }
    .dashboard-title {
      font-size: 1rem;
      text-align: left;
      margin-left: 0.5rem;
    }
    .logout-btn {
      width: 100%;
      padding: 0.4rem 0;
      font-size: 0.7rem;
    }
    .asset-table th, .asset-table td {
      padding: 0.5rem 0.5rem;
      font-size: 0.8rem;
    }
    .modal-add-category {
      max-width: 98vw;
      padding: 0 0.2rem;
    }
    .modal-title {
      font-size: 1.05rem;
    }
    .input, .btn-block {
      font-size: 0.7rem;
      padding: 0.4rem 0.5rem;
    }
  }
</style>
