import { TEMP_PROFILE_IMAGE_URLS } from "./profileImage";

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElements<T>(
  array: T[],
  min: number,
  max: number
): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return array.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function getRandomImageUrl(): string {
  const randomIndex = Math.floor(
    Math.random() * TEMP_PROFILE_IMAGE_URLS.length
  );
  return TEMP_PROFILE_IMAGE_URLS[randomIndex];
}
