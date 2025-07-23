import axios from "axios";

export const getAssetCategories = async (access_token: string) => {
  const res = await axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_categories?select=*`, {
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });

  return res;
}

export const addAssetCategory = async (access_token: string, categoryName: string, categoryDescription: string, userId: string) => {
  const res = await axios.post(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_categories`, {
    name: categoryName,
    description: categoryDescription,
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

export const deleteAssetCategory = async (access_token: string, categoryId: string) => {
  const res = await axios.delete(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/asset_categories?id=eq.${categoryId}`, {
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
