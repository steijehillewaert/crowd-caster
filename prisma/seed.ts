import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const production = await prisma.production.upsert({
    where: { id: "seed-production" },
    update: {},
    create: {
      id: "seed-production",
      name: "Sample production",
      client: "Crowdproductions",
      year: new Date().getFullYear(),
    },
  });

  await prisma.extra.upsert({
    where: { id: "seed-extra" },
    update: {},
    create: {
      id: "seed-extra",
      firstName: "Sample",
      lastName: "Extra",
      gender: "OTHER",
      city: "Gent",
      country: "BE",
      heightCm: 175,
      clothingSize: "M",
      dayRateEur: 120,
      languages: ["NL", "EN"],
      notes: "Delete this row once real extras are in.",
      bookings: {
        create: { productionId: production.id, role: "Crowd", feeEur: 120 },
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
