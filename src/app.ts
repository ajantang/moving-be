import { PORT, SESSION_SECRET } from "./env";
import cookieParser from "cookie-parser";
import express from "express";
import cors, { CorsOptions } from "cors";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./controllers/authController";
import serviceRouter from "./controllers/serviceController";
import moverRouter from "./controllers/moverController";
import movingRequestRouter from "./controllers/movingRequestController";
import regionRouter from "./controllers/regionController";
import quoteRouter from "./controllers/quoteController";
import oauthRouter from "./controllers/oauthController";
import passport from "./middlewares/passport";
import session from "express-session";
import cookieConfig from "./config/cookie.config";
import customerRouter from "./controllers/customerController";
import userRouter from "./controllers/userController";
import reviewRouter from "./controllers/reviewController";
import notificationRouter from "./controllers/notificationController";
import confirmedQuoteRouter from "./controllers/confirmedQuoteController";
import { scheduleNotification } from "./schedules/notifications";
import { imageCleanup } from "./schedules/images";

const app = express();

//CORS 설정
const allowedOrigins: string[] = [
  "http://localhost:3001",
  "https://moving-fe-e1p7.vercel.app",
];
// CORS 설정
const corsOptions: CorsOptions = {
  credentials: true,
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, origin?: string) => void
  ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // 허용
    } else {
      callback(new Error("Not allowed by CORS")); // 허용하지 않음
    }
  },
  exposedHeaders: ["set-cookie"],
};

// Express app에 CORS 적용
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

//미들웨어
app.use(express.json()); //json parse
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: cookieConfig.sessionOption,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//알림 스케줄 등록
imageCleanup();
scheduleNotification();

//라우터 모음 -> 컨트롤러
app.use("/services", serviceRouter);
app.use("/regions", regionRouter);
app.use("/movers", moverRouter);
app.use("/moving-requests", movingRequestRouter);
app.use("/quotes", quoteRouter);
app.use("/confirmed-quotes", confirmedQuoteRouter);

app.use("/auth", authRouter);
app.use("/oauth", oauthRouter);
app.use("/customers", customerRouter);
app.use("/users", userRouter);
app.use("/notifications", notificationRouter);
app.use("/reviews", reviewRouter);
app.use(errorHandler); //전체 에러 핸들링 미들웨어

app.listen(PORT || 3000, () => console.log("Server Started"));
