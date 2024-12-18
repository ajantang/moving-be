import { getRandomInt } from "./utils";
import { getCustomers } from "./customer";
import { services } from "./service";

export async function getMovingRequests() {
  const customers = await getCustomers();

  return customers.flatMap((customer, i) => {
    const totalRequests = getRandomInt(1, 3); // Customer당 1~3개의 요청 생성
    return Array.from({ length: totalRequests }, (_, index) => {
      const isFutureDate = index === 0; // 첫 번째 요청만 미래 날짜
      const movingDate = isFutureDate
        ? new Date(
            new Date().setMonth(new Date().getMonth() + getRandomInt(1, 3))
          )
        : new Date(
            new Date().setMonth(new Date().getMonth() - getRandomInt(1, 6))
          );

      return {
        id: i * 3 + index + 1,
        customerId: customer.id,
        service: getRandomInt(0, services.length - 1),
        movingDate,
        pickupAddress: `서울시 출발지 ${i + 1}-${index + 1}`,
        dropOffAddress: `경기도 도착지 ${i + 1}-${index + 1}`,
        requestCount: getRandomInt(0, 5),
        designateCount: getRandomInt(0, 3),
        isDesignated: Math.random() > 0.5,
        createAt: new Date(),
        updateAt: new Date(),
      };
    });
  });
}
