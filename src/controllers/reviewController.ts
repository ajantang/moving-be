import { Router } from "express";
import passport from "passport";
import { asyncHandle } from "../utils/asyncHandler";
import reviewService from "../services/reviewService";
import customError from "../utils/interfaces/customError";
import { ReviewCreateData, ReviewQuery } from "../utils/review/types";

const router = Router();

// 리뷰 목록 조회 (기사 상세페이지용)
router.get(
  "/mover/:moverId",
  asyncHandle(async (req, res) => {
    const moverId = parseInt(req.params.moverId);
    const { pageSize, pageNum } = req.query;

    const result = await reviewService.getMoverReviewsList(moverId, {
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      pageNum: pageNum ? parseInt(pageNum as string) : undefined,
    });

    res.status(200).send(result);
  })
);

// 내가 작성한 리뷰 목록 조회
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res) => {
    const user = req.user as any;
    const customerId = user.customerId;

    if (!customerId) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "고객 ID가 필요합니다.";
      throw error;
    }

    const { pageSize, pageNum } = req.query;

    const result = await reviewService.getMyReviewsList(customerId, {
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      pageNum: pageNum ? parseInt(pageNum as string) : undefined,
    });

    res.status(200).send(result);
  })
);

// 리뷰 생성하기
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res) => {
    const user = req.user as any;
    const customerId = user.customerId;

    if (!customerId) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "고객 ID가 필요합니다.";
      throw error;
    }

    const { confirmedQuoteId, rating, content, imageUrl } = req.body; // moverId 제거

    if (!confirmedQuoteId || !rating) {
      // moverId 체크 제거
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "필수 항목이 누락되었습니다.";
      throw error;
    }

    const result = await reviewService.createNewReview(customerId, {
      confirmedQuoteId,
      rating,
      content,
      imageUrl,
    });

    res.status(200).send(result);
  })
);

// 작성 가능한 리뷰 목록 조회
router.get(
  "/available",
  passport.authenticate("jwt", { session: false }),
  asyncHandle(async (req, res) => {
    const user = req.user as any;
    const customerId = user.customerId;

    if (!customerId) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "고객 ID가 필요합니다.";
      throw error;
    }

    const { pageSize, pageNum } = req.query;

    const result = await reviewService.getAvailableReviewsList(customerId, {
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      pageNum: pageNum ? parseInt(pageNum as string) : undefined,
    });

    console.log(result);
    res.status(200).send(result);
  })
);

export default router;




