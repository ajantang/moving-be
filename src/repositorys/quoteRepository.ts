import prismaClient from "../utils/prismaClient";
import { QuoteQueryString } from "../utils/quote/types";

interface PaginationOptions {
  limit?: number;
  cursor?: number | null;
}

const getQuoteCountByMovingRequestId = (movingRequestId: number) => {
  return prismaClient.quote.count({
    where: { movingRequestId },
  });
};

//이사요청에 대한 견적서 조회
const getQuoteByMovingRequestId = (
  movingRequestId: number,
  isCompleted = false
) => {
  return prismaClient.quote.findMany({
    where: {
      movingRequestId,
      ...(isCompleted
        ? {
            confirmedQuote: {
              isNot: null,
            },
          }
        : {}),
    },
    select: {
      id: true,
      cost: true,
      comment: true,
      movingRequest: {
        select: {
          service: true,
          movingDate: true,
          createAt: true,
          pickupAddress: true,
          dropOffAddress: true,
        },
      },
      confirmedQuote: {
        select: {
          id: true,
        },
      },
      mover: {
        select: {
          id: true,
          nickname: true,
          imageUrl: true,
          career: true,
          introduction: true,
          services: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              review: true,
              favorite: true,
              confirmedQuote: true,
            },
          },
          favorite: {
            select: {
              id: true,
            },
          },
          movingRequest: {
            select: {
              id: true,
              service: true,
            },
          },
        },
      },
    },
  });
};

//견적서 상세 조회
const getQuoteById = (quoteId: number) => {
  return prismaClient.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      cost: true,
      comment: true,
      movingRequest: {
        select: {
          service: true,
          createAt: true,
          movingDate: true,
          pickupAddress: true,
          dropOffAddress: true,
          isDesignated: true,
          confirmedQuote: {
            select: {
              id: true,
            },
          },
        },
      },
      confirmedQuote: {
        select: {
          id: true,
        },
      },
      mover: {
        select: {
          id: true,
          nickname: true,
          imageUrl: {
            where: {
              status: true,
            },
            orderBy: {
              createAt: "desc",
            },
            select: {
              imageUrl: true,
            },
          },
          introduction: true,
          services: true,
          regions: true,
          // review: true,
          career: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              review: true,
              favorite: true,
              confirmedQuote: true,
            },
          },
          favorite: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
};

//(받은 요청)견적서 보내기
const createQuoteByMovingRequestId = (
  movingRequestId: number,
  moverId: number,
  cost: number,
  comment: string
) => {
  return prismaClient.quote.create({
    data: {
      movingRequestId,
      moverId,
      cost,
      comment,
    },
    select: {
      id: true, // 생성된 견적서의 ID
      cost: true, // 생성된 견적서의 비용
      comment: true, // 생성된 견적서의 코멘트
      movingRequest: {
        select: {
          pickupAddress: true,
          dropOffAddress: true,
          movingDate: true,
          isDesignated: true,
          service: true,
        },
      },
    },
  });
};

//(기사님이 작성한)견적서 목록 조회
const getQuoteListByMoverId = (moverId: number, options: PaginationOptions) => {
  return prismaClient.quote.findMany({
    where: { moverId },
    orderBy: {
      createAt: "desc", // 최신 순 정렬
    },
    // 페이지네이션 코드 추가
    take: options.limit,
    skip: options.cursor ? 1 : 0,
    cursor: options.cursor ? { id: options.cursor } : undefined,
    select: {
      id: true,
      cost: true,
      comment: true,
      createAt: true,
      movingRequest: {
        select: {
          service: true, // service로 매핑 필요
          movingDate: true,
          pickupAddress: true,
          dropOffAddress: true,
          isDesignated: true,
          customer: {
            select: {
              user: {
                // User와의 관계를 통해 name을 가져옴
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      confirmedQuote: {
        select: {
          id: true,
          createAt: true,
        },
      },
    },
  });
};

//(기사님이 작성한)견적서 상세 조회
const getQuoteDetailByMoverId = (moverId: number, quoteId: number) => {
  if (!moverId) {
    throw new Error("기사 ID가 필요합니다.");
  }

  return prismaClient.quote.findFirst({
    // findUnique 대신 findFirst 사용
    where: {
      AND: [{ id: quoteId }, { moverId }],
    },
    select: {
      id: true,
      cost: true,
      comment: true,
      createAt: true,
      movingRequest: {
        select: {
          service: true,
          pickupAddress: true,
          dropOffAddress: true,
          movingDate: true,
          isDesignated: true,
          customer: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

// (기사님의) 지정이사 요청 반려
const rejectMovingRequest = (moverId: number, movingRequestId: number) => {
  return prismaClient.movingRequest.update({
    where: { id: movingRequestId },
    data: {
      isRejected: {
        connect: { id: moverId },
      },
      designateCount: {
        decrement: 1, // 지정 횟수 감소
      },
      isDesignated: false, // 지정 상태 해제
    },
  });
};

// (기사님이) 반려한 이사 요청 목록 조회
const getRejectedMovingRequests = (
  moverId: number,
  options: PaginationOptions
) => {
  return prismaClient.movingRequest.findMany({
    where: {
      isRejected: {
        some: { id: moverId },
      },
    },
    take: options.limit,
    skip: options.cursor ? 1 : 0,
    cursor: options.cursor ? { id: options.cursor } : undefined,
    select: {
      id: true,
      service: true,
      movingDate: true,
      pickupAddress: true,
      dropOffAddress: true,
      createAt: true,
      customer: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

export default {
  getQuoteByMovingRequestId,
  getQuoteById,
  getQuoteCountByMovingRequestId,
  createQuoteByMovingRequestId,
  getQuoteListByMoverId,
  getQuoteDetailByMoverId,
  rejectMovingRequest,
  getRejectedMovingRequests,
};
