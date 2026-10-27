import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const roles = ["Super Admin", "Admin", "User"];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: {
        role,
      },
      update: {},
      create: {
        role,
      },
    });
  }
  // Find the Super Admin role
  const superAdminRole = await prisma.roles.findUnique({
    where: {
      role: "Super Admin",
    },
  });

  if (!superAdminRole) {
    throw new Error("Super Admin role not found.");
  }

  // Default user credentials
  const username = "paramz";
  const password = "super@dm!n";
  const email = "superadmin@example.com";

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Seed default user
  await prisma.users.upsert({
    where: {
      username,
    },
    update: {},
    create: {
      username,
      password: hashedPassword,
      email,
      firstname: "Super",
      lastname: "Admin",
      role_id: superAdminRole.id,
    },
  });

  console.log("Default roles and user created.");
  console.log(`Default username: ${username}`);
  console.log(`Default password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
