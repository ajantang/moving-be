import express from "express";
import confirmedQuoteService from "../services/confirmedQuoteService";
import { asyncHandle } from "../utils/asyncHandler";
import passport from "../middlewares/passport";
import { isCustomer } from "../middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isCustomer,
  asyncHandle(async (req, res, next) => {
    try {
      const { customerId } = req.user as { customerId: number };
      const { id } = req.params;
      const confirmedQuote = await confirmedQuoteService.createConfirmedQuote({
        quoteId: parseInt(id),
        customerId,
      });

      const resData = {
        message: "견적서 확정 완료",
        data: {
          id: confirmedQuote.id,
          movingRequestId: confirmedQuote.movingRequest.id,
          quoteId: confirmedQuote.quote.id,
          moverId: confirmedQuote.mover.id,
        },
      };

      res.status(201).send(resData);
    } catch (error) {
      next(error);
    }
  })
);

export default router;
