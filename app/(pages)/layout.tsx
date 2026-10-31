import { cookies } from "next/headers";
import Sidebar from "../../components/Sidebar";
import Header from "@/components/Header";
import { DataProvider } from "@/context/DataContext";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/auth";
import { tripleEncode } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const kill = process.env.KILL;
  const fibeKill = process.env.FIBERKILL;
  if (!kill || !fibeKill) {
    console.log("FiberVu authentication configuration is missing.");
    redirect("/");
  }
  const encodedKill = tripleEncode(kill);
  const encodedFiberKill = tripleEncode(fibeKill);
  const token = cookieStore.get(encodedKill)?.value;

  if (!token) {
    redirect("/");
  }

  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    console.error("Invalid token:", error);
  }

  if (!currentUser) {
    redirect("/");
  }
  const fiberKill = cookieStore.get(encodedFiberKill)?.value ?? "";
  console.log(fiberKill);
  console.log(encodedFiberKill);
  return (
    <DataProvider currentUser={currentUser} fiberKill={fiberKill}>
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
        <Sidebar />
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
