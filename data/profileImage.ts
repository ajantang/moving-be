import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const TEMP_PROFILE_IMAGE_URLS = [
  "https://cdn.pixabay.com/photo/2024/02/16/06/18/cat-8576777_640.jpg",
  "https://cdn.pixabay.com/photo/2024/12/13/21/21/eye-9266169_640.jpg",
  "https://cdn.pixabay.com/photo/2024/11/29/08/41/family-9232499_640.png",
  "https://cdn.pixabay.com/photo/2022/11/20/13/32/xmas-7604304_640.png",
  "https://cdn.pixabay.com/photo/2023/05/10/19/18/sparrow-7984807_640.jpg",
  "https://cdn.pixabay.com/photo/2024/11/22/13/20/man-9216455_640.jpg",
  "https://cdn.pixabay.com/photo/2022/12/20/12/10/santa-7667744_640.jpg",
  "https://cdn.pixabay.com/photo/2022/12/16/07/23/heart-7659062_640.jpg",
  "https://cdn.pixabay.com/photo/2023/09/22/03/51/beautiful-8267949_640.jpg",
  "https://cdn.pixabay.com/photo/2023/11/04/07/40/cat-8364405_640.jpg",
  "https://cdn.pixabay.com/photo/2022/11/10/20/29/snowman-7583640_640.jpg",
  "https://cdn.pixabay.com/photo/2024/11/05/13/47/landscape-9175952_640.png",
  "https://cdn.pixabay.com/photo/2023/02/06/15/11/moon-7772242_640.jpg",
  "https://cdn.pixabay.com/photo/2024/11/11/11/09/flower-9189857_640.jpg",
  "https://cdn.pixabay.com/photo/2024/07/23/13/03/moon-8915307_640.png",
  "https://cdn.pixabay.com/photo/2024/05/23/15/11/teddy-8783348_640.jpg",
  "https://cdn.pixabay.com/photo/2024/08/25/12/33/seagull-8996395_640.jpg",
];

function getRandomImageUrl() {
  const randomIndex = Math.floor(
    Math.random() * TEMP_PROFILE_IMAGE_URLS.length
  );
  return TEMP_PROFILE_IMAGE_URLS[randomIndex];
}

export async function generateProfileImages() {
  const customers = await prisma.customer.findMany();
  const movers = await prisma.mover.findMany();

  const customerImages = customers.map((customer) => ({
    imageUrl: getRandomImageUrl(),
    status: true,
    customerId: customer.id,
    moverId: null,
    createAt: new Date(),
    updateAt: new Date(),
  }));

  const moverImages = movers.map((mover) => ({
    imageUrl: getRandomImageUrl(),
    status: true,
    customerId: null,
    moverId: mover.id,
    createAt: new Date(),
    updateAt: new Date(),
  }));

  return [...customerImages, ...moverImages];
}
