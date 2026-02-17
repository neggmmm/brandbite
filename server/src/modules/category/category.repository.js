import categoryModel from "./Category.js";

export const getAllCategoriesRepo = async (restaurantId = null) => {
    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    return await categoryModel.find(filter);
}

export const getCategoryByIdRepo = async (id, restaurantId = null) => {
    const category = await categoryModel.findById(id);
    if (!category) return null;
    if (restaurantId && category.restaurantId && category.restaurantId.toString() !== restaurantId.toString()) return null;
    return category;
}

export const addCategoryRepo = async (data) => {
    return await categoryModel.create(data);
}

export const updateCategoryRepo = async (id,data, restaurantId = null) => {
    const category = await categoryModel.findById(id);
    if (!category) return null;
    if (restaurantId && category.restaurantId && category.restaurantId.toString() !== restaurantId.toString()) return null;
    return await categoryModel.findByIdAndUpdate(id,data,{new:true});
}

export const deleteCategoryRepo = async (id, restaurantId = null) => {
    const category = await categoryModel.findById(id);
    if (!category) return null;
    if (restaurantId && category.restaurantId && category.restaurantId.toString() !== restaurantId.toString()) return null;
    return await categoryModel.findByIdAndDelete(id);
}
