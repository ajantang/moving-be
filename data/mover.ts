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
    createAt: new Date(),
    updateAt: new Date(),
  }));
}
