import {getAllCategoriesRepo,getCategoryByIdRepo,addCategoryRepo,updateCategoryRepo,deleteCategoryRepo} from "./category.repository.js";

export const getAllCategoriesService = async (restaurantId = null) => {
    return await getAllCategoriesRepo(restaurantId);
}

export const getCategoryByIdService = async (id, restaurantId = null) => {
    return await getCategoryByIdRepo(id, restaurantId);
}

export const addCategoryService = async (data) => {
    return await addCategoryRepo(data);
}

export const updateCategoryService = async (id,data, restaurantId = null) => {
    return await updateCategoryRepo(id,data, restaurantId);
}

export const deleteCategoryService = async (id, restaurantId = null) => {
    return await deleteCategoryRepo(id, restaurantId);
}