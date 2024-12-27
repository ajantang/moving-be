import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateNotifications() {
  const users = await prisma.user.findMany(); // User 데이터 가져오기

  return users.map((user, i) => ({
    content: `알림 내용 ${i + 1} - User ${user.id}`,
    isRead: Math.random() > 0.5,
    userId: user.id, // 실제 User ID 참조
    createAt: new Date(),
    updateAt: new Date(),
  }));
}
