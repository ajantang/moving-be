import movingRequestRepository from "../repositorys/movingRequestRepository";
import { MovingRequestData } from "../utils/interfaces/movingRequest/movingRequest";
import CustomError from "../utils/interfaces/customError";
import quoteRepository from "../repositorys/quoteRepository";
import processQuotes from "../utils/quote/processQuoteData";
import notificationRepository from "../repositorys/notificationRepository";
import moverRepository from "../repositorys/moverRepository";

interface queryString {
  limit: number;
  isDesignated: boolean | undefined;
  cursor: number | null;
  keyword: string;
  smallMove: boolean;
  houseMove: boolean;
  officeMove: boolean;
  orderBy: string;
  isQuoted: boolean | undefined;
  isPastRequest: boolean;
}

interface OffsetQueryString {
  pageSize: number;
  pageNum: number;
}

interface WhereCondition {
  keyword?: string;
  OR?: object[];
  AND?: object[];
  service?: object;
  mover?: object;
  quote?: object;
  isRejected?: object;
  movingDate?: object;
  region?: object;
}

const setWhereCondition = (query: queryString, moverId: number) => {
  const {
    keyword,
    smallMove,
    houseMove,
    officeMove,
    isDesignated,
    isQuoted,
    isPastRequest,
  } = query;
  const where: WhereCondition = {};

  if (keyword) {
    where.OR = [
      {
        customer: {
          user: {
            name: { contains: keyword },
          },
        },
      },
      {
        pickupAddress: {
          contains: keyword,
        },
      },
      {
        dropOffAddress: {
          contains: keyword,
        },
      },
    ];
  }

  const serviceTypes = [];
  if (smallMove) serviceTypes.push(1);
  if (houseMove) serviceTypes.push(2);
  if (officeMove) serviceTypes.push(3);

  if (serviceTypes.length > 0) {
    where.service = {
      in: serviceTypes,
    };
  }

  if (isDesignated === undefined) {
    where.mover = {};
  } else if (isDesignated) {
    where.mover = {
      some: {},
    };
  } else {
    where.mover = {
      none: {},
    };
  }

  if (isQuoted === undefined) {
    where.quote = {};
    where.isRejected = {};
  } else if (isQuoted) {
    where.OR = [
      {
        quote: {
          some: {
            moverId,
          },
        },
      },
      {
        isRejected: {
          some: {
            id: moverId,
          },
        },
      },
    ];
  } else {
    where.AND = [
      {
        quote: {
          none: {
            moverId,
          },
        },
      },
      {
        isRejected: {
          none: {
            id: moverId,
          },
        },
      },
    ];
  }

  if (isPastRequest) {
    // pastRequest가 true면 모든 날짜 조회 (where 조건 없음)
  } else {
    // pastRequest가 false면 오늘 자정 이후의 요청만 조회
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    where.movingDate = {
      gt: today,
    };
  }

  return where;
};

const setOrderBy = (orderBy: string) => {
  let orderByQuery: { [key: string]: "desc" | "asc" };
  switch (orderBy) {
    case "resent":
      orderByQuery = { createAt: "desc" };
      break;
    case "movingDate":
      orderByQuery = { movingDate: "asc" };
      break;
    default:
      orderByQuery = { createAt: "desc" };
  }
  return orderByQuery;
};

