import prismaClient from "../utils/prismaClient";
import { MovingRequestData } from "../utils/interfaces/movingRequest/movingRequest";

interface CursorQueryString {
  limit: number;
  cursor: number | null;
  orderBy: { [key: string]: "asc" | "desc" };
}

interface WhereCondition {
  keyword?: string;
  OR?: object[];
  AND?: object[];
  quote?: object;
  movingDate?: object;
}

interface OffsetQueryString {
  pageSize: number;
  pageNum: number;
}

const getMovingRequestCountByCustomer = (customerId: number) => {
  return prismaClient.movingRequest.count({
    where: {
      customerId,
    },
  });
};

//이사요청 서비스별 카운트 조회
const getMovingRequestCountByServices = async (where: WhereCondition = {}) => {
  const counts = await prismaClient.movingRequest.groupBy({
    where,
    by: ["service"],
    _count: {
      service: true,
    },
  });

  // 초기값 설정
  const result = {
    smallMove: 0, // service: 1
    houseMove: 0, // service: 2
    officeMove: 0, // service: 3
  };

  // 각 서비스 타입별로 카운트 할당
  counts.forEach((count) => {
    switch (count.service) {
      case 1:
        result.smallMove = count._count.service;
        break;
      case 2:
        result.houseMove = count._count.service;
        break;
      case 3:
        result.officeMove = count._count.service;
        break;
    }
  });

  return result;
};

const getMovingRequestCountByDesignated = async (
  moverId: number,
  where: WhereCondition = {}
) => {
  return prismaClient.movingRequest.count({
    where: {
      ...where,
      mover: {
        some: {
          id: moverId,
        },
      },
    },
  });
};

const getTotalCount = async (where: WhereCondition = {}) => {
  return prismaClient.movingRequest.count({
    where,
  });
};

//이사요청 목록 조회
const getMovingRequestListByMover = (
  query: CursorQueryString,
  where: WhereCondition
) => {
  const { limit, cursor, orderBy } = query;

  return prismaClient.movingRequest.findMany({
    where,
    orderBy,
    take: limit + 1, //커서 페이지 넘버 계산을 위해 1개 더 조회
    skip: cursor ? 1 : 0, //커서 자신을 스킵하기 위함
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      service: true,
      movingDate: true,
      pickupAddress: true,
      dropOffAddress: true,
      createAt: true,
      _count: {
        select: {
          mover: true,
        },
      },
      confirmedQuote: {
        select: {
          id: true,
        },
      },
      customer: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      isRejected: {
        select: {
          id: true,
        },
      },
    },
  });
};

//이사요청 목록 조회 (고객)
const getMovingRequestListByCustomer = (
  customerId: number,
  query: OffsetQueryString
) => {
  const { pageSize, pageNum } = query;

  return prismaClient.movingRequest.findMany({
    where: {
      customerId,
    },
    orderBy: { createAt: "desc" },
    take: pageSize,
    skip: (pageNum - 1) * pageSize, //페이지 번호 계산 2가 오면 기존의 1페이지의 수를 스킵
    select: {
      id: true,
      service: true,
      movingDate: true,
      pickupAddress: true,
      dropOffAddress: true,
      createAt: true,
      confirmedQuote: {
        select: {
          id: true,
        },
      },
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

const getMovingRequestById = (movingRequestId: number) => {
  return prismaClient.movingRequest.findUnique({
    where: { id: movingRequestId },
    select: {
      id: true,
      service: true,
      movingDate: true,
      pickupAddress: true,
      dropOffAddress: true,
      createAt: true,
      _count: {
        select: {
          mover: true,
        },
      },
      confirmedQuote: {
        select: {
          id: true,
        },
      },
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

//이사요청 생성
const createMovingRequest = (
  customerId: number,
  movingRequest: MovingRequestData
) => {
  return prismaClient.movingRequest.create({
    data: {
      ...movingRequest,
      customerId,
    },
    select: {
      id: true,
      service: true,
      movingDate: true,
      pickupAddress: true,
      dropOffAddress: true,
    },
  });
};

//이사요청 지정
const updateDesignated = (movingRequestId: number, moverId: number) => {
  return prismaClient.movingRequest.update({
    where: { id: movingRequestId },
    data: {
      isDesignated: true,
      designateCount: {
        increment: 1,
      },
      mover: {
        connect: {
          id: moverId,
        },
      },
    },
    select: {
      _count: {
        select: {
          mover: true,
        },
      },
      mover: {
        where: {
          id: moverId,
        },
        select: {
          id: true,
          nickname: true,
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
};

//이사요청 지정 취소
const updateDesignatedCancel = (movingRequestId: number, moverId: number) => {
  return prismaClient.movingRequest.update({
    where: { id: movingRequestId },
    data: {
      designateCount: {
        decrement: 1,
      },
      mover: {
        disconnect: {
          id: moverId,
        },
      },
    },
    select: {
      _count: {
        select: {
          mover: true,
        },
      },
    },
  });
};

//이사요청 지정 개수 조회
const getDesignateCount = (movingRequestId: number) => {
  return prismaClient.movingRequest.findUnique({
    where: { id: movingRequestId },
    select: {
      _count: {
        select: {
          mover: true,
        },
      },
    },
  });
};

//활성중인 이사요청 조회
const getActiveRequest = (customerId: number) => {
  return prismaClient.movingRequest.findFirst({
    where: {
      customerId,
      confirmedQuote: {
        is: null,
      },
    },
    select: {
      id: true,
      mover: {
        select: {
          id: true,
        },
      },
    },
  });
};

const getDesignatedMovers = (movingRequestId: number, moverId: number) => {
  return prismaClient.movingRequest.findUnique({
    where: {
      id: movingRequestId,
      mover: {
        some: {
          id: moverId,
        },
      },
    },
    select: {
      mover: {
        select: {
          id: true,
        },
      },
    },
  });
};

export default {
  getMovingRequestListByMover,
  createMovingRequest,
  updateDesignated,
  updateDesignatedCancel,
  getDesignateCount,
  getActiveRequest,
  getMovingRequestById,
  getMovingRequestListByCustomer,
  getMovingRequestCountByCustomer,
  getMovingRequestCountByServices,
  getMovingRequestCountByDesignated,
  getTotalCount,
  getDesignatedMovers,
};
