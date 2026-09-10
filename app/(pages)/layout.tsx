import { cookies } from "next/headers";
import Sidebar from "../../components/Sidebar";
import Header from "@/components/Header";
import { DataProvider } from "@/context/DataContext";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token = cookieStore.get("WTBkR2VWbFhNVFk9")?.value;

  if (!token) {
    redirect("/");
  }

  if (!token) {
    redirect("/");
  }
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/");
    }
  } catch (error) {
    console.error("Invalid token:", error);
    redirect("/");
  }
  const fiberKill = cookieStore.get("fiberVuToken")?.value ?? "";
  return (
    <DataProvider currentUser={currentUser} fiberData={fiberKill}>
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
        <Sidebar fiberKill={fiberKill} />
        <div className="flex flex-col flex-1">
          <Header />

          <main className="min-h-0 flex-1 overflow-y-auto p-6">
            <TooltipProvider>{children}</TooltipProvider>
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
