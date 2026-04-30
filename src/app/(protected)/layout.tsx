import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { User } from "@/components/Types";

const readUsers = () => {
    try {
        const filePath = path.join(process.cwd(), "public", "data", "users.json");
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
        return [];
    }
};
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("WTBkR2VWbFhNVFk9")?.value;

    let currentUser = null;
    if (userId) {
        const users = readUsers();
        const foundUser = users.find((u: User) => String(u.id) === userId);

        if (foundUser) {
            const safeUser = { ...foundUser };
            delete safeUser.password;

            currentUser = safeUser;
        }
    }

    return (
        <div className="flex h-screen font-lexend">
            <Sidebar currentUser={currentUser}/>

            <div className="flex flex-col flex-1">
                <Header />
                <main className="p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}