import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, name, role")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return adminRow ? { ...adminRow, email: user.email ?? "" } : null;
});
