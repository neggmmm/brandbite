import Cart from "./Cart.js";
import { getCartForUserService, addToCartService } from "./cart.service.js";
import { getProductByIdService, updateProductService } from "../product/product.service.js";
import { v4 as uuidv4 } from "uuid";

// Helper function to populate cart with product details including productPoints
async function populateCartWithProductPoints(cart) {
  if (!cart || !cart.products || cart.products.length === 0) return cart;
  
  const populatedCart = await cart.populate('products.productId');
  return populatedCart;
}

// Helper function to extract product ID from cart item (handles both populated and unpopulated)
function getProductIdFromCartItem(cartItem) {
  if (!cartItem || !cartItem.productId) return null;
  
  // If productId is an object (populated), get its _id
  if (typeof cartItem.productId === 'object' && cartItem.productId._id) {
    return cartItem.productId._id.toString();
  }
  
  // If productId is an ObjectId or string, convert to string
  return cartItem.productId.toString?.() || cartItem.productId;
}



// Helper function to merge guest cart into authenticated user's cart
async function mergeGuestCartIfNeeded(req, userId) {
  // Only merge if user is authenticated AND has different guest cart
  if (!req.user?._id || !req.cookies?.guestCartId) return;
  if (req.user._id.toString() === req.cookies.guestCartId.toString()) return;
  
  console.log("🔄 Merging guest cart into authenticated user cart");
  const guestCart = await getCartForUserService(req.cookies.guestCartId);
  
  if (!guestCart || !guestCart.products || guestCart.products.length === 0) return;
  
  let userCart = await getCartForUserService(userId);
  
  if (!userCart) {
    // If authenticated user has no cart, use guest cart and update userId
    userCart = guestCart;
    userCart.userId = userId;
  } else {
    // Merge guest cart products into user cart
    for (let guestProduct of guestCart.products) {
      const existingProduct = userCart.products.find(
        (p) => getProductIdFromCartItem(p) === getProductIdFromCartItem(guestProduct) &&
               JSON.stringify(p.selectedOptions) === JSON.stringify(guestProduct.selectedOptions || {})
      );
      
      if (existingProduct) {
        // Product exists, increase quantity
        existingProduct.quantity += guestProduct.quantity;
        existingProduct.price = guestProduct.price;
      } else {
        // New product, add to cart
        userCart.products.push(guestProduct);
      }
    }
    // Recalculate total price
    userCart.totalPrice = userCart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  }
  
  // Save merged cart
  await userCart.save();
  console.log("✅ Cart merged successfully");
  
  // Clear guest cart
  await Cart.findOneAndUpdate(
    { userId: req.cookies.guestCartId },
    { products: [], totalPrice: 0 },
    { new: true }
  );
}


function getCartUserId(req, res) {
//   console.log(" Incoming cookies:", req.cookies);

  if (req.user?._id) {
    return req.user._id.toString();
  }

  let guestId = req.cookies.guestCartId;

  const isProduction = process.env.NODE_ENV === "production";

  if (!guestId) {
    guestId = uuidv4();
    // console.log(" No guestCartId found → Generating:", guestId);

    res.cookie("guestCartId", guestId, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax", 
      secure: isProduction, // ← works on both
      path: "/",
    });
  } else {
    console.log("Existing guestCartId found:", guestId);
  }

  return guestId;
}

