import prismaClient from "../utils/prismaClient";

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
const getQuoteListByMoverId = (moverId: number) => {
  return prismaClient.quote.findMany({
    where: { moverId },
    orderBy: {
      createAt: "desc", // 최신 순 정렬
    },
    select: {
      id: true,
      cost: true,
      comment: true,
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
const getQuoteDetailByMoverId = (
  moverId: number,
  quoteId: number,
  cost: number
) => {
  if (!moverId) {
    throw new Error("기사 ID가 필요합니다.");
  }

  return prismaClient.quote.findFirst({
    // findUnique 대신 findFirst 사용
    where: {
      AND: [{ id: quoteId }, { moverId }, { cost }],
    },
    select: {
      id: true,
      cost: true,
      comment: true,
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

export default {
  getQuoteByMovingRequestId,
  getQuoteById,
  getQuoteCountByMovingRequestId,
  createQuoteByMovingRequestId,
  getQuoteListByMoverId,
  getQuoteDetailByMoverId,
};
