import express, { Request, Response } from "express";
import quoteService from "../services/quoteService";
import { asyncHandle } from "../utils/asyncHandler";
import passport from "passport";
import customError from "../utils/interfaces/customError";
import quoteValidation from "../middlewares/validations/quote";
import { isCustomer } from "../middlewares/authMiddleware";

const router = express.Router();

// 견적서 생성하기
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  quoteValidation.createQuoteValidation,
  asyncHandle(async (req: Request, res: Response) => {
    const { moverId } = req.user as { moverId: number };
    const { movingRequestId, cost, comment } = req.body;

    // 견적서를 생성하는 서비스를 호출
    const quote = await quoteService.createQuote(
      movingRequestId,
      moverId,
      cost,
      comment
    );

    return res.status(201).send(quote);
  })
);

// (기사님이 작성한) 견적서 목록 조회
router.get(
  "/mover",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res, next) => {
    // user 객체의 구조를 더 자세히 확인
    const user = req.user as any; // 임시로 any 타입 사용

    // user 객체에서 moverId를 찾는 방법 수정
    const moverId = user.moverId; // user.id를 먼저 확인

    if (!moverId) {
      const error: customError = new Error("Unauthorized");
      error.status = 401;
      error.message = "Unauthorized";
      error.data = {
        message: "기사 정보를 찾을 수 없습니다.",
      };
      throw error;
    }

    // 기본값 설정
    const limit = Number(req.query.limit) || 10;
    const nextCursorId = req.query.nextCursorId
      ? Number(req.query.nextCursorId)
      : null;

    const quotes = await quoteService.getQuoteList(moverId, {
      limit,
      cursor: nextCursorId, // 내부적으로는 cursor로 사용
    });

    return res.status(200).send(quotes);
  })
);

// (기사님이 작성한)특정 견적서 상세 조회
router.get(
  "/mover/:quoteId",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res, next) => {
    const user = req.user as any;
    const moverId = user.moverId;

    if (!moverId) {
      const error: customError = new Error("Unauthorized");
      error.status = 401;
      error.message = "Unauthorized";
      error.data = {
        message: "기사 정보를 찾을 수 없습니다.",
      };
      throw error;
    }

    const quoteId = parseInt(req.params.quoteId);
    const cost = parseInt(req.query.cost as string);

    if (isNaN(quoteId) || isNaN(cost)) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "Bad Request";
      error.data = {
        message: "올바르지 않은 파라미터입니다.",
      };
      throw error;
    }

    const quote = await quoteService.getQuoteDetail(moverId, quoteId, cost);

    return res.status(200).send(quote);
  })
);

// (기사님의) 지정이사 요청 반려
router.post(
  "/mover/:movingRequestId/reject",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res, next) => {
    const user = req.user as any;
    const moverId = user.moverId;
    const movingRequestId = parseInt(req.params.movingRequestId);

    // 파라미터 검증 후에 서비스를 호출하고 응답을 보내는 부분이 없어요!
    if (!movingRequestId) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "Bad Request";
      error.data = {
        message: "이사 요청 ID가 필요합니다.",
      };
      throw error;
    }

    // 서비스 호출 추가
    const result = await quoteService.rejectRequest(moverId, movingRequestId);

    // 응답 추가
    res.status(200).send(result);
  })
);

// (기사님이) 반려한 이사 요청 목록 조회
router.get(
  "/mover/rejected",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res, next) => {
    const user = req.user as any;
    const moverId = user.moverId;

    // moverId 유효성 검사
    if (!moverId) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "Bad Request";
      error.data = {
        message: "기사 ID가 필요합니다.",
      };
      throw error;
    }

    // 쿼리 파라미터 처리 (페이지네이션)
    const limit = parseInt(req.query.limit as string) || 10;
    const nextCursorId = req.query.nextCursorId
      ? Number(req.query.nextCursorId)
      : null;

    // 서비스 호출
    const result = await quoteService.getRejectedRequestList(moverId, {
      limit,
      cursor: nextCursorId,
    });

    // 응답
    res.status(200).send(result);
  })
);

//견적서 상세 조회
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const { id: quoteId } = req.params;
      const quote = await quoteService.getQuoteById(
        customerId,
        parseInt(quoteId)
      );
      return res.status(200).send(quote);
    } catch (error) {
      next(error);
    }
  })
);

export default router; // 설정한 라우터를 내보내서 다른 파일에서 사용할 수 있게 해요.
