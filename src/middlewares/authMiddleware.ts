// 테스트를 위한 임시 파일

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import CustomError from "../utils/interfaces/customError";
import userRepository from "../repositorys/userRepository";
import { FRONTEND_URL } from "../env";

interface authUser {
  id: number;
  customerId: number;
  moverId: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

// 임시로 사용할 미들웨어
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // req를 AuthenticatedRequest로 타입 단언(type assertion)
  (req as AuthenticatedRequest).user = { id: 1 };
  next();
};

export const optionalJwtAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt-optional",
    { session: false },
    (err: CustomError, user: authUser) => {
      // 토큰이 없는 경우 (user가 null)이거나 정상적인 경우 통과
      if (!user || (user && !err)) {
        req.user = user;
        return next();
      }

      // 토큰이 유효하지 않은 경우에만 에러 반환
      if (err) {
        err.status = 401;
        err.data = {
          message: "유효하지 않는 토큰입니다.",
        };
        return next(err);
      }
    }
  )(req, res, next);
};

export const isCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as {
    id: number;
    customerId?: number;
    moverId?: number;
  };
  const findUser = await userRepository.findById(user.id);
  if (!findUser) {
    const error: CustomError = new Error("Unauthorized");
    error.status = 403;
    error.data = {
      message: "유효하지 않은 사용자입니다.",
    };
    return next(error);
  }

  if (!user?.customerId) {
    const error: CustomError = new Error("Unauthorized");
    error.status = 403;
    error.data = {
      message: "고객 프로필을 먼저 등록해주세요",
      redirectUrl: FRONTEND_URL + "/me/profile",
      redirect: true,
    };
    return next(error);
  }

  next();
};

export const isMover = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as {
    id: number;
    customerId?: number;
    moverId?: number;
  };
  const findUser = await userRepository.findById(user.id);
  if (!findUser) {
    const error: CustomError = new Error("Unauthorized");
    error.status = 403;
    error.data = {
      message: "유효하지 않은 사용자입니다.",
    };
    return next(error);
  }
  if (!user?.moverId) {
    const error: CustomError = new Error("Unauthorized");
    error.status = 403;
    error.data = {
      message: "기사 프로필을 먼저 등록해 주세요.",
      redirectUrl: FRONTEND_URL + "/mover/profile",
      redirect: true,
    };
    return next(error);
  }

  next();
};