//getCartForUser
export const getCartForUser = async (req, res) => {
  try {
    const userId = getCartUserId(req, res);
    
    // ✅ Merge guest cart into authenticated user's cart if needed
    await mergeGuestCartIfNeeded(req, userId);
    
    let cart = await getCartForUserService(userId);
    
    // لو الكارت مش موجود → ننشئ واحدة فارغة
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
    }
    
    // Populate with product details to include productPoints
    cart = await populateCartWithProductPoints(cart);
    
    // Format cart response with proper product ID structure
    const formattedCart = {
      ...cart.toObject(),
      products: cart.products.map((item) => ({
        _id: item._id,
        productId: getProductIdFromCartItem(item),
        product: item.productId && typeof item.productId === 'object' ? item.productId : null,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {},
        price: item.price,
      })),
    };
    
    res.status(200).json(formattedCart);
  } catch (err) {
    console.error("❌ getCartForUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

function calculateFinalPrice(product, selectedOptions) {
  let total = product.basePrice;

  // ✅ FIX: Check if product has options first
  if (product.options && product.options.length > 0 && selectedOptions) {
    product.options.forEach((opt) => {
      const userChoice = selectedOptions[opt.name];
      if (!userChoice) return;

      const choiceData = opt.choices.find((c) => c.label === userChoice);
      if (choiceData) {
        total += choiceData.priceDelta;
      }
    });
  }

  return total;
}

// add to cart
export const addToCart = async (req, res) => {
  try {
    const userId = getCartUserId(req, res);
    const { productId, quantity, selectedOptions } = req.body;

    console.log("🛒 addToCart:", { userId, productId, quantity, selectedOptions });
    
    // ✅ Merge guest cart into authenticated user's cart if needed
    await mergeGuestCartIfNeeded(req, userId);

    let cart = await addToCartService(userId);
    const product = await getProductByIdService(productId, req.restaurantId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ FIX: Check if product has NO options or empty options array
    const hasOptions = product.options && product.options.length > 0;

    if (!hasOptions) {
      // المنتج مفيهوش اختيارات → استخدام stock العام
      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ message: "Requested quantity exceeds available stock" });
      }
      if (product.stock <= 0) {
        return res.status(400).json({ message: "Product is out of stock" });
      }
    }

    // ✅ FIX: Only validate options if product actually has options
    if (hasOptions && selectedOptions) {
      for (let opt of product.options) {
        const choiceName = selectedOptions[opt.name];
        if (!choiceName) {
          if (opt.required) {
            return res
              .status(400)
              .json({ message: `Option "${opt.name}" is required` });
          }
          continue;
        }

        const choiceData = opt.choices.find((c) => c.label === choiceName);
        if (!choiceData) {
          return res
            .status(400)
            .json({ message: `Invalid choice for option "${opt.name}"` });
        }

        if (choiceData.stock !== null && quantity > choiceData.stock) {
          return res
            .status(400)
            .json({
              message: `Not enough stock for option "${opt.name}" (${choiceName})`,
            });
        }
      }
    }

    const finalPrice = calculateFinalPrice(product, selectedOptions);

    // if first time -> create new cart
    if (!cart) {
      cart = new Cart({
        userId,
        products: [
          {
            productId,
            quantity,
            selectedOptions: selectedOptions || {},
            price: finalPrice,
          },
        ],
        totalPrice: finalPrice * quantity,
      });
    } else {
      // نشوف المنتج موجود بنفس الخيارات ولا لأ
      const productInCart = cart.products.find(
        (p) =>
          p.productId.toString() === productId &&
          JSON.stringify(p.selectedOptions) ===
            JSON.stringify(selectedOptions || {})
      );

      if (productInCart) {
        // لو المنتج مفيهوش اختيارات → شيك على stock العام
        if (!hasOptions) {
          if (productInCart.quantity + quantity > product.stock) {
            return res
              .status(400)
              .json({ message: "Not enough stock for this quantity" });
          }
        } else {
          // المنتج ليه options → شيك على stock الخاص بالاختيارات
          for (let opt of product.options) {
            const choiceName = selectedOptions[opt.name];
            if (!choiceName) continue;

            const choiceData = opt.choices.find((c) => c.label === choiceName);
            if (choiceData && choiceData.stock !== null) {
              if (productInCart.quantity + quantity > choiceData.stock) {
                return res.status(400).json({
                  message: `Not enough stock for option "${opt.name}" (${choiceName})`,
                });
              }
            }
          }
        }

        // هنا لازم تزودي الكمية
        productInCart.quantity += quantity;
        cart.totalPrice += finalPrice * quantity;
      } else {
        // منتج جديد
        cart.products.push({
          productId,
          quantity,
          selectedOptions: selectedOptions || {},
          price: finalPrice,
        });
        cart.totalPrice += finalPrice * quantity;
      }
    }

    // ✅ FIX: Update stock based on whether product has options
    if (!hasOptions) {
      // Update general stock
      await updateProductService({ stock: product.stock - quantity }, productId);
    } else if (selectedOptions) {
      // Update option choice stock
      const updateData = {};
      for (let opt of product.options) {
        const choiceName = selectedOptions[opt.name];
        if (!choiceName) continue;

        const choiceData = opt.choices.find((c) => c.label === choiceName);
        if (choiceData && choiceData.stock !== null) {
          choiceData.stock -= quantity;
        }
      }
      // Update entire options array
      updateData.options = product.options;
      await updateProductService(updateData, productId);
    }

    await cart.save();
    
    // Populate with product details to include productPoints
    const populatedCart = await populateCartWithProductPoints(cart);
      populatedCart.products = populatedCart.products.map(product => ({
      ...product.toObject(),
      selectedOptions: product.selectedOptions || {}
    }));
    
    res.status(201).json(populatedCart);
  } catch (err) {
    console.error("❌ addToCart error:", err);
    res.status(500).json({ error: err.message });
  }
};

