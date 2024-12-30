import passport from "passport";
import { Strategy as NaverStrategy } from "passport-naver";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
  REFRESH_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
  KAKAO_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} from "../env";
import { JWT_SECRET } from "../env";
import oauthService from "../services/oauthService";
import CustomError from "../utils/interfaces/customError";
import { Strategy } from "passport-custom";
import jwt from "jsonwebtoken";

passport.use(
  "jwt",
  new Strategy(async (req, done) => {
    const token = req.cookies["accessToken"];

    if (!token) {
      const error: CustomError = new Error("Token missing");
      error.status = 403;
      error.data = {
        message: "토큰이 존재하지 않습니다.",
      };
      return done(error, false); // 토큰이 없을 때 에러 반환
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return done(null, decoded); // 토큰이 있고 유효하면 유저 정보 반환
    } catch (err) {
      const error: CustomError = new Error("Invalid token");
      error.status = 403;
      error.data = {
        message: "유효하지 않은 토큰입니다.",
      };
      return done(error, false); // 토큰이 있지만 유효하지 않으면 false 반환
    }
  })
);

passport.use(
  "jwt-optional",
  new Strategy(async (req, done) => {
    const token = req.cookies["accessToken"];
    if (!token) {
      //토큰이 없어도 통과
      return done(null, null);
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // 토큰이 있다면 검증 후 유저 정보 반환
      return done(null, decoded);
    } catch (error) {
      return done(null, false); // 토큰이 있지만 유효하지 않으면 false 반환
    }
  })
);

passport.use(
  "refresh-token",
  new Strategy(async (req, done) => {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      const error: CustomError = new Error("Token missing");
      error.status = 403;
      error.data = {
        message: "리프레시 토큰이 존재하지 않습니다.",
      };
      return done(error, false);
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      return done(null, decoded);
    } catch (err) {
      const error: CustomError = new Error("Invalid token");
      error.status = 403;
      error.data = {
        message: "유효하지 않은 리프레시 토큰입니다.",
      };
      return done(error, false);
    }
  })
);

passport.use(
  new NaverStrategy(
    {
      clientID: NAVER_CLIENT_ID!,
      clientSecret: NAVER_CLIENT_SECRET!,
      callbackURL: NAVER_REDIRECT_URI!,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const userType = req.query.state as string;
        const result = await oauthService.naver(profile, userType);
        return done(null, result);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// 카카오 전략
passport.use(
  new KakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID!,
      clientSecret: KAKAO_CLIENT_SECRET!,
      callbackURL: KAKAO_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req: any, accessToken, refreshToken, profile, done) => {
      try {
        const userType = req.query.state as string;
        const result = await oauthService.kakao(profile, userType);
        return done(null, result);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// 구글 전략
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req: any, accessToken, refreshToken, profile, done) => {
      try {
        const userType = req.query.state as string;
        const result = await oauthService.google(profile, userType);
        return done(null, result);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
