import { supabase } from "./supabase";

export const shopsService = {
  // Fetch all shops
  getAllShops: async () => {
    try {
      console.log("Starting getAllShops query...");

      // Get current auth status
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Current auth status:", session ? "Authenticated" : "Guest");

      // Perform the query
      const { data, error, count } = await supabase
        .from("shops")
        .select("*", { count: "exact" });

      console.log("Query completed. Count:", count);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data) {
        console.log("No data returned from query");
        return [];
      }

      console.log("Returned data:", data);
      return data;
    } catch (error) {
      console.error("Error in getAllShops:", error);
      throw error;
    }
  },

  // Fetch shops by category
  getShopsByCategory: async (categoryId) => {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add a new shop
  addShop: async (shopData) => {
    const { data, error } = await supabase
      .from("shops")
      .insert([
        {
          ...shopData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a shop
  updateShop: async (shopId, shopData) => {
    const { data, error } = await supabase
      .from("shops")
      .update(shopData)
      .eq("id", shopId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a shop
  deleteShop: async (shopId) => {
    const { error } = await supabase.from("shops").delete().eq("id", shopId);

    if (error) throw error;
    return true;
  },
};
