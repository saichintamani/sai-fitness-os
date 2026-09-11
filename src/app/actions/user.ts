"use server";

import { prisma } from "@/lib/prisma";

export async function getUserProfile() {
  const user = await prisma.user.findUnique({
    where: { email: "sai@fitness.os" },
    include: {
      profile: true,
      settings: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}
