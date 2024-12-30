import { RequestHandler, Router } from "express";
import passport from "passport";
import cookieConfig from "../config/cookie.config";
import createToken, { Payload } from "../utils/token.utils";
import {
  FRONTEND_URL,
  KAKAO_CALLBACK_URL,
  KAKAO_CLIENT_ID,
  NAVER_CLIENT_ID,
  NAVER_REDIRECT_URI,
} from "../env";
import CustomError from "../utils/interfaces/customError";

const router = Router();

router.get("/naver/customer", (req, res) => {
  const baseURL = "https://nid.naver.com/oauth2.0/authorize";
  const query = new URLSearchParams({
    scope: "email",
    response_type: "code",
    client_id: NAVER_CLIENT_ID!,
    redirect_uri: NAVER_REDIRECT_URI!,
    auth_type: "reprompt",
    state: "customer",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get("/naver/mover", (req, res) => {
  const baseURL = "https://nid.naver.com/oauth2.0/authorize";
  const query = new URLSearchParams({
    scope: "email",
    response_type: "code",
    client_id: NAVER_CLIENT_ID!,
    redirect_uri: NAVER_REDIRECT_URI!,
    auth_type: "reprompt",
    state: "mover",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get("/kakao/customer", (req, res) => {
  const baseURL = "https://kauth.kakao.com/oauth/authorize";

  const query = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID!,
    redirect_uri: KAKAO_CALLBACK_URL!,
    response_type: "code",
    scope: "account_email",
    prompt: "login",
    state: "customer",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get("/kakao/mover", (req, res) => {
  const baseURL = "https://kauth.kakao.com/oauth/authorize";

  const query = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID!,
    redirect_uri: KAKAO_CALLBACK_URL!,
    response_type: "code",
    scope: "account_email",
    prompt: "login",
    state: "mover",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get(
  "/google/customer",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "customer",
  })
);

router.get(
  "/google/mover",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "mover",
  })
);

const handleOAuthCallback: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const user = req.user as Payload;
  const userType = req.query.state as string;

  const accessToken = createToken(user, "access");
  const refreshToken = createToken(user, "refresh");

  res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
  res.cookie("refreshToken", refreshToken, cookieConfig.refreshTokenOption);

  if (user.customer?.id || user.mover?.id) {
    res.redirect(FRONTEND_URL);
  } else {
    const messages: Record<string, string> = {
      customer: "고객 프로필을 등록해주세요.",
      mover: "기사 프로필을 등록해주세요.",
    };

    const redirectUrls: Record<string, string> = {
      customer: "/me/profile",
      mover: "/mover/profile",
    };

    const error: CustomError = new Error("Forbidden");
    error.status = 403;
    error.data = {
      message: messages[userType] || "프로필을 등록해주세요.",
      redirectUrl: FRONTEND_URL + redirectUrls[userType],
      redirect: true,
    };
    throw error;
  }
};

router.get(
  "/naver/callback",
  passport.authenticate("naver", { failureRedirect: "/login" }),
  handleOAuthCallback
);

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", { failureRedirect: "/login" }),
  handleOAuthCallback
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  handleOAuthCallback
);

export default router;
