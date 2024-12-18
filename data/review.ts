import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateReviews() {
  const confirmedQuotes = await prisma.confirmedQuote.findMany({
    include: {
      movingRequest: true,
    },
  });

  // 각 ConfirmedQuote에 대해 최대 1개의 Review 생성
  const reviews = confirmedQuotes.map((confirmedQuote) => ({
    confirmedQuoteId: confirmedQuote.id,
    customerId: confirmedQuote.customerId,
    moverId: confirmedQuote.moverId,
    content: `Review for confirmed quote ${confirmedQuote.id}`,
    rating: Math.floor(Math.random() * 5) + 1, // 1~5 랜덤 별점
    imageUrl: [`https://example.com/review-${confirmedQuote.id}.jpg`],
    createAt: new Date(),
    updateAt: new Date(),
  }));

  return reviews;
}
