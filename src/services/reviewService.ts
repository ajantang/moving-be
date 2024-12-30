import reviewRepository from "../repositorys/reviewRepository";
import customError from "../utils/interfaces/customError";
import {
  ReviewCreateData,
  ReviewQuery,
  ReviewListItem,
  ReviewListResponse,
} from "../utils/review/types";

// 기사의 리뷰 목록 조회 (상세페이지용)
const getMoverReviewsList = async (moverId: number, query: ReviewQuery) => {
  const pageSize = query.pageSize || 5;
  const pageNum = query.pageNum || 1;

  const [totalCount, reviews] = await Promise.all([
    reviewRepository.getMoverReviewCount(moverId),
    reviewRepository.getMoverReviewList(moverId, {
      pageSize,
      pageNum,
    }),
  ]);

  return {
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
    list: reviews.map((review) => ({
      ...review,
      name: review.customer.user.name, // 중첩된 객체에서 name만 추출
      customer: undefined, // customer 객체 제거
    })),
  };
};

// 고객이 작성한 리뷰 목록 조회
const getMyReviewsList = async (customerId: number, query: ReviewQuery) => {
  const pageSize = query.pageSize || 6;
  const pageNum = query.pageNum || 1;

  const [totalCount, reviews] = await Promise.all([
    reviewRepository.getMyReviewCount(customerId),
    reviewRepository.getMyReviewList(customerId, {
      pageSize,
      pageNum,
    }),
  ]);

  return {
    currentPage: pageNum,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
    list: reviews.map(
      (review): ReviewListItem => ({
        id: review.id,
        service: review.confirmedQuote.movingRequest.service,
        isDesignated: review.confirmedQuote.movingRequest.isDesignated,
        imageUrl: review.imageUrl[0] ?? "", // string[] -> string
        nickname: review.mover.nickname,
        movingDate: review.confirmedQuote.movingRequest.movingDate,
        cost: review.confirmedQuote.quote.cost,
        rating: review.rating,
        content: review.content,
        createdAt: review.createAt,
      })
    ),
  };
};

// 리뷰 생성하기
const createNewReview = async (customerId: number, data: ReviewCreateData) => {
  try {
    // 레포지토리 함수 사용
    const confirmedQuote = await reviewRepository.findConfirmedQuote(
      data.confirmedQuoteId,
      customerId
    );

    if (!confirmedQuote) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "리뷰를 작성할 수 있는 견적이 아닙니다.";
      throw error;
    }

    // 평점 유효성 검사
    if (data.rating < 1 || data.rating > 5) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "평점은 1-5 사이여야 합니다.";
      throw error;
    }

    // 리뷰 내용 길이 검사
    if (!data.content || data.content.length > 150) {
      const error: customError = new Error("Bad Request");
      error.status = 400;
      error.message = "리뷰 내용은 1-150자 사이여야 합니다.";
      throw error;
    }

    return await reviewRepository.createReview(
      data.confirmedQuoteId,
      customerId,
      data.rating,
      data.content,
      data.imageUrl // images -> imageUrl로 수정
    );
  } catch (error) {
    const serverError: customError = new Error("Internal Server Error");
    serverError.status = 500;
    throw serverError;
  }
};

// 작성 가능한 리뷰 목록 조회
const getAvailableReviewsList = async (
  customerId: number,
  query: ReviewQuery
) => {
  const pageSize = query.pageSize || 6;
  const pageNum = query.pageNum || 1;

  const [totalCount, reviews] = await Promise.all([
    reviewRepository.getAvailableReviewCount(customerId),
    reviewRepository.getAvailableReviewList(customerId, {
      pageSize,
      pageNum,
    }),
  ]);

  return {
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
    list: reviews.map((review) => ({
      ...review,
      service: review.confirmedQuote.movingRequest.service,
      isDesignated: review.confirmedQuote.movingRequest.isDesignated,
      movingDate: review.confirmedQuote.movingRequest.movingDate,
      nickname: review.mover.nickname,
      cost: review.confirmedQuote.quote.cost,
      confirmedQuote: undefined,
      movingRequest: undefined,
      mover: undefined,
    })),
  };
};

export default {
  getMoverReviewsList,
  getMyReviewsList,
  createNewReview,
  getAvailableReviewsList,
};
