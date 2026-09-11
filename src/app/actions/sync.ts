"use server";

import { prisma } from "@/lib/prisma";

export async function syncProfile(data: {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: string;
  dietPreference: string;
  hostelMode: boolean;
  budgetMonthly: number;
  onboardingCompleted: boolean;
}) {
  const user = await prisma.user.upsert({
    where: { email: "sai@fitness.os" },
    update: {
      profile: {
        update: {
          ...data
        }
      }
    },
    create: {
      email: "sai@fitness.os",
      name: "Sai",
      profile: {
        create: {
          ...data
        }
      }
    }
  });
  return user;
}
