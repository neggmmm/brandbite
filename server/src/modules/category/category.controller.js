import {getAllCategoriesService,getCategoryByIdService,addCategoryService,updateCategoryService,deleteCategoryService} from "./category.service.js";

//getAllCategories
export const getAllCategories = async (req, res) => {
    try{
        const categories = await getAllCategoriesService(req.restaurantId);
        res.status(200).json(categories);
    }catch(err){
        res.status(500).json({error:err.message});

    }
}

//getCategoryById
export const getCategoryById = async (req, res) => {
    try{
        const {id} = req.params;
        const category = await getCategoryByIdService(id, req.restaurantId);
        if(!category){
            return res.status(404).json({ message: 'category not found' });
        }
        res.status(200).json(category);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}

//addCategory
export const addCategory = async (req, res) => {
    try{
        req.body.imgURL = req.file.path;
        if(!req.body.name) return res.status(400).json({ message: "Name is required" });
        req.body.restaurantId = req.restaurantId || req.body.restaurantId;
        const category = await addCategoryService(req.body);
        res.status(201).json(category);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}

//updateCategory
export const updateCategory = async (req, res) => {
    try{
        const {id} = req.params;
        if(req.file){
            req.body.imgURL = req.file.path;
        }
        const category = await updateCategoryService(id,req.body, req.restaurantId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}

//deleteCategory
export const deleteCategory = async (req, res) => {
    try{
        const {id} = req.params;
        const category = await deleteCategoryService(id, req.restaurantId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    }catch(err){
        res.status(500).json({error:err.message});
    }
}