import axios from "axios";

export const getAssetHistory = async (access_token: string) => {
  const res = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_history?select=*`, {
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

export const getLastAssetHistoryForEachAsset = async (access_token: string) => {
  // Mengambil data history terakhir untuk setiap asset
  const res = await axios.get(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_history?select=*,asset:asset_id(*)&order=month.desc`,
    {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!res.data || !Array.isArray(res.data)) {
    return { status: res.status, data: [] };
  }

  // Group by asset_id, ambil hanya data pertama (karena sudah diurutkan desc)
  const lastHistoryMap: { [key: string]: any } = {};
  for (const row of res.data) {
    if (!lastHistoryMap[row.asset_id]) {
      lastHistoryMap[row.asset_id] = row;
    }
  }

  // Kembalikan array data terakhir untuk setiap asset
  return {
    status: res.status,
    data: Object.values(lastHistoryMap)
  };
}
