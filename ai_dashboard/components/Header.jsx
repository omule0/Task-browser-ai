import { createClient } from "@/utils/supabase/server";
import { HeaderUI } from "./HeaderUI";
import { logout } from "@/app/logout/actions";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HeaderUI user={user} logout={logout} />;
}
