import User from "../user/model/User.js";
import { findUserById } from "../user/repository/user.repository.js";
import { createReward, getAllRewardsRepo, deleteReward, getRewardById, updateReward } from "./reward.repo.js";

export const getAllRewardsServices = async () => {
    return await getAllRewardsRepo()
}

export const getRewardByIdService = async (id) => {
    return await getRewardById(id);
}

export const createRewardService = async (rewardData) => {
    return await createReward(rewardData);
}

export const deleteRewardService = async (id) => {
    return await deleteReward(id);
}

export const updateRewardService = async (id, rewardData) => {
    return await updateReward(id, rewardData);
}

export const redeemRewardService = async (rewardId, userId) => {
    try {
        const reward = await getRewardById(rewardId);
        const user = await findUserById(userId)

        if (!reward) throw new Error("Reward not found");
        if (!user) throw new Error("User not found");
        if (user.points < reward.pointsRequired)
            throw new Error("Insufficient points");

        await updatePointsService(userId, reward.pointsRequired);
        return { message: "Reward redeemed successfully" };
    } catch (err) {
        return {message:err.message}
    }

}

export async function updatePointsService(userId, pointsToDeduct) {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        if (user.points < pointsToDeduct) {
            throw new Error("Not enough points");
        }

        user.points -= pointsToDeduct;
        await user.save()
        return user;
    } catch (err) {
         return {message:err.message}
    }
}