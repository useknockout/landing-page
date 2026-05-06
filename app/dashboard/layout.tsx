import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/dashboard");

  // Fetch the application profile (mirror of auth.users)
  const { data: profile } = await supabase
    .from("users")
    .select("email, tier")
    .eq("id", user.id)
    .single();

  const tier = (profile?.tier ?? "free") as
    | "free"
    | "payg"
    | "volume"
    | "enterprise";

  return (
    <div className="min-h-screen flex bg-kno-surface-gray">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar email={profile?.email ?? user.email ?? undefined} tier={tier} />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
