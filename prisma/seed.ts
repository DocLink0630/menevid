import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "staff";
};

function requireEnv(name: string, ...aliases: string[]): string {
  const names = [name, ...aliases];
  for (const key of names) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(
    `Missing required environment variable: ${names.join(" or ")}\n` +
      `Add it to your .env file. For Supabase, use the service_role / secret key from Dashboard → Settings → API.`,
  );
}

function getSeedUsers(): SeedUser[] {
  const password =
    process.env.SEED_USER_PASSWORD ?? "Menavid@2026";

  const users: SeedUser[] = [];

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@menavid.lk";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Menavid Admin";
  users.push({
    email: adminEmail,
    password,
    name: adminName,
    role: "admin",
  });

  const staffEmail = process.env.SEED_STAFF_EMAIL;
  if (staffEmail) {
    users.push({
      email: staffEmail,
      password,
      name: process.env.SEED_STAFF_NAME ?? "Menavid Staff",
      role: "staff",
    });
  }

  return users;
}

async function seedAuthUser(
  supabase: SupabaseClient,
  user: SeedUser,
) {
  const existing = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existing) {
    console.log(`User already exists in database: ${user.email}`);
    return existing.id;
  }

  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Failed to list Supabase users: ${listError.message}`);
  }

  const authUser = listData.users.find((u) => u.email === user.email);

  let userId: string;

  if (authUser) {
    console.log(`Supabase auth user already exists: ${user.email}`);
    userId = authUser.id;

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name },
      },
    );

    if (updateError) {
      throw new Error(
        `Failed to update Supabase user ${user.email}: ${updateError.message}`,
      );
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    });

    if (error || !data.user) {
      throw new Error(
        `Failed to create Supabase user ${user.email}: ${error?.message}`,
      );
    }

    userId = data.user.id;
    console.log(`Created Supabase auth user: ${user.email}`);
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
    },
    create: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
    },
  });

  console.log(`Synced public.users row: ${user.email} (${user.role})`);
  return userId;
}

async function main() {
  const supabaseUrl = requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
  );
  const serviceRoleKey = requireEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_SUPABASE_SECRET_KEY",
    "SUPABASE_SECRET_KEY",
  );

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const users = getSeedUsers();

  console.log(`Seeding ${users.length} user(s)...`);

  for (const user of users) {
    await seedAuthUser(supabase, user);
  }

  console.log("Seed completed.");
  console.log("");
  console.log("Login credentials:");
  for (const user of users) {
    console.log(`  ${user.role.padEnd(5)} ${user.email}`);
  }
  console.log(`  password: ${process.env.SEED_USER_PASSWORD ?? "Menavid@2026"}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
