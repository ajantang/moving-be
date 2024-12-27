import { PrismaClient } from "@prisma/client";
import { getRandomInt } from "./utils";
import { getMovers } from "./mover";

const prisma = new PrismaClient();

export async function generateQuotes() {
  const movingRequests = await prisma.movingRequest.findMany(); // 실제 데이터 가져오기
  const movers = await getMovers();

  if (!movingRequests.length || !movers.length) {
    throw new Error(
      "Missing data: MovingRequests or Movers are not available."
    );
  }

  return movingRequests.flatMap((request) => {
    const numberOfQuotes = getRandomInt(1, 8);
    return Array.from({ length: numberOfQuotes }, (_, index) => {
      const mover = movers[getRandomInt(0, movers.length - 1)];

      return {
        id: request.id * 10 + index + 1,
        movingRequestId: request.id, // 실제 DB에서 가져온 ID 참조
        moverId: mover.id,
        cost: getRandomInt(100000, 500000),
        comment: `Quote for moving request ${request.id}`,
        createAt: new Date(),
        updateAt: new Date(),
      };
    });
  });
}
