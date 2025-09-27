<script lang="ts">
  import '../../global.css';
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getCurrentUser, logout } from '$lib/supabase/auth';

  let showDropdown = false;
  let username: any = {};
  let currentUser: any = null;

  onMount(async () => {
    const { user } = await getCurrentUser();

    if (!user) {
      goto('/login');
      return;
    }

    currentUser = user;
    username = user.email;
  });

  function handleLogout() {
    logout();
    goto('/login');
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }
</script>

<div class="layout-container">
  <header class="center-header">
    <span class="header-title">Asset Tracker</span>
    <div class="user-menu-container">
      <button class="user-avatar-btn" on:click={toggleDropdown} aria-label="User menu" style="color: white;">
        <Icon icon="mdi:account-circle" width="38" height="38" class="user-avatar-icon" color="white" />
      </button>
      {#if showDropdown}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="dropdown-backdrop" on:click={closeDropdown} role="button" tabindex="0"></div>
        <div class="user-dropdown">
          <div class="user-info">
            <div class="user-name">{username}</div>
          </div>
          <div class="dropdown-divider"></div>
          <ul class="dropdown-list">
            <li>
              <button class="dropdown-item logout" on:click={handleLogout}>
                <Icon icon="mdi:logout" width="20" /> <span>Sign out</span>
              </button>
            </li>
          </ul>
        </div>
      {/if}
    </div>
  </header>
  <main>
    <slot {currentUser} />
  </main>
  <footer class="center-footer">
    &copy; {new Date().getFullYear()} Asset Tracker
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

  .center-header {
    background: var(--color-header-bg);
    color: var(--color-header-text);
    padding: 1.5rem 2rem;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    max-width: 950px !important;
    box-shadow: var(--color-header-shadow);
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    position: relative;
  }

  .center-footer {
    background: var(--color-header-bg);
    color: var(--color-header-text);
    padding: 1.5rem 2rem;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 1px;
    max-width: 950px !important;
    box-shadow: var(--color-header-shadow);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    position: relative;
  }

  .header-title {
    flex: 1;
    text-align: center;
  }

  .user-menu-container {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 20;
  }

  .user-avatar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: 1rem;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .dropdown-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 10;
    background: transparent;
  }

  .user-dropdown {
    position: absolute;
    right: 0;
    top: 48px;
    min-width: 220px;
    background: #fff;
    color: #222;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.08);
    z-index: 30;
    padding: 0.5rem 0;
    margin-top: 0.5rem;
    font-size: 1rem;
    animation: dropdownFadeIn 0.18s;
  }

  @keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-10px);}
    to { opacity: 1; transform: translateY(0);}
  }

  .user-info {
    padding: 0.7rem 1.2rem 0.5rem 1.2rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .user-name {
    font-weight: 600;
    font-size: 1.08rem;
    margin-bottom: 2px;
  }

  .dropdown-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.7em;
    width: 100%;
    padding: 0.7em 1.2em;
    background: none;
    border: none;
    color: #222;
    text-decoration: none;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.13s;
    border-radius: 0;
    outline: none;
  }

  .dropdown-item span {
    flex: 1;
    text-align: left;
  }

  .dropdown-item:hover,
  .dropdown-item:focus {
    background: #f5f6fa;
    color: #1a73e8;
  }

  .dropdown-item.logout {
    color: #d32f2f;
    font-weight: 500;
  }
  .dropdown-item.logout:hover,
  .dropdown-item.logout:focus {
    background: #ffeaea;
    color: #b71c1c;
  }

  .dropdown-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 0.2em 0;
    border: none;
  }

  @media (max-width: 900px) {
    main {
      max-width: 100%;
      padding: 1.5rem 1rem;
    }
    .center-header {
      padding: 1.2rem 1rem;
      font-size: 1.2rem;
    }
    .user-dropdown {
      min-width: 170px;
      font-size: 0.97rem;
    }
  }

  @media (max-width: 600px) {
    .layout-container {
      font-size: 0.97rem;
    }
    .center-header {
      padding: 1rem 0.5rem;
      font-size: 1rem;
      text-align: center;
    }
    main {
      padding: 1rem 0.3rem;
    }
    .center-footer {
      font-size: 0.7rem;
      padding: 0.7rem 0;
    }
    .user-dropdown {
      right: 0;
      left: auto;
      min-width: 140px;
      font-size: 0.93rem;
    }
  }
</style>
