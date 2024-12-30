export interface ReviewCreateData {
  confirmedQuoteId: number;
  rating: number;
  content: string;
  imageUrl?: string[];
}

export interface ReviewQuery {
  pageSize?: number;
  pageNum?: number;
}

// 중첩 없는 평탄화된 응답 구조
export interface ReviewListItem {
  id: number;
  rating: number;
  content: string;
  createdAt: Date;
  service: number;
  isDesignated: boolean;
  movingDate: Date;
  cost: number;
  imageUrl: string;
  nickname: string;
}

export interface ReviewListResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  list: ReviewListItem[];
}

// 작성 가능한 리뷰 목록 응답 타입
export interface AvailableReviewItem {
  id: number;
  service: number;
  isDesignated: boolean;
  imageUrl: string[]; // Mover의 imageUrl
  nickname: string;
  movingDate: string;
  cost: number;
}

export interface AvailableReviewListResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCounts: number;
  list: AvailableReviewItem[];
}
