import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateConfirmedQuotes() {
  const quotes = await prisma.quote.findMany({
    include: {
      movingRequest: true, // MovingRequest 테이블의 데이터 포함
    },
  }); // 실제 Quote 데이터 가져오기

  // MovingRequest별로 하나의 Quote를 선택해 ConfirmedQuote 생성
  const confirmedQuotes = Object.values(
    quotes.reduce((acc, quote) => {
      if (!acc[quote.movingRequestId]) {
        acc[quote.movingRequestId] = quote; // 첫 번째 Quote만 선택
      }
      return acc;
    }, {} as Record<number, (typeof quotes)[0]>)
  ).map((quote) => ({
    movingRequestId: quote.movingRequestId,
    quoteId: quote.id,
    customerId: quote.movingRequest.customerId, // Quote와 연결된 Customer
    moverId: quote.moverId,
    createAt: new Date(),
    updateAt: new Date(),
  }));

  return confirmedQuotes;
}
