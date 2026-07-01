import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

function displayNameFromSession(
  email: string,
  metadata: Record<string, unknown> | undefined,
) {
  const name =
    (typeof metadata?.full_name === "string" && metadata.full_name) ||
    (typeof metadata?.name === "string" && metadata.name);
  return name || email.split("@")[0];
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (existing) return existing;

  const email = session.user.email;
  if (!email) return null;

  return prisma.user.upsert({
    where: { id: session.user.id },
    create: {
      id: session.user.id,
      email,
      name: displayNameFromSession(email, session.user.user_metadata),
      role: "staff",
    },
    update: {
      email,
      name: displayNameFromSession(email, session.user.user_metadata),
    },
  });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
