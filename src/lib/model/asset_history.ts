import { supabase } from "$lib/supabase/client";
import { error } from "@sveltejs/kit";
import axios from "axios";

export const getAssetHistory = async (access_token: string) => {
  const res = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_history?select=*&order=year.desc,month.desc`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });

  return res;
}

export const addAssetHistory = async (
  access_token: string,
  assetId: string,
  month: string,
  year: string,
  value: number,
  valueInCurrency: number,
  note: string
) => {
  const res = await axios.post(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_history?order=year.asc,month.asc`,
    {
      asset_id: assetId,
      month: month,
      year: year,
      value: value,
      value_in_currency: valueInCurrency,
      note: note
    },
    {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }
  );

  return res;
}

export const deleteAssetHistory = async (access_token: string, assetHistoryId: string) => {
  const res = await axios.delete(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_history?id=eq.${assetHistoryId}`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }
  );

  return res;
}

export const getDataChartByCategory = async (categoryId: string) => {
  try {
    const { data: result, error: rpcError } = await supabase.rpc('get_category_total_assets_by_month', {
      p_category_id: categoryId
    });

    if (rpcError) {
      console.error('Error calling Supabase function:', rpcError);
      throw error(500, rpcError.message || 'Gagal mengambil data aset per bulan dari server.');
    }

    return {
      status: 200,
      data: result
    };

  } catch (e: any) {
    console.error('Server Load Error:', e);
    // Pastikan untuk melempar SvelteKit error jika ingin menangkapnya di +error.svelte
    throw error(e.status || 500, e.message || 'Terjadi kesalahan tak terduga di server.');
  }
}

export const getDataChart = async () => {
  try {
    const { data: result, error: rpcError } = await supabase.rpc('get_all_category_total_assets_by_month');

    if (rpcError) {
      console.error('Error calling Supabase function:', rpcError);
      throw error(500, rpcError.message || 'Gagal mengambil data aset per bulan dari server.');
    }

    return {
      status: 200,
      data: result
    };

  } catch (e: any) {
    console.error('Server Load Error:', e);
    // Pastikan untuk melempar SvelteKit error jika ingin menangkapnya di +error.svelte
    throw error(e.status || 500, e.message || 'Terjadi kesalahan tak terduga di server.');
  }
}