// delete product from cart
export const deleteProductFromCart = async (req, res) => {
  try {
    const userId = getCartUserId(req, res);
    const { productId } = req.params;
    console.log("�️  deleteProductFromCart:", { userId, productId });    
    // ✅ Merge guest cart into authenticated user's cart if needed
    await mergeGuestCartIfNeeded(req, userId);
        // Get user cart
    let cart = await getCartForUserService(userId);
    // if (!cart) {
    //     return res.status(404).json({ message: 'Cart not found' });
    // }
    // لو الكارت مش موجود → ننشئ واحدة فارغة
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
    }

    // Check product exists in cart
    const productIndex = cart.products.findIndex(
      (p) => getProductIdFromCartItem(p) === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const cartItem = cart.products[productIndex];
    const product = await getProductByIdService(productId, req.restaurantId);

    if (!product) {
      return res.status(404).json({ message: "Product not found in DB" });
    }

    const quantity = cartItem.quantity;
    const finalPrice = cartItem.price;
    const selectedOptions = cartItem.selectedOptions;

    // Update total price
    cart.totalPrice -= finalPrice * quantity;

    // ---------------------------------------
    // ❗ RETURN STOCK
    // ---------------------------------------

    // ✅ FIX: Check if product has options
    const hasOptions = product.options && product.options.length > 0;

    // Case 1: Product with NO options → return general stock
    if (!hasOptions) {
      await updateProductService({ stock: product.stock + quantity }, productId);
    }

    // Case 2: Product WITH options → return stock to EACH selected choice
    if (hasOptions && selectedOptions) {
      for (let opt of product.options) {
        const selectedChoice = selectedOptions[opt.name];
        if (!selectedChoice) continue;

        const choiceObj = opt.choices.find((c) => c.label === selectedChoice);
        if (choiceObj && choiceObj.stock !== null) {
          choiceObj.stock += quantity;
        }
      }
      // Update entire options array
      await updateProductService({ options: product.options }, productId);
    }

    // Remove product from cart
    cart.products.splice(productIndex, 1);

    await cart.save();

    // Populate with product details to include productPoints
    const populatedCart = await populateCartWithProductPoints(cart);
  populatedCart.products = populatedCart.products.map(product => ({
      ...product.toObject(),
      selectedOptions: product.selectedOptions || {}
    }));
    res.status(200).json(populatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update product quantity in cart
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = getCartUserId(req, res);
    const { productId } = req.params;
    const { newQuantity } = req.body; // number

    console.log("🔄 updateCartQuantity:", { userId, productId, newQuantity });

    if (newQuantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    
    // ✅ Merge guest cart into authenticated user's cart if needed
    await mergeGuestCartIfNeeded(req, userId);

    let cart = await getCartForUserService(userId);
    // if (!cart) return res.status(404).json({ message: "Cart not found" });
    // لو الكارت مش موجود → ننشئ واحدة فارغة
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
    }
    
    console.log("📦 Cart products in updateCartQuantity:", cart.products.map(p => ({
      id: getProductIdFromCartItem(p),
      productId: p.productId,
    })));
    console.log("🔍 Looking for productId:", productId);
    
    const productIndex = cart.products.findIndex(
      (p) => {
        const extractedId = getProductIdFromCartItem(p);
        console.log("  Comparing:", extractedId, "===", productId, "?", extractedId === productId);
        return extractedId === productId;
      }
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const cartItem = cart.products[productIndex];
    const product = await getProductByIdService(productId, req.restaurantId);

    if (!product) {
      return res.status(404).json({ message: "Product not found in DB" });
    }

    const oldQuantity = cartItem.quantity;
    const difference = newQuantity - oldQuantity;

    // ✅ FIX: Check if product has options
    const hasOptions = product.options && product.options.length > 0;

    // ------------------------------------------------
    // CASE 1 → Increase quantity (need stock check)
    // ------------------------------------------------
    if (difference > 0) {
      // (A) product has NO options → check product.stock
      if (!hasOptions) {
        if (product.stock < difference) {
          return res.status(400).json({ message: "Not enough product stock" });
        }
        await updateProductService({ stock: product.stock - difference }, productId);
      }

      // (B) product HAS options → check each selected option stock
      if (hasOptions && cartItem.selectedOptions) {
        for (let opt of product.options) {
          const selected = cartItem.selectedOptions[opt.name];
          if (!selected) continue;

          const choiceObj = opt.choices.find((c) => c.label === selected);
          if (choiceObj && choiceObj.stock < difference) {
            return res.status(400).json({
              message: `Not enough stock for option: ${opt.name} (${selected})`,
            });
          }

          if (choiceObj) {
            choiceObj.stock -= difference;
          }
        }
        // Update entire options array
        await updateProductService({ options: product.options }, productId);
      }
    }

    // ------------------------------------------------
    // CASE 2 → Decrease quantity (return stock)
    // ------------------------------------------------
    if (difference < 0) {
      const qtyToReturn = Math.abs(difference);

      // product without options
      if (!hasOptions) {
        await updateProductService({ stock: product.stock + qtyToReturn }, productId);
      }

      // product with options
      if (hasOptions && cartItem.selectedOptions) {
        for (let opt of product.options) {
          const selected = cartItem.selectedOptions[opt.name];
          if (!selected) continue;

          const choiceObj = opt.choices.find((c) => c.label === selected);
          if (choiceObj) {
            choiceObj.stock += qtyToReturn;
          }
        }
        // Update entire options array
        await updateProductService({ options: product.options }, productId);
      }
    }

    // Update quantity
    cartItem.quantity = newQuantity;

    // Recalculate total cart price
    cart.totalPrice = cart.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    await cart.save();

    // Populate with product details to include productPoints
    const populatedCart = await populateCartWithProductPoints(cart);
      populatedCart.products = populatedCart.products.map(product => ({
      ...product.toObject(),
      selectedOptions: product.selectedOptions || {}
    }));
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("❌ updateCartQuantity error:", err);
    res.status(500).json({ error: err.message });
  }
};

//clearCart
export const clearCart = async (req, res) => {
  try {
    const userId = getCartUserId(req, res);
    
    // ✅ Merge guest cart into authenticated user's cart if needed
    await mergeGuestCartIfNeeded(req, userId);
    
    let cart = await getCartForUserService(userId);

    // if (!cart) {
    //     return res.status(404).json({ message: "Cart not found" });
    // }
    // لو الكارت مش موجود → ننشئ واحدة فارغة
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
      await cart.save();
    }

    // لو الكارت فاضي أصلاً
    if (cart.products.length === 0) {
      return res.status(200).json({ message: "Cart is already empty", cart });
    }

    // رجّع كل كميات ال products للـ stock
    for (let item of cart.products) {
      const product = await getProductByIdService(getProductIdFromCartItem(item), req.restaurantId);

      if (!product) continue; // لو المنتج اتحذف من DB متعمليش Error

      const quantity = item.quantity;

      // ✅ FIX: Check if product has options
      const hasOptions = product.options && product.options.length > 0;

      // -----------------------
      // Product WITH NO options
      // -----------------------
      if (!hasOptions) {
        await updateProductService({ stock: product.stock + quantity }, getProductIdFromCartItem(item));
      }

      // -----------------------
      // Product WITH options
      // -----------------------
      if (hasOptions && item.selectedOptions) {
        for (let opt of product.options) {
          const selected = item.selectedOptions[opt.name];
          if (!selected) continue;

          const choice = opt.choices.find((c) => c.label === selected);
          if (choice && choice.stock !== null) {
            choice.stock += quantity;
          }
        }
        // Update entire options array
        await updateProductService({ options: product.options }, getProductIdFromCartItem(item));
      }
    }

    // بعد ما رجّعنا الستوك → نمسح كل المنتجات من cart
    cart.products = [];
    cart.totalPrice = 0;

    await cart.save();

    // Populate with product details to include productPoints
    const populatedCart = await populateCartWithProductPoints(cart);
      populatedCart.products = populatedCart.products.map(product => ({
      ...product.toObject(),
      selectedOptions: product.selectedOptions || {}
    }));
    res.status(200).json({
      message: "Cart cleared successfully",
      cart: populatedCart,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
