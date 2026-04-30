import { cookies, headers } from "next/headers";
import { User } from "../../components/Types";
import Sidebar from "../../components/Sidebar";
import Header from "@/components/Header";
import jwt from "jsonwebtoken";

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

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
      };

      const res = await fetch(`${baseUrl}/api/users`, {
        cache: "no-store",
      });

      const users = await res.json();
      if (!Array.isArray(users)) {
        console.error("Users is not an array:", users);
        return;
      }
      const foundUser = users.find((u: User) => String(u.id) === decoded.id);

      if (foundUser) {
        currentUser = foundUser;
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar currentUser={currentUser} />
      <div className="flex flex-col flex-1">
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening in your terminal nodes."
        />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