//이사요청 목록 조회
const getMovingRequestListByMover = async (
  moverId: number,
  query: queryString
) => {
  const { limit, cursor, orderBy } = query;
  const whereCondition: WhereCondition = setWhereCondition(query, moverId);
  const orderByQuery = setOrderBy(orderBy);

  const mover = await moverRepository.getMoverById(null, moverId);
  const regions = mover?.regions;
  if (!regions) {
    const error: CustomError = new Error("Not Found");
    error.status = 404;
    error.data = {
      message: "프로필에서 서비스 지역을 설정해 주세요.",
    };
    throw error;
  }

  whereCondition.region = {
    in: regions,
  };

  const countCondition = {
    quote: whereCondition.quote,
    OR: whereCondition.OR,
    AND: whereCondition.AND,
    movingDate: whereCondition.movingDate,
    region: whereCondition.region,
  };

  const serviceCountsPromise =
    movingRequestRepository.getMovingRequestCountByServices(countCondition);

  const totalCountPromise = movingRequestRepository.getTotalCount();
  const designatedCountPromise =
    movingRequestRepository.getMovingRequestCountByDesignated(moverId);

  const movingRequestListPromise =
    movingRequestRepository.getMovingRequestListByMover(
      { limit, cursor, orderBy: orderByQuery },
      whereCondition
    );

  const [movingRequestList, serviceCounts, totalCount, designatedCount] =
    await Promise.all([
      movingRequestListPromise,
      serviceCountsPromise,
      totalCountPromise,
      designatedCountPromise,
    ]);

  if (!movingRequestList) {
    const error: CustomError = new Error("Not Found");
    error.status = 404;
    error.message = "Not Found";
    error.data = {
      message: "이사요청 목록이 없습니다.",
    };
    throw error;
  }

  //커서 설정
  const nextCursor =
    movingRequestList.length > limit ? movingRequestList[limit - 1].id : "";
  const hasNext = Boolean(nextCursor); //다음 페이지가 있는지 여부

  //데이터 가공
  const resMovingRequestList = movingRequestList.map((movingRequest) => {
    const { _count, customer, createAt, confirmedQuote, isRejected, ...rest } =
      movingRequest;

    return {
      ...rest,
      requestDate: createAt,
      isConfirmed: Boolean(confirmedQuote), //완료된 견적서와 관계가 있다면 true
      name: customer.user.name,
      isDesignated: Boolean(_count.mover), //관계가 있다면 true
      isRejected: Boolean(isRejected.length > 0), //반려된 견적서와 관계가 있다면 true
    };
  });

  return {
    nextCursor, //다음 페이지 커서
    hasNext, //다음 페이지 존재 여부
    serviceCounts, //서비스별 이사요청 수
    requestCounts: {
      total: totalCount, //총 이사요청 수
      designated: designatedCount, //지정 이사요청 수
    },
    list: resMovingRequestList.slice(0, limit), //이사요청 목록
  };
};

const getMovingRequestListByCustomer = async (
  customerId: number,
  query: OffsetQueryString
) => {
  const { pageSize, pageNum } = query;

  const movingRequestListPromise =
    movingRequestRepository.getMovingRequestListByCustomer(customerId, {
      pageSize,
      pageNum,
    });
  const totalCountPromise =
    movingRequestRepository.getMovingRequestCountByCustomer(customerId);

  const [movingRequestList, totalCount] = await Promise.all([
    movingRequestListPromise,
    totalCountPromise,
  ]);

  if (!movingRequestList.length) {
    const error: CustomError = new Error("Not Found");
    error.status = 404;
    error.data = {
      message: "조건의 맞는 이사요청 목록이 없습니다.",
    };
    throw error;
  }

  const resMovingRequestList = movingRequestList.map((movingRequest) => {
    const { customer, createAt, confirmedQuote, ...rest } = movingRequest;

    return {
      ...rest,
      name: customer.user.name,
      requestDate: createAt,
      isConfirmed: Boolean(confirmedQuote), //완료된 견적서와 관계가 있다면 true
    };
  });

  const totalPage = Math.ceil(totalCount / pageSize);

  return {
    currentPage: pageNum,
    pageSize,
    totalPage,
    totalCount,
    list: resMovingRequestList,
  };
};

//이사요청의 견적서 조회
const getQuoteByMovingRequestId = async (
  customerId: number,
  movingRequestId: number,
  isCompleted: boolean | undefined
) => {
  const quotes = await quoteRepository.getQuoteByMovingRequestId(
    movingRequestId,
    isCompleted
  );

  const processedQuotes = await processQuotes(customerId, quotes);

  return {
    movingRequestId,
    list: processedQuotes,
  };
};

