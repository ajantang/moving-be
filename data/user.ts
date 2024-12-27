import bcrypt from "bcrypt";
import { getRandomInt } from "./utils";

export async function getUsers() {
  return await Promise.all(
    Array.from({ length: 40 }, async (_, i) => {
      const plainPassword = `qwer!@1234`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      return {
        id: i + 1,
        email: `user${i + 1}@example.com`,
        name: `사용자${i + 1}`,
        phoneNumber: `010-${getRandomInt(1000, 9999)}-${getRandomInt(
          1000,
          9999
        )}`,
        isOAuth: false,
        password: hashedPassword,
        createAt: new Date(),
        updateAt: new Date(),
      };
    })
  );
}
