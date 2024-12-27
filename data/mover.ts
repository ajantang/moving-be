import { getUsers } from "./user";
import { getRandomElements } from "./utils";
import { regions } from "./region";
import { services } from "./service";

export async function getMovers() {
  const users = await getUsers();
  const moverUsers = users.slice(Math.floor(users.length / 2)); // 절반을 Mover로 설정

  return moverUsers.map((user, i) => ({
    id: i + 1, // 고유 ID
    userId: user.id,
    nickname: `기사${i + 1}`,
    career: i + 3,
    description: `기사${i + 1}님의 상세 설명입니다.`,
    introduction: `안녕하세요, 기사${i + 1}입니다.`,
    services: getRandomElements(
      services.map((service) => service.code),
      1,
      3
    ),
    regions: getRandomElements(
      regions.map((region) => region.code),
      1,
      5
    ),
  }));
}

// export const movers = [
//   {
//     id: 1,
//     nickname: "박진우",
//     services: [1, 2],
//     regions: [82031, 82032],
//     career: 5,
//     description:
//       "5년 경력의 경험 많은 이사 전문가입니다. 고객님들의 소중한 물건을 안전하게 옮깁니다.",
//     introduction: "고객님을 위한 안전하고 빠른 이사를 제공합니다.",
//     userId: 6,
//     createAt: "2024-11-27T10:00:00.000Z",
//     updateAt: "2024-11-27T10:00:00.000Z",
//   },
//   {
//     id: 2,
//     nickname: "이현수",
//     services: [2, 3],
//     regions: [82033, 82044],
//     career: 8,
//     description:
//       "고객님의 요구에 맞춘 맞춤형 서비스 제공. 8년 경력으로 신속하고 정확하게 이사 서비스를 제공합니다.",
//     introduction: "이사는 저에게 맡기세요, 완벽한 서비스를 제공합니다.",
//     userId: 7,
//     createAt: "2024-11-27T10:05:00.000Z",
//     updateAt: "2024-11-27T10:05:00.000Z",
//   },
//   {
//     id: 3,
//     nickname: "김영수",
//     services: [1],
//     regions: [82041, 82062],
//     career: 3,
//     description:
//       "고객님의 소중한 짐을 안전하고 효율적으로 이동시킵니다. 3년의 경력으로, 빠르고 정확한 서비스를 제공합니다.",
//     introduction: "정확하고 안전한 이사, 믿고 맡겨주세요.",
//     userId: 8,
//     createAt: "2024-11-27T10:10:00.000Z",
//     updateAt: "2024-11-27T10:10:00.000Z",
//   },
//   {
//     id: 4,
//     nickname: "정재훈",
//     services: [1, 3],
//     regions: [82032, 82033],
//     career: 6,
//     description:
//       "6년 경력의 이사 전문가, 안전하고 신속한 이사로 고객 만족을 최우선으로 생각합니다.",
//     introduction: "안전하고 빠른 이사를 보장하는 전문가입니다.",
//     userId: 9,
//     createAt: "2024-11-27T10:15:00.000Z",
//     updateAt: "2024-11-27T10:15:00.000Z",
//   },
//   {
//     id: 5,
//     nickname: "배진수",
//     services: [1, 3],
//     regions: [82032, 82033],
//     career: 6,
//     description:
//       "6년 경력의 이사 전문가, 안전하고 신속한 이사로 고객 만족을 최우선으로 생각합니다.",
//     introduction: "안전하고 빠른 이사를 보장하는 전문가입니다.",
//     userId: 10,
//     createAt: "2024-11-27T10:15:00.000Z",
//     updateAt: "2024-11-27T10:15:00.000Z",
//   },
// ];
