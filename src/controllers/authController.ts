import { Router } from "express";
import authService from "../services/authService";
import { asyncHandle } from "../utils/asyncHandler";
import cookieConfig from "../config/cookie.config";
import createToken from "../utils/token.utils";

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
}

interface SignUpCustomer extends User {
  imageUrl: string;
  services: number[];
  regions: number[];
}

interface SignUpMover extends User {
  nickname: string;
  career: number;
  introduction: string;
  description: string;
  imageUrl: string;
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
        res.status(200).send({ message: "로그인 성공", user });
      } else {
        return res.status(400).send({ message: "로그인 실패" });
      }
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/signup/customer",
  asyncHandle(async (req, res, next) => {
    try {
      const SignUpCustomer: SignUpCustomer = req.body;
      await authService.signUpCustomer(SignUpCustomer);
      res.status(201).send({ message: "회원가입 성공" });
    } catch (error) {
      next(error);
    }
  })
);

router.post(
  "/signup/mover",
  asyncHandle(async (req, res, next) => {
    try {
      const SignUpMover: SignUpMover = req.body;
      await authService.signUpMover(SignUpMover);
      res.status(201).send({ message: "회원가입 성공" });
    } catch (error) {
      next(error);
    }
  })
);

export default router;
