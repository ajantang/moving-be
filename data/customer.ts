import { getUsers } from "./user";
import { getRandomElements } from "./utils";
import { regions } from "./region";
import { services } from "./service";

export async function getCustomers() {
  const users = await getUsers();
  const customerUsers = users.slice(0, Math.floor(users.length / 2)); // 절반을 Customer로 설정

  return customerUsers.map((user, i) => ({
    id: i + 1, // 고유 ID
    userId: user.id,
    services: getRandomElements(
      services.map((service) => service.code),
      1,
      3
    ),
    regions: getRandomElements(
      regions.map((region) => region.code),
      1,
      3
    ),
    createAt: new Date(),
    updateAt: new Date(),
  }));
}
