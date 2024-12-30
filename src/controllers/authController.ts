import { Router } from "express";
import authService from "../services/authService";
import { asyncHandle } from "../utils/asyncHandler";
import cookieConfig from "../config/cookie.config";
import createToken, { Payload } from "../utils/token.utils";
import upload from "../utils/multer";
import passport from "passport";
import userService from "../services/userService";

const router = Router();

interface SignInRequestBody {
  email: string;
  password: string;
}

interface User {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isOAuth: boolean;
}

interface SignUpCustomer extends User {
  imageUrl: Express.Multer.File;
  services: number[];
  regions: number[];
}

interface SignUpMover extends User {
  nickname: string;
  career: number;
  introduction: string;
  description: string;
  imageUrl: Express.Multer.File;
  services: number[];
  regions: number[];
}

router.post(
  "/signin",
  asyncHandle(async (req, res, next) => {
    try {
      const { email, password }: SignInRequestBody = req.body;
      const { user } = await authService.signIn({
        email,
        password,
      });
      if (user) {
        const accessToken = createToken(user, "access");
        const refreshToken = createToken(user, "refresh");
        res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
        res.cookie(
          "refreshToken",
          refreshToken,
          cookieConfig.refreshTokenOption
        );
        res.status(204).send();
      } else {
        return res.status(400).send({ message: "로그인에 실패하였습니다." });
      }
    } catch (error) {
      next(error);
    }
  })
);

router.post("/signout", (_, res) => {
  res.clearCookie("accessToken", cookieConfig.clearCookieOption);
  res.clearCookie("refreshToken", cookieConfig.clearCookieOption);
  res.status(204).send();
});

router.post(
  "/signup/customer",
  upload.single("imageUrl"),
  asyncHandle(async (req, res, next) => {
    try {
      const signUpCustomer: SignUpCustomer = {
        ...req.body,
        imageUrl: req.file!,
        services: Array.isArray(req.body.services)
          ? req.body.services.map(Number)
          : JSON.parse(req.body.services).map(Number),
        regions: Array.isArray(req.body.regions)
          ? req.body.regions.map(Number)
          : JSON.parse(req.body.regions).map(Number),
        isOAuth: req.body.isOAuth === "true",
      };

      await authService.signUpCustomer(signUpCustomer);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/signup/mover",
  upload.single("imageUrl"),
  asyncHandle(async (req, res, next) => {
    try {
      const SignUpMover: SignUpMover = {
        ...req.body,
        imageUrl: req.file!,
        services: Array.isArray(req.body.services)
          ? req.body.services.map(Number)
          : JSON.parse(req.body.services).map(Number),
        regions: Array.isArray(req.body.regions)
          ? req.body.regions.map(Number)
          : JSON.parse(req.body.regions).map(Number),
        isOAuth: req.body.isOAuth === "true",
        career: Number(req.body.career),
      };
      await authService.signUpMover(SignUpMover);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/validate",
  asyncHandle(async (req, res, next) => {
    try {
      const { email, phoneNumber } = req.body;
      await authService.validate(email, phoneNumber);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/refresh",
  passport.authenticate("refresh-token", { session: false }),
  asyncHandle(async (req, res, next) => {
    try {
      const user = req.user as Payload;
      const userData = await userService.getUserById(user.id);
      if (!userData) {
        return res.status(400).send({ message: "유효하지 않은 사용자입니다." });
      }
      const accessToken = createToken(
        {
          id: userData.id,
          customer: userData.customer,
          mover: userData.mover,
        },
        "access"
      );
      res.cookie("accessToken", accessToken, cookieConfig.accessTokenOption);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/password",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res, next) => {
    try {
      const userId = (req.user as Payload).id;
      const { password } = req.body;
      await authService.validatePassword(userId, password);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
);

export default router;
