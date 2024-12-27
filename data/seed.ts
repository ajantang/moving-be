import { PrismaClient } from "@prisma/client";
import { getUsers } from "./user";
import { getCustomers } from "./customer";
import { getMovers } from "./mover";
import { getMovingRequests } from "./movingRequest";
import { generateQuotes } from "./quote";
import { generateConfirmedQuotes } from "./confirmedQuote";
import { generateReviews } from "./review";
import { generateNotifications } from "./notification";
import { generateProfileImages } from "./profileImage";
import { config } from "dotenv";
config();

const prisma = new PrismaClient();

async function main() {
  console.log("\uD83C\uDF31 Seeding started...");

  // 데이터 삭제 순서
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.confirmedQuote.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.movingRequest.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.mover.deleteMany(),
    prisma.profileImage.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("✅ All existing data cleared.");

  // 데이터 생성 순서
  const users = await getUsers();
  await prisma.user.createMany({ data: users });
  console.log("✅ Users seeded.");

  const customers = await getCustomers();
  await prisma.customer.createMany({ data: customers });
  console.log("✅ Customers seeded.");

  const movers = await getMovers();
  await prisma.mover.createMany({ data: movers });
  console.log("✅ Movers seeded.");

  const movingRequests = await getMovingRequests();
  console.log(
    "Generated MovingRequests:",
    movingRequests.map((req) => req.id)
  );
  await prisma.movingRequest.createMany({ data: movingRequests });
  console.log("✅ MovingRequests seeded.");

  const quotes = await generateQuotes();
  console.log(
    "Generated Quotes:",
    quotes.map((quote) => quote.movingRequestId)
  );
  await prisma.quote.createMany({ data: quotes });
  console.log("✅ Quotes seeded.");

  const confirmedQuotes = await generateConfirmedQuotes();
  await prisma.confirmedQuote.createMany({ data: confirmedQuotes });
  console.log("✅ ConfirmedQuotes seeded.");

  const reviews = await generateReviews();
  await prisma.review.createMany({ data: reviews });
  console.log("✅ Reviews seeded.");

  const notifications = await generateNotifications();
  await prisma.notification.createMany({ data: notifications });
  console.log("✅ Notifications seeded.");

  const profileImages = await generateProfileImages();
  await prisma.profileImage.createMany({ data: profileImages });
  console.log("✅ ProfileImages seeded.");

  console.log("\uD83C\uDF31 Seeding completed!");

  // // 견적 요청 데이터 삭제 (가장 먼저 삭제)
  // await prismaClient.movingRequest.deleteMany();

  // // 기사, 고객, 서비스, 리전 데이터 삭제
  // await prismaClient.mover.deleteMany();
  // await prismaClient.customer.deleteMany();
  // await prismaClient.service.deleteMany();
  // await prismaClient.region.deleteMany();

  // // 사용자 데이터 삭제 (마지막에 삭제)
  // await prismaClient.user.deleteMany();

  // // 사용자 데이터 시딩
  // await prismaClient.user.createMany({
  //   data: users,
  //   skipDuplicates: true,
  // });

  // // 고객 데이터 시딩
  // await prismaClient.customer.createMany({
  //   data: customers,
  //   skipDuplicates: true,
  // });

  // // 기사 데이터 시딩
  // await prismaClient.mover.createMany({
  //   data: movers,
  //   skipDuplicates: true,
  // });

  // // 서비스 데이터 시딩
  // await prismaClient.service.createMany({
  //   data: services,
  //   skipDuplicates: true,
  // });

  // // 리전 데이터 시딩
  // await prismaClient.region.createMany({
  //   data: regions,
  //   skipDuplicates: true,
  // });

  // console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("\u274C Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
