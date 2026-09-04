"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { parseExtraForm } from "@/lib/extras";
import type { Gender } from "@prisma/client";

export type FormState = { error?: string };

export async function createExtra(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseExtraForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { gender, ...rest } = parsed.data;
  const extra = await prisma.extra.create({
    data: { ...rest, gender: (gender as Gender | null) ?? null },
    select: { id: true },
  });

  revalidatePath("/");
  redirect(`/extras/${extra.id}`);
}

export async function updateExtra(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseExtraForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { gender, ...rest } = parsed.data;
  await prisma.extra.update({
    where: { id },
    data: { ...rest, gender: (gender as Gender | null) ?? null },
  });

  revalidatePath("/");
  revalidatePath(`/extras/${id}`);
  redirect(`/extras/${id}`);
}

export async function deleteExtra(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const photos = await prisma.photo.findMany({
    where: { extraId: id },
    select: { url: true },
  });

  await prisma.extra.delete({ where: { id } });

  if (photos.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
    // Best effort: a failed blob cleanup must not undo the database delete.
    try {
      await del(photos.map((photo) => photo.url));
    } catch {
      // ignore
    }
  }

  revalidatePath("/");
  redirect("/");
}

export async function addPhoto(formData: FormData) {
  const extraId = String(formData.get("extraId") ?? "");
  const url = String(formData.get("url") ?? "");
  const pathname = String(formData.get("pathname") ?? "");
  if (!extraId || !url) return;

  const count = await prisma.photo.count({ where: { extraId } });
  await prisma.photo.create({
    data: {
      extraId,
      url,
      pathname,
      sortOrder: count,
      isPrimary: count === 0,
    },
  });

  revalidatePath("/");
  revalidatePath(`/extras/${extraId}`);
}

export async function deletePhoto(formData: FormData) {
  const id = String(formData.get("photoId") ?? "");
  if (!id) return;

  const photo = await prisma.photo.delete({ where: { id } });

  // If we removed the cover photo, promote the next one.
  if (photo.isPrimary) {
    const next = await prisma.photo.findFirst({
      where: { extraId: photo.extraId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.photo.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(photo.url);
    } catch {
      // ignore
    }
  }

  revalidatePath("/");
  revalidatePath(`/extras/${photo.extraId}`);
}

export async function setPrimaryPhoto(formData: FormData) {
  const id = String(formData.get("photoId") ?? "");
  if (!id) return;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;

  await prisma.$transaction([
    prisma.photo.updateMany({
      where: { extraId: photo.extraId },
      data: { isPrimary: false },
    }),
    prisma.photo.update({ where: { id }, data: { isPrimary: true } }),
  ]);

  revalidatePath("/");
  revalidatePath(`/extras/${photo.extraId}`);
}

export async function addBooking(formData: FormData) {
  const extraId = String(formData.get("extraId") ?? "");
  const productionName = String(formData.get("productionName") ?? "").trim();
  const existingProductionId = String(formData.get("productionId") ?? "").trim();
  if (!extraId) return;

  let productionId = existingProductionId;

  if (!productionId) {
    if (!productionName) return;
    const existing = await prisma.production.findFirst({
      where: { name: { equals: productionName, mode: "insensitive" } },
      select: { id: true },
    });
    productionId =
      existing?.id ??
      (
        await prisma.production.create({
          data: { name: productionName },
          select: { id: true },
        })
      ).id;
  }

  const dateRaw = String(formData.get("date") ?? "").trim();
  const feeRaw = String(formData.get("feeEur") ?? "").trim();

  await prisma.booking.create({
    data: {
      extraId,
      productionId,
      role: String(formData.get("role") ?? "").trim() || null,
      date: dateRaw ? new Date(dateRaw) : null,
      feeEur: feeRaw ? Number(feeRaw.replace(",", ".")) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });

  revalidatePath(`/extras/${extraId}`);
  revalidatePath("/productions");
}

export async function deleteBooking(formData: FormData) {
  const id = String(formData.get("bookingId") ?? "");
  if (!id) return;

  const booking = await prisma.booking.delete({ where: { id } });
  revalidatePath(`/extras/${booking.extraId}`);
  revalidatePath("/productions");
}
