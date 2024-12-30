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
        service: getRandomInt(1, 3),
        movingDate,
        pickupAddress: `서울시 출발지 ${i + 1}-${index + 1}`,
        dropOffAddress: `경기도 도착지 ${i + 1}-${index + 1}`,
        requestCount: getRandomInt(0, 5),
        designateCount: getRandomInt(0, 3),
        isDesignated: Math.random() > 0.75,
        createAt: new Date(),
        updateAt: new Date(),
      };
    });
  });
}

// export const movingRequest = [
//   {
//     id: 1,
//     service: 1,
//     movingDate: "2024-12-05T10:00:00Z",
//     pickupAddress: "123 Maple St, City A",
//     dropOffAddress: "456 Oak Rd, City B",
//     requestCount: 0,
//     designateCount: 0,
//     isDesignated: false,
//     createAt: "2024-12-27T00:00:00Z",
//     updateAt: "2024-12-27T00:00:00Z",
//     customerId: 1,
//     region: 8202,
//   },
//   {
//     id: 2,
//     service: 2,
//     movingDate: "2024-12-10T09:30:00Z",
//     pickupAddress: "789 Pine Ave, City C",
//     dropOffAddress: "101 Birch Ln, City D",
//     requestCount: 0,
//     designateCount: 0,
//     isDesignated: false,
//     createAt: "2024-12-27T00:00:00Z",
//     updateAt: "2024-12-27T00:00:00Z",
//     customerId: 2,
//     region: 82031,
//   },
//   {
//     id: 3,
//     service: 1,
//     movingDate: "2024-12-12T12:00:00Z",
//     pickupAddress: "234 Cedar Blvd, City E",
//     dropOffAddress: "567 Elm St, City F",
//     requestCount: 0,
//     designateCount: 0,
//     isDesignated: false,
//     createAt: "2024-12-27T00:00:00Z",
//     updateAt: "2024-12-27T00:00:00Z",
//     customerId: 3,
//     region: 82032,
//   },
//   {
//     id: 4,
//     service: 3,
//     movingDate: "2024-12-15T14:00:00Z",
//     pickupAddress: "456 Cherry Blvd, City G",
//     dropOffAddress: "789 Walnut St, City H",
//     requestCount: 0,
//     designateCount: 0,
//     isDesignated: false,
//     createAt: "2024-12-27T00:00:00Z",
//     updateAt: "2024-12-27T00:00:00Z",
//     customerId: 4,
//     region: 82033,
//   },
//   {
//     id: 5,
//     service: 2,
//     movingDate: "2024-12-20T13:30:00Z",
//     pickupAddress: "121 Maple Rd, City I",
//     dropOffAddress: "222 Pine St, City J",
//     requestCount: 0,
//     designateCount: 0,
//     isDesignated: false,
//     createAt: "2024-12-27T00:00:00Z",
//     updateAt: "2024-12-27T00:00:00Z",
//     customerId: 5,
//     region: 82033,
//   },
// ];
