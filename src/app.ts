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
import notificationRouter from "./controllers/notificationController";

import confirmedQuoteRouter from "./controllers/confirmedQuoteController";
import { initNotification } from "./schedules/notifications";
const app = express();

//CORS 설정
const allowedOrigins: string[] = [
  "http://localhost:3001",
  "http://localhost:3000",
];
// CORS 설정
// const corsOptions: CorsOptions = {
//   credentials: true,
//   origin: function (
//     origin: string | undefined,
//     callback: (err: Error | null, origin?: string) => void
//   ) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, origin); // 허용
//     } else {
//       callback(new Error("Not allowed by CORS")); // 허용하지 않음
//     }
//   },
//   exposedHeaders: ["set-cookie"],
// };

// Express app에 CORS 적용
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 허용할 HTTP 메서드
  allowedHeaders: ["Content-Type", "Authorization"], // 허용할 헤더
};

app.use(cors(corsOptions));

// OPTIONS 요청 처리
app.options("*", cors(corsOptions));
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
initNotification();

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

app.use(errorHandler); //전체 에러 핸들링 미들웨어

app.listen(PORT || 3000, () => console.log("Server Started"));
