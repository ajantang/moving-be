import { Router } from "express";
import passport from "passport";
import cookieConfig from "../config/cookie.config";
import createToken from "../utils/token.utils";
import {
  KAKAO_CALLBACK_URL,
  KAKAO_CLIENT_ID,
  NAVER_CLIENT_ID,
  NAVER_REDIRECT_URI,
} from "../env";

const router = Router();

// router.get(
//   "/naver",
//   passport.authenticate("naver", {
//     scope: ["email"],
//     prompt: "consent",
//   })
// );

router.get("/naver", (req, res) => {
  const baseURL = "https://nid.naver.com/oauth2.0/authorize";
  const query = new URLSearchParams({
    scope: "email",
    response_type: "code",
    client_id: NAVER_CLIENT_ID!,
    redirect_uri: NAVER_REDIRECT_URI!,
    auth_type: "reprompt",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get(
  "/naver/callback",
  passport.authenticate("naver", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    const user = req.user as any;

    const accessToken = createToken(user, "access");
    const refreshToken = createToken(user, "refresh");

    res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
    res.cookie("refreshToken", refreshToken, cookieConfig.refreshTokenOption);

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3001");
  }
);

// router.get(
//   "/kakao",
//   passport.authenticate("kakao", {
//     scope: ["account_email"],
//   })
// );

router.get("/kakao", (req, res) => {
  const baseURL = "https://kauth.kakao.com/oauth/authorize";

  const query = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID!,
    redirect_uri: KAKAO_CALLBACK_URL!,
    response_type: "code",
    scope: "account_email",
    prompt: "login",
  });

  res.redirect(`${baseURL}?${query.toString()}`);
});

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    const user = req.user as any;

    const accessToken = createToken(user, "access");
    const refreshToken = createToken(user, "refresh");

    res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
    res.cookie("refreshToken", refreshToken, cookieConfig.refreshTokenOption);

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3001");
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    const user = req.user as any;

    const accessToken = createToken(user, "access");
    const refreshToken = createToken(user, "refresh");

    res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
    res.cookie("refreshToken", refreshToken, cookieConfig.refreshTokenOption);

    res.redirect(process.env.FRONTEND_URL || "http://localhost:3001");
  }
);

router.get("/kakao/signout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.redirect(process.env.FRONTEND_URL || "http://localhost:3001");
});

export default router;
