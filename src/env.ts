import dotenv from "dotenv";
dotenv.config();

//.env 파일의 환경변수값을 가져와 전역변수로 사용

export const POSTGRES_DATABASE_URL = process.env.POSTGRES_DATABASE_URL;
export const PORT = process.env.PORT;
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "secret";
export const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
export const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
export const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
export const AWS_S3_REGION = process.env.AWS_S3_REGION;
export const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
export const AWS_S3_SECRET_KEY = process.env.AWS_S3_SECRET_KEY;
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;
export const KAKAO_CALLBACK_URL = process.env.KAKAO_CALLBACK_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
export const DEFAULT_PROFILE_IMAGE = process.env
  .DEFAULT_PROFILE_IMAGE as string;

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
