import { DEFAULT_PROFILE_IMAGE } from "../env";
import userRepository from "../repositorys/userRepository";
import CustomError from "../utils/interfaces/customError";
import bcrypt from "bcrypt";

interface UpdateUser {
  name?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface CustomerResponse {
  customer: {
    id: number;
    imageUrl: string | { imageUrl: string }[];
    services: number[];
    regions: number[];
  };
}

interface MoverResponse {
  mover: {
    id: number;
    imageUrl: string | { imageUrl: string }[];
    services: number[];
    regions: number[];
    nickname: string;
    career: number;
    introduction: string;
    description: string;
  };
}

const updateUser = async (userId: number, updateData: UpdateUser) => {
  const user = await userRepository.findById(userId);

  if (updateData.newPassword || updateData.currentPassword) {
    //새로운 비밀번호, 현재 비밀번호가 존재하면 일단 로직 수행
    if (!updateData.newPassword || !updateData.currentPassword) {
      //그런데 둘 중 하나라도 없으면 에러 발생
      const error: CustomError = new Error("Bad Request");
      error.status = 400;
      error.data = {
        message:
          "비밀번호 변경을 위해서는 현재 비밀번호와 새로운 비밀번호가 모두 필요합니다.",
      };
      throw error;
    }

    const isPasswordCorrect = await bcrypt.compare(
      updateData.currentPassword,
      user!.password!
    );

    if (!isPasswordCorrect) {
      const error: CustomError = new Error("Invalid password");
      error.status = 401;
      error.data = {
        message: "현재 비밀번호가 일치하지 않습니다.",
      };
      throw error;
    }

    if (updateData.currentPassword === updateData.newPassword) {
      const error: CustomError = new Error("Conflict");
      error.status = 409;
      error.data = {
        message: "기존 비밀번호와 동일합니다.",
      };
      throw error;
    }
  }

  const updateUserData: {
    name?: string;
    phoneNumber?: string;
    password?: string;
  } = {};

  if (updateData.name) updateUserData.name = updateData.name;
  if (updateData.phoneNumber)
    updateUserData.phoneNumber = updateData.phoneNumber;
  if (updateData.newPassword) {
    updateUserData.password = await bcrypt.hash(updateData.newPassword, 10);
  }

  return await userRepository.updateUser(userId, updateUserData);
};

const getUser = async (userId: number) => {
  const userType = await userRepository.getUserType(userId);

  if (userType === "customer") {
    const response = (await userRepository.getCustomer(
      userId
    )) as CustomerResponse;
    if (!response?.customer?.imageUrl) {
      response.customer.imageUrl = DEFAULT_PROFILE_IMAGE;
    } else if (Array.isArray(response.customer.imageUrl)) {
      response.customer.imageUrl =
        response.customer.imageUrl[0]?.imageUrl || DEFAULT_PROFILE_IMAGE;
    }
    return response;
  } else if (userType === "mover") {
    const response = (await userRepository.getMover(userId)) as MoverResponse;
    if (!response?.mover?.imageUrl) {
      response.mover.imageUrl = DEFAULT_PROFILE_IMAGE;
    } else if (Array.isArray(response.mover.imageUrl)) {
      response.mover.imageUrl =
        response.mover.imageUrl[0]?.imageUrl || DEFAULT_PROFILE_IMAGE;
    }
    return response;
  } else {
    throw new Error("User not found");
  }
}; //imageUrl: object 타입으로 반환하지 않고 string 타입으로 1개 반환

const getUserById = async (userId: number) => {
  return await userRepository.findByUserId(userId);
};

export default {
  updateUser,
  getUser,
  getUserById,
};
