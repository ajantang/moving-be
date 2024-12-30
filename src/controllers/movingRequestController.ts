import express from "express";
import movingRequestService from "../services/movingRequestService";
import { asyncHandle } from "../utils/asyncHandler";
import movingRequest from "../middlewares/validations/movingRequest";
import checkBoolean from "../utils/checkBoolean";
import passport from "passport";
import { isCustomer, isMover } from "../middlewares/authMiddleware";

const router = express.Router();

//이사요청 목록 조회
router.get(
  "/by-mover",
  passport.authenticate("jwt", { session: false }),
  isMover,
  asyncHandle(async (req, res, next) => {
    try {
      const { moverId } = req.user as { moverId: number };

      const {
        limit = "10",
        isDesignated = "",
        cursor = "0",
        keyword = "",
        smallMove = "false",
        houseMove = "false",
        officeMove = "false",
        orderBy = "resent",
        isQuoted = "",
        isPastRequest = "false",
      } = req.query;
      const parseLimit = parseInt(limit as string);
      const parseCursor = parseInt(cursor as string);
      const parseIsDesignated = checkBoolean(isDesignated as string);
      const parseSmallMove = checkBoolean(smallMove as string);
      const parseHouseMove = checkBoolean(houseMove as string);
      const parseOfficeMove = checkBoolean(officeMove as string);
      const parseIsQuoted = checkBoolean(isQuoted as string);
      const parsePastRequest = checkBoolean(isPastRequest as string);

      const movingRequestList =
        await movingRequestService.getMovingRequestListByMover(moverId, {
          limit: parseLimit,
          isDesignated: parseIsDesignated,
          cursor: parseCursor,
          keyword: keyword as string,
          smallMove: parseSmallMove || false,
          houseMove: parseHouseMove || false,
          officeMove: parseOfficeMove || false,
          orderBy: orderBy as string,
          isQuoted: parseIsQuoted,
          isPastRequest: parsePastRequest || false,
        });
      return res.status(200).send(movingRequestList);
    } catch (error) {
      next(error);
    }
  })
);

//이사요청 목록 조회 (고객)
router.get(
  "/by-customer",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const { pageSize = "10", pageNum = "1" } = req.query;
      const parsePageSize = parseInt(pageSize as string);
      const parsePageNum = parseInt(pageNum as string);
      const movingRequestList =
        await movingRequestService.getMovingRequestListByCustomer(customerId, {
          pageSize: parsePageSize,
          pageNum: parsePageNum,
        });
      return res.status(200).send(movingRequestList);
    } catch (error) {
      next(error);
    }
  })
);

//이사요청의 견적서 목록 조회
router.get(
  "/:id/quotes",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const { id: movingRequestId } = req.params;
      const { isCompleted = "" } = req.query;
      const parseIsCompleted = checkBoolean(isCompleted as string);
      const quotes = await movingRequestService.getQuoteByMovingRequestId(
        customerId,
        parseInt(movingRequestId),
        parseIsCompleted
      );
      return res.status(200).send(quotes);
    } catch (error) {
      next(error);
    }
  })
);

//대기중인 견적서 조회
router.get(
  "/pending-quotes",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const pendingQuotes = await movingRequestService.getPendingQuotes(
        customerId
      );
      return res.status(200).send(pendingQuotes);
    } catch (error) {
      next(error);
    }
  })
);

//이사요청 생성
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  movingRequest.createMovingRequestValidation, //유효성 검사
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const { service, movingDate, pickupAddress, dropOffAddress, region } =
        req.body;
      const date = new Date(movingDate);
      const parseRegion = parseInt(region as string);
      const movingRequest = await movingRequestService.createMovingRequest(
        customerId,
        {
          service,
          movingDate: date,
          pickupAddress,
          dropOffAddress,
          region: parseRegion,
        }
      );
      return res.status(201).send(movingRequest);
    } catch (error) {
      next(error);
    }
  })
);

//이사요청 기사 지정하기
router.post(
  "/:id/designated",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { id: moverId } = req.params;
      const { customerId } = req.user as { customerId: number };
      const remainingCount = await movingRequestService.designateMover(
        parseInt(moverId as string),
        customerId
      );
      return res.status(200).send({
        message: "지정 요청 완료",
        designateRemain: remainingCount,
      });
    } catch (error) {
      next(error);
    }
  })
);

//이사요청 기사 지정 취소하기
router.delete(
  "/:id/designated",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { id: moverId } = req.params;
      const { customerId } = req.user as { customerId: number };
      const remainingCount = await movingRequestService.cancelDesignateMover(
        parseInt(moverId as string),
        customerId
      );
      return res.status(200).send({
        message: "지정 요청 취소",
        designateRemain: remainingCount,
      });
    } catch (error) {
      next(error);
    }
  })
);

export default router;
