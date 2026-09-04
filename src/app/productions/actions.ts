"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createProduction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const yearRaw = String(formData.get("year") ?? "").trim();

  await prisma.production.create({
    data: {
      name,
      client: String(formData.get("client") ?? "").trim() || null,
      year: yearRaw ? Number(yearRaw) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath("/productions");
}

export async function deleteProduction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.production.delete({ where: { id } });
  revalidatePath("/productions");
  redirect("/productions");
}
