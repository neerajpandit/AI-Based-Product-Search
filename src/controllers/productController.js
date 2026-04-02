import * as productService from "../services/productService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// CREATE
export const createProductController = asyncHandler(async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET ALL
export const getAllProductsController = asyncHandler(async (req, res) => {
  try {
    const products = await productService.getProducts();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE
export const updateProductController = asyncHandler(async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
});

// SOft- DELETE
export const deleteProductController = asyncHandler(async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
});
