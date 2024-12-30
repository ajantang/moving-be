import prismaClient from "../utils/prismaClient";
import { ReviewCreateData } from "../utils/review/types";

// 리뷰 목록 조회 (기사 상세페이지용)
const getMoverReviewCount = (moverId: number) => {
  return prismaClient.review.count({
    where: { moverId },
  });
};

const getMoverReviewList = (moverId: number, { pageSize = 5, pageNum = 1 }) => {
  return prismaClient.review.findMany({
    where: { moverId },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: {
      id: true,
      imageUrl: true,
      rating: true,
      content: true,
      createAt: true,
      customer: {
        select: {
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createAt: "desc" },
  });
};

// (고객이)작성한 리뷰 목록 조회
const getMyReviewCount = (customerId: number) => {
  return prismaClient.review.count({
    where: { customerId },
  });
};

const getMyReviewList = (customerId: number, { pageSize = 6, pageNum = 1 }) => {
  return prismaClient.review.findMany({
    where: { customerId },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: {
      id: true,
      rating: true,
      content: true,
      createAt: true,
      imageUrl: true,
      mover: {
        select: {
          nickname: true,
        },
      },
      confirmedQuote: {
        select: {
          movingRequest: {
            select: {
              service: true,
              isDesignated: true,
              movingDate: true,
            },
          },
          quote: {
            select: {
              cost: true,
            },
          },
        },
      },
    },
    orderBy: { createAt: "desc" },
  });
};

const createReview = async (
  confirmedQuoteId: number,
  customerId: number,
  rating: number,
  content: string,
  imageUrl?: string[]
) => {
  // 먼저 confirmedQuote와 연관된 moverId를 조회
  const confirmedQuote = await prismaClient.confirmedQuote.findUnique({
    where: { id: confirmedQuoteId },
    select: {
      quote: {
        select: {
          moverId: true,
        },
      },
    },
  });

  if (!confirmedQuote) {
    throw new Error("확정된 견적을 찾을 수 없습니다.");
  }

  return prismaClient.review.create({
    data: {
      confirmedQuoteId,
      customerId,
      moverId: confirmedQuote.quote.moverId, // moverId 추가
      rating,
      content,
      imageUrl,
    },
    select: {
      id: true,
      rating: true,
      imageUrl: true,
      content: true,
    },
  });
};

// 확정 견적 조회 함수 추가 (핵심 validation: 해당 고객이 이 확정 견적에 대해 리뷰를 쓸 수 있는지 확인)
const findConfirmedQuote = (confirmedQuoteId: number, customerId: number) => {
  return prismaClient.confirmedQuote.findFirst({
    where: {
      id: confirmedQuoteId,
      movingRequest: {
        customerId: customerId,
      },
    },
    select: {
      id: true,
      quote: {
        select: {
          moverId: true,
        },
      },
    },
  });
};

// 작성 가능한 리뷰(기사) 수 조회
const getAvailableReviewCount = (customerId: number) => {
  const today = new Date();
  return prismaClient.confirmedQuote.count({
    where: {
      customerId,
      movingRequest: {
        movingDate: {
          lt: today,
        },
      },
      review: {
        none: {},
      },
    },
  });
};

// 작성 가능한 리뷰(기사) 목록 조회
const getAvailableReviewList = (
  customerId: number,
  { pageSize = 6, pageNum = 1 }
) => {
  const today = new Date();

  return prismaClient.review.findMany({
    where: { customerId },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: {
      id: true,
      imageUrl: true,
      mover: {
        // 여기에 mover 정보 추가
        select: {
          nickname: true,
        },
      },
      confirmedQuote: {
        select: {
          movingRequest: {
            select: {
              service: true,
              isDesignated: true,
              movingDate: true,
            },
          },
          quote: {
            select: {
              cost: true,
            },
          },
        },
      },
    },
    orderBy: { createAt: "desc" },
  });
};

export default {
  getMoverReviewCount,
  getMoverReviewList,
  getMyReviewCount,
  getMyReviewList,
  createReview,
  findConfirmedQuote,
  getAvailableReviewCount,
  getAvailableReviewList,
};
