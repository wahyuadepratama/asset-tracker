import axios from "axios";

export const getAssets = async (access_token: string) => {
  const res = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/assets?select=*`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });

  return res;
}

export const getAssetsWithCategory = async (access_token: string, categoryId: string) => {
  const res = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/assets?select=*,category:categories(name)&category_id=eq.${categoryId}`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });

  return res;
}

export const addAsset = async (access_token: string, assetName: string, assetDescription: string, assetCategoryId: string, assetCurrency: string, userId: string) => {
  const res = await axios.post(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/assets`, {
    name: assetName,
    description: assetDescription,
    category_id: assetCategoryId,
    currency: assetCurrency,
    user_id: userId
  }, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });

  return res;
}

export const deleteAsset = async (access_token: string, assetId: string) => {
  const res = await axios.delete(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/assets?id=eq.${assetId}`, {
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