//대기중인 견적서 조회
const getPendingQuotes = async (customerId: number) => {
  const activeRequest = await movingRequestRepository.getActiveRequest(
    customerId
  );

  if (!activeRequest) {
    const error: CustomError = new Error("Not Found");
    error.status = 404;
    error.data = {
      message: "활성중인 이사요청이 없습니다.",
    };
    throw error;
  }

  const quoteCountPromise =
    await quoteRepository.getQuoteCountByMovingRequestId(activeRequest.id);

  const quotesPromise = quoteRepository.getQuoteByMovingRequestId(
    activeRequest.id
  );

  const [quotes, quoteCount] = await Promise.all([
    quotesPromise,
    quoteCountPromise,
  ]);

  const processedQuotes = await processQuotes(customerId, quotes);

  return {
    totalCount: quoteCount,
    list: processedQuotes,
  };
};

//이사요청 생성
const createMovingRequest = async (
  customerId: number,
  requestData: MovingRequestData
) => {
  const activeRequest = await movingRequestRepository.getActiveRequest(
    customerId
  );

  if (activeRequest) {
    const error: CustomError = new Error("Bad Request");
    error.status = 400;
    error.data = {
      message: "활성중인 이사요청이 있습니다.",
    };
    throw error;
  }

  const movingRequest = await movingRequestRepository.createMovingRequest(
    customerId,
    requestData
  );

  return movingRequest;
};

//이사요청 지정
const designateMover = async (moverId: number, customerId: number) => {
  const activeRequest = await movingRequestRepository.getActiveRequest(
    customerId
  );

  if (!activeRequest) {
    const error: CustomError = new Error("Bad Request");
    error.status = 422;
    error.data = {
      message: "일반 견적 요청을 먼저 진행해 주세요.",
    };
    throw error;
  }

  //지정 가능 인원 조회
  const designateCountPromise = movingRequestRepository.getDesignateCount(
    activeRequest.id
  );

  const designatedMoversPromise = movingRequestRepository.getDesignatedMovers(
    activeRequest.id,
    moverId
  );

  const [result, designatedMovers] = await Promise.all([
    designateCountPromise,
    designatedMoversPromise,
  ]);

  if (designatedMovers) {
    const error: CustomError = new Error("Bad Request");
    error.status = 400;
    error.data = {
      message: "이미 지정된 기사 입니다.",
    };
    throw error;
  }

  //지정 가능 인원 초과 체크
  if (!result || result._count.mover >= 3) {
    const error: CustomError = new Error("Bad Request");
    error.status = 400;
    error.data = {
      message: "지정 요청 가능한 인원이 초과되었습니다. (최대 3명)",
    };
    throw error;
  }

  //이사요청 지정
  const movingRequest = await movingRequestRepository.updateDesignated(
    activeRequest.id,
    moverId
  );

  //알림 생성 기사에게
  notificationRepository.createNotification({
    userId: moverId,
    content: `${movingRequest.mover[0].nickname}기사님 새로운 지정 요청이 있습니다.`,
    isRead: false,
  });

  //남은 지정요청 수 조회
  const designateRemain = 3 - movingRequest._count.mover;
  return designateRemain;
};

//이사요청 지정 취소
const cancelDesignateMover = async (moverId: number, customerId: number) => {
  const activeRequest = await movingRequestRepository.getActiveRequest(
    customerId
  );

  if (!activeRequest) {
    const error: CustomError = new Error("Bad Request");
    error.status = 422;
    error.data = {
      message: "일반 견적 요청을 먼저 진행해 주세요.",
    };
    throw error;
  }

  const designatedMovers = await movingRequestRepository.getDesignatedMovers(
    activeRequest.id,
    moverId
  );

  if (!designatedMovers) {
    const error: CustomError = new Error("Bad Request");
    error.status = 400;
    error.data = {
      message: "지정된 기사가 아닙니다.",
    };
    throw error;
  }

  //이사요청 지정 취소
  const movingRequest = await movingRequestRepository.updateDesignatedCancel(
    activeRequest.id,
    moverId
  );

  //남은 지정요청 수 조회
  const designateRemain = 3 - movingRequest._count.mover;
  return designateRemain;
};

export default {
  getMovingRequestListByMover,
  createMovingRequest,
  designateMover,
  cancelDesignateMover,
  getQuoteByMovingRequestId,
  getPendingQuotes,
  getMovingRequestListByCustomer,
};
