//node 전체에서 환경변수 타입을 정의 한다
declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    POSTGRES_DATABASE_URL: string;
    PORT: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_REGION: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    NAVER_CLIENT_ID: string;
    NAVER_CLIENT_SECRET: string;
    NAVER_REDIRECT_URI: string;
    SESSION_SECRET: string;
    AWS_S3_BUCKET_NAME: string;
    AWS_S3_REGION: string;
    AWS_S3_ACCESS_KEY: string;
    AWS_S3_SECRET_KEY: string;
    DEFAULT_PROFILE_IMAGE: string;
    FRONTEND_URL: string;
  }
}
