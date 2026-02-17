import productModel from "./Product.js";

export const getAll = async (restaurantId = null) => {
  const filter = {};
  if (restaurantId) filter.restaurantId = restaurantId;
  return await productModel.find(filter).select("-embedding");
};

export const getProductById = async (id, restaurantId = null) => {
  const product = await productModel.findById(id);
  if (!product) return null;
  if (restaurantId && product.restaurantId && product.restaurantId.toString() !== restaurantId.toString()) {
    return null;
  }
  return product;
};

export const createProduct = async (productData) => {
  // Ensure restaurantId is set when creating
  return await productModel.create(productData);
};

export const updateProduct = async (productData, id) => {
  return await productModel.findByIdAndUpdate(id, productData, { new: true });
};

export const deleteProduct = async (id) => {
  return await productModel.findByIdAndDelete(id);
};

export const getNewProducts = async (restaurantId = null) => {
  const filter = {};
  if (restaurantId) filter.restaurantId = restaurantId;
  return await productModel.find(filter).sort({ createdAt: -1 }).limit(5);
};

export const getProductForList = async (
  queryFilter,
  sortBy,
  sortOrder,
  page,
  pageSize
) => {
  return await productModel
    .find(queryFilter)
    .sort({ [sortBy]: +sortOrder })
    .skip((page - 1) * pageSize)
    .limit(pageSize);
};

// for AI
export const getAllProductsWithLean = async () => {
  return await productModel.find({}).lean();
};

export const updateEmbeddingProductByID = async (id, embeddingObject) => {
  return await productModel.findByIdAndUpdate(id, embeddingObject);
};
