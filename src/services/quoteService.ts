// 필요한 모듈들을 가져옵니다.
import quoteRepository from "../repositorys/quoteRepository";
import customError from "../utils/interfaces/customError";
import processQuotes from "../utils/quote/processQuoteData";
import movingRequestRepository from "../repositorys/movingRequestRepository";
import moverRepository from "../repositorys/moverRepository";
import { QuoteQueryString } from "../utils/quote/types";

// 특정 견적서를 아이디로 가져오는 함수입니다.
const getQuoteById = async (customerId: number, quoteId: number) => {
  // 견적서를 데이터베이스에서 가져옵니다.
  const quote = await quoteRepository.getQuoteById(quoteId);

  // 만약 견적서를 찾지 못하면 에러를 발생시킵니다.
  if (!quote) {
    const error: customError = new Error("Not Found");
    error.status = 404;
    error.message = "Not Found";
    error.data = {
      message: "견적서를 찾을 수 없습니다.",
    };
    throw error;
  }

  // 견적서 데이터를 가공합니다.
  const processedQuote = await processQuotes(customerId, quote);

  return processedQuote;
};

// (받은 요청) 견적서를 보내는 함수입니다.
const createQuote = async (
  movingRequestId: number,
  moverId: number,
  cost: number,
  comment: string
) => {
  // 이사 요청이 존재하는지 확인
  const movingRequest = await movingRequestRepository.getMovingRequestById(
    movingRequestId
  );
  if (!movingRequest) {
    const error: customError = new Error("Not Found");
    error.status = 404;
    error.message = "Not Found";
    error.data = {
      message: "존재하지 않는 이사 요청입니다.",
    };
    throw error;
  }

  // 견적서 생성
  const quote = await quoteRepository.createQuoteByMovingRequestId(
    movingRequestId,
    moverId,
    cost,
    comment
  );

  return {
    id: quote.id,
    cost: quote.cost,
    comment: quote.comment,
    service: quote.movingRequest.service,
    pickupAddress: quote.movingRequest.pickupAddress,
    dropOffAddress: quote.movingRequest.dropOffAddress,
    movingDate: quote.movingRequest.movingDate,
    isDesignated: quote.movingRequest.isDesignated,
  };
};

// (기사님이 작성한) 견적서 목록 조회
const getQuoteList = async (moverId: number, query: QuoteQueryString) => {
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

  const { limit, cursor } = query;

  // Repository 호출
  const quotes = await quoteRepository.getQuoteListByMoverId(moverId, {
    limit,
    cursor,
  });

  const nextCursor =
    quotes.length === limit ? quotes[quotes.length - 1].id : null;
  const hasNext = quotes.length === limit;

  // 다음 페이지 여부 체크
  return {
    nextCursor,
    hasNext,
    list: quotes.map((quote) => {
      const today = new Date(); // 추가 : isCompleted 계산을 위한 현재 날짜
      const movingDate = new Date(quote.movingRequest.movingDate);

      return {
        id: quote.id,
        service: quote.movingRequest.service,
        isDesignated: quote.movingRequest.isDesignated,
        name: quote.movingRequest.customer.user.name, // 변경: customerName -> name
        movingDate: quote.movingRequest.movingDate,
        pickupAddress: quote.movingRequest.pickupAddress,
        dropOffAddress: quote.movingRequest.dropOffAddress,
        cost: quote.cost,
        isCompleted: movingDate < today, // 추가: 이사일이 지났는지 확인
        isConfirmed: !!quote.confirmedQuote,
        requestDate: quote.createAt, // 추가: 요청일자 추가
      };
    }),
  };
};

// (기사님이 작성한) 견적서 상세 조회
const getQuoteDetail = async (
  moverId: number,
  quoteId: number,
  cost: number
) => {
  // 1. 견적서가 존재하는지 확인합니다.
  const quote = await quoteRepository.getQuoteDetailByMoverId(moverId, quoteId);

  if (!quote) {
    const error: customError = new Error("Not Found");
    error.status = 404;
    error.message = "Not Found";
    error.data = {
      message: "견적서를 찾을 수 없습니다.",
    };
    throw error;
  }

  // 2. 응답 데이터를 가공하여 반환합니다.
  return {
    id: quote.id,
    cost: quote.cost,
    comment: quote.comment,
    service: quote.movingRequest.service,
    customerName: quote.movingRequest.customer.user.name,
    movingDate: quote.movingRequest.movingDate,
    pickupAddress: quote.movingRequest.pickupAddress,
    dropOffAddress: quote.movingRequest.dropOffAddress,
    isDesignated: quote.movingRequest.isDesignated,
    requestDate: quote.createAt, // 추가: 요청일자 추가
  };
};

// (기사님의) 지정이사 요청 반려
const rejectRequest = async (moverId: number, movingRequestId: number) => {
  // 1. 이사 요청이 존재하는지 확인
  const movingRequest = await movingRequestRepository.getMovingRequestById(
    movingRequestId
  );
  if (!movingRequest) {
    const error: customError = new Error("Not Found");
    error.status = 404;
    error.message = "Not Found";
    error.data = {
      message: "존재하지 않는 이사 요청입니다.",
    };
    throw error;
  }

  // 2. 반려 처리
  const rejectedRequest = await quoteRepository.rejectMovingRequest(
    moverId,
    movingRequestId
  );

  // 3. API 명세에 맞는 응답 데이터 반환
  return {
    id: movingRequestId,
    comment: "죄송합니다. 그날 예약이 되어 있습니다", // 실제 데이터에서 가져오거나 설정된 메시지
  };
};

// (기사님이) 반려한 이사 요청 목록 조회
const getRejectedRequestList = async (
  moverId: number,
  query: QuoteQueryString
) => {
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

  const { limit, cursor } = query;

  // Repository 호출
  const rejectedMovingRequests =
    await quoteRepository.getRejectedMovingRequests(moverId, {
      limit,
      cursor,
    });

  const nextCursor =
    rejectedMovingRequests.length === limit
      ? rejectedMovingRequests[rejectedMovingRequests.length - 1].id
      : null;
  const hasNext = rejectedMovingRequests.length === limit;

  // API 명세에 맞는 응답 데이터 반환
  return {
    nextCursor,
    hasNext,
    list: rejectedMovingRequests.map((movingRequest) => ({
      id: movingRequest.id,
      service: movingRequest.service,
      name: movingRequest.customer.user.name,
      movingDate: movingRequest.movingDate,
      pickupAddress: movingRequest.pickupAddress,
      dropOffAddress: movingRequest.dropOffAddress,
      requestDate: movingRequest.createAt, // 추가: 요청일자 추가
    })),
  };
};
// 이 모듈에서 제공하는 함수들을 내보냅니다.
export default {
  getQuoteById, // 견적서 아이디로 견적서를 가져오는 함수
  createQuote, // 견적서를 생성하는 함수
  getQuoteList, // 견적서 목록을 가져오는 함수
  getQuoteDetail, // 견적서 상세 정보를 가져오는 함수
  rejectRequest, // 이사 요청 반려
  getRejectedRequestList, // 반려한 이사 요청 목록 조회
};
