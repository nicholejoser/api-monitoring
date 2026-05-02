import { cookies, headers } from "next/headers";
import { User } from "../../components/Types";
import Sidebar from "../../components/Sidebar";
import Header from "@/components/Header";
import jwt from "jsonwebtoken";
import { DataProvider } from "@/context/DataContext";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerList = await headers();

  const host = headerList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const baseUrl = `${protocol}://${host}`;

  const token = cookieStore.get("WTBkR2VWbFhNVFk9")?.value;
  let currentUser = null;
  let fiberKill = null;
  if (!token) {
    redirect("/");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
    };
    const payload = {
      username: "broadband_api",
      password: "broadband_api",
    };
    const [localRes, fiberRes] = await Promise.all([
      fetch(`${baseUrl}/api/users`, {
        method: "GET",
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/requests?type=fibervu-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      }),
    ]);

    const localData = await localRes.json();
    const fiberData = await fiberRes.json();

    if (!localRes.ok || !fiberRes.ok) {
      console.error(localData.message);
      return;
    }

    if (!Array.isArray(localData)) {
      console.error("Users is not an array:", localData);
      return;
    }
    const foundUser = localData.find(
      (u: User) => String(u.id) === String(decoded.id),
    );
    if (foundUser) {
      currentUser = foundUser;
      fiberKill = fiberData.token.id;
    }
  } catch (error) {
    console.error("Invalid token:", error);
  }

  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
        <Sidebar currentUser={currentUser} fiberKill={fiberKill} />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}
