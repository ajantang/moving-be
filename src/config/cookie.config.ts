import { CookieOptions } from "express";

const accessTokenOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60, // 1시간
};

const refreshTokenOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
};

const clearCookieOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 0,
};

const sessionOption: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60, //1시간
};

export default {
  accessTokenOption,
  refreshTokenOption,
  clearCookieOption,
  sessionOption,
};
