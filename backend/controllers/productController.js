const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const APIFeatures = require("../utils/apiFeatures");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const categoryHierarchy = require("../config/categoryHierarchy");
//get all Product -- /api/v1/Products
exports.getProducts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 12;

  // Validate and sanitize limit
  let limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit <= 0) {
    limit = resPerPage; // Fallback to default
  }

  let buildQuery = () => {
    return new APIFeatures(
      Product.find({ $and: [{ status: "approved" }, 
        // { isArchived: false} 
      ] 
      }),
      req.query
    )
      .search()
      .filter();
  };


  const filteredProductsCount = await buildQuery().query.countDocuments({});
  const totalProductsCount = await Product.countDocuments({
    status: "approved",
    // isArchived: false,
  });
  const productsCount =
    filteredProductsCount !== totalProductsCount
      ? filteredProductsCount
      : totalProductsCount;

  const products = await buildQuery().paginate(limit).query.sort("-createdAt");

  const subcategoryCounts = {};
  const allApprovedProducts = await Product.find({ status: "approved" });
  allApprovedProducts.forEach((product) => {
    if (subcategoryCounts[product.subcategory]) {
      subcategoryCounts[product.subcategory]++;
    } else {
      subcategoryCounts[product.subcategory] = 1;
    }
  });

  res.status(200).json({
    success: true,
    count: productsCount,
    subcategoryCounts,
    resPerPage: limit,
    products,
  });
});

//Create Product - /api/v1/products/new
exports.newProduct = catchAsyncError(async (req, res, next) => {
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      const match = key.match(/variants\[(\d+)\]\[images\]/);
      if (match) {
        const variantIndex = parseInt(match[1], 10);
        if (req.body.variants[variantIndex]) {
          req.body.variants[variantIndex].images = req.files[key].map((file) => (
            `${req.protocol}://${req.get("host")}/uploads/product/${file.filename}`
          ));
        }
      }
    });
  }

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    maincategory: req.body.maincategory,
    category: req.body.category,
    subcategory: req.body.subcategory,
    brand: req.body.brand,
    condition: req.body.condition,
    tax: req.body.tax,
    keyPoints: req.body.keyPoints,
    images: req.files.images ? req.files.images.map(file => (
      `${req.protocol}://${req.get("host")}/uploads/product/${file.filename}`
    )) : [],
    variants: req.body.variants,
    createdBy: req.user.id,
    isRefundable: req.body.isRefundable === "true",
    price: req.body.price,
    offPrice: req.body.offPrice,
    stock: req.body.stock,
    itemModelNum: req.body.itemModelNum,
    serialNum: req.body.serialNum,
    connectionType: req.body.connectionType,
    hardwarePlatform: req.body.hardwarePlatform,
    os: req.body.os,
    powerConception: req.body.powerConception,
    batteries: req.body.batteries,
    packageDimension: req.body.packageDimension,
    portDescription: req.body.portDescription,
    connectivityType: req.body.connectivityType,
    compatibleDevices: req.body.compatibleDevices,
    powerSource: req.body.powerSource,
    specialFeatures: req.body.specialFeatures,
    includedInThePackage: req.body.includedInThePackage,
    manufacturer: req.body.manufacturer,
    itemSize: req.body.itemSize,
    itemWidth: req.body.itemWidth,
  });
  console.log(req.body)
  res.status(201).json({ success: true, product });
});
//getting single product -- api/v1/product/id
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    status: "approved",
    // isArchived: false,
  }).populate("reviews.user", "name email");

  if (!product) {
    return next(new ErrorHandler("Product not found or not approved", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//Update Product - api/v1/product/:id 
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id).populate("createdBy");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
  console.log(req.body)
  const creatorInfo = {
    email: product.createdBy.email,
    name: product.createdBy.name,
  };

  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  // Handle main product images if provided
  if (req.files && req.files.images) {
    req.body.images = req.files.images.map(
      (file) => `${BASE_URL}/uploads/product/${file.filename}`
    );
  }

  // Preserve existing variants if no variants are provided
  let updatedVariants = product.variants ? [...product.variants] : [];

  if (req.body.variants) {
    // Ensure variants is an array
    if (!Array.isArray(req.body.variants)) {
      req.body.variants = [req.body.variants];
    }

    req.body.variants.forEach((variant, index) => {
      if (product.variants[index]) {
        // Merge existing variant details with updated data
        updatedVariants[index] = { ...product.variants[index], ...variant };
      } else {
        // Add new variant
        updatedVariants[index] = variant;
      }
    });
  }

  // Handle variant images if uploaded
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      const match = key.match(/variants\[(\d+)\]\[images\]/);
      if (match) {
        const variantIndex = parseInt(match[1], 10);
        if (!updatedVariants[variantIndex]) {
          updatedVariants[variantIndex] = {};
        }
        updatedVariants[variantIndex].images = req.files[key].map(
          (file) => `${BASE_URL}/uploads/product/${file.filename}`
        );
      }
    });
  }

  // Assign updated variants back to the request body
  req.body.variants = updatedVariants;

  // Merge req.body with existing product data
  const updatedData = { ...product.toObject() };

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== "undefined") {  // Prevent "undefined" strings from being stored
      updatedData[key] = req.body[key];
    }
  });

  // Update product
  product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });

  // Send email notification if the status changed
  if (req.body.status && req.body.status !== product.status) {
    try {
      const statusMessage = req.body.status === "approved" ? "approved" : "rejected";
      let emailContent = `
        <h2>Your Product Update</h2>
        <p>Dear ${creatorInfo.name},</p>
        <p>Your product "${product.name}" has been ${statusMessage}.</p>
        <p>Thank you for using our platform!</p>
      `;

      if (req.body.status === "rejected" && req.body.rejectionReason) {
        emailContent += `<p>Reason for rejection: ${req.body.rejectionReason}</p>`;
      }

      await sendEmail({
        fromEmail: "glocre@glocre.com", 
        email: creatorInfo.email,
        subject: `Product ${statusMessage}`,
        html: emailContent,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }
  }
});

//Delete product - api/v1/product/:id
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "product not found",
    });
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "product Deleted!",
  });
});

//Create Review - api/v1/review
exports.createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user.id,
    rating: Number(rating), // Ensure rating is stored as a number
    comment,
  };

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Check if user already reviewed the product
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    // Update existing review
    product.reviews.forEach((r) => {
      if (r.user.toString() === req.user.id.toString()) {
        r.rating = review.rating;
        r.comment = review.comment;
      }
    });
  } else {
    // Add new review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // Calculate average rating
  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: isReviewed ? "Review updated" : "Review added",
  });
});

//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate(
    "reviews.user",
    "name email"
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  //filtering the reviews which does match the deleting review id
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString();
  });
  //number of reviews
  const numOfReviews = reviews.length;

  //finding the average with the filtered reviews
  let ratings =
    reviews.reduce((acc, review) => {
      return review.rating + acc;
    }, 0) / reviews.length;
  ratings = isNaN(ratings) ? 0 : ratings;

  //save the product document
  await Product.findByIdAndUpdate(req.query.productId, {
    reviews,
    numOfReviews,
    ratings,
  });
  res.status(200).json({
    success: true,
  });
});

// get admin products  - api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 10; // Adjust results per page as needed

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search() // Handles search (e.g., by product name or ID)
    .filter() // Handles filtering (e.g., by category, price range)
    .paginate(resPerPage); // Paginates the results

  const products = await apiFeatures.query;
  const totalProductsCount = await Product.countDocuments();

  res.status(200).json({
    success: true,
    totalProductsCount,
    resPerPage,
    products,
  });
});

// seller Controller
exports.getSellerProducts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 10;

  const apiFeatures = new APIFeatures(
    Product.find({
      createdBy: req.user.id,
      isArchived: false,
    }).lean(), // Improves performance by returning plain objects
    req.query
  )
    .search()   // Handles search (e.g., by product name or ID)
    .filter()   // Handles filtering (e.g., by category, price range)
    .paginate(resPerPage); // Apply pagination

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: products.length,
    resPerPage,
    products,
  });
});

exports.getArchiveProducts = catchAsyncError(async (req, res, next) => {
  const resPerPage = 10;
  const apiFeatures = new APIFeatures(
    Product.find({ createdBy: req.user.id,
      isArchived: true
     }),
    req.query
  )
    .search() // Handles search (e.g., by product name or ID)
    .filter() // Handles filtering (e.g., by category, price range)
    .paginate(resPerPage);
  const products = await apiFeatures.query;
  res.status(200).json({
    success: true,
    count: products.length,
    resPerPage,
    products,
  });
});

// Add a new product
exports.addSellerProduct = catchAsyncError(async (req, res, next) => {
  const { maincategory, category, subcategory } = req.body;

  if (
    !categoryHierarchy[maincategory] ||
    !categoryHierarchy[maincategory][category] ||
    (categoryHierarchy[maincategory][category].length > 0 &&
      !categoryHierarchy[maincategory][category].includes(subcategory))
  ) {
    return res.status(400).json({ message: "Invalid category selection." });
  }
  // Process variant images
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      const match = key.match(/variants\[(\d+)\]\[images\]/);
      if (match) {
        const variantIndex = parseInt(match[1], 10);
        if (req.body.variants[variantIndex]) {
          req.body.variants[variantIndex].images = req.files[key].map((file) => (
            `${req.protocol}://${req.get("host")}/uploads/product/${file.filename}`
          ));
        }
      }
    });
  }

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description,
    maincategory: req.body.maincategory,
    category: req.body.category,
    subcategory: req.body.subcategory,
    brand: req.body.brand,
    condition: req.body.condition,
    tax: req.body.tax,
    keyPoints: req.body.keyPoints,
    images: req.files.images ? req.files.images.map(file => (
      `${req.protocol}://${req.get("host")}/uploads/product/${file.filename}`
    )) : [],
    variants: req.body.variants,
    createdBy: req.user.id,
    isRefundable: req.body.isRefundable === "true",
    price: req.body.price,
    offPrice: req.body.offPrice,
    stock: req.body.stock,
    itemModelNum: req.body.itemModelNum,
    serialNum: req.body.serialNum,
    connectionType: req.body.connectionType,
    hardwarePlatform: req.body.hardwarePlatform,
    os: req.body.os,
    powerConception: req.body.powerConception,
    batteries: req.body.batteries,
    packageDimension: req.body.packageDimension,
    portDescription: req.body.portDescription,
    connectivityType: req.body.connectivityType,
    compatibleDevices: req.body.compatibleDevices,
    powerSource: req.body.powerSource,
    specialFeatures: req.body.specialFeatures,
    includedInThePackage: req.body.includedInThePackage,
    manufacturer: req.body.manufacturer,
    itemSize: req.body.itemSize,
    itemWidth: req.body.itemWidth,
  });

  res.status(201).json({ 
    success: true, 
    product 
  });
  try {
    const adminEmail = process.env.ADMIN_EMAIL; // Ensure you have the admin email in your environment variables
    const creatorInfo = {
      email: req.user.email,
      name: req.user.name,
    };
    const emailContent = `
      <h2>New Product Added</h2>
      <p>Dear ${creatorInfo.name},</p>
      <p>Your product "${product.name}" has been added and is now pending approval.</p>
      <p>Thank you for using our platform!</p>
    `;

    // Send email to user
    await sendEmail({
      fromEmail: "donotreply@glocre.com",
      email: creatorInfo.email,
      subject: "New Product Added",
      html: emailContent,
    });

    // Send email to admin
    await sendEmail({
      fromEmail: "donotreply@glocre.com",
      email: adminEmail,
      subject: "New Product Added",
      html: `
        <h2>New Product Added</h2>
        <p>Dear Admin,</p>
        <p>The product "${product.name}" has been added by ${creatorInfo.name} and is now pending approval.</p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }
});
// Update a product (only if it belongs to the seller)
exports.updateSellerProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id).populate("createdBy");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const creatorInfo = {
    email: product.createdBy.email,
    name: product.createdBy.name,
  };

  let BASE_URL = process.env.BACKEND_URL;
  if (process.env.NODE_ENV === "production") {
    BASE_URL = `${req.protocol}://${req.get("host")}`;
  }

  // Handle images
  if (req.files && req.files.images) {
    req.body.images = req.files.images.map(
      (file) => `${BASE_URL}/uploads/product/${file.filename}`
    );
  }
  let updatedVariants = product.variants ? [...product.variants] : [];
  if (req.body.variants) {
    // Ensure variants is an array
    if (!Array.isArray(req.body.variants)) {
      req.body.variants = [req.body.variants];
    }

    req.body.variants.forEach((variant, index) => {
      if (product.variants[index]) {
        // Merge existing variant details with updated data
        updatedVariants[index] = { ...product.variants[index], ...variant };
      } else {
        // Add new variant
        updatedVariants[index] = variant;
      }
    });
  }
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      const match = key.match(/variants\[(\d+)\]\[images\]/);
      if (match) {
        const variantIndex = parseInt(match[1], 10);
        if (!Array.isArray(req.body.variants)) {
          req.body.variants = product.variants || [];
        }
        if (!req.body.variants[variantIndex]) {
          req.body.variants[variantIndex] = product.variants[variantIndex] || {};
        }
        req.body.variants[variantIndex].images = req.files[key].map(
          (file) => `${BASE_URL}/uploads/product/${file.filename}`
        );
      }
    });
  }

  req.body.variants = updatedVariants;

  // Merge req.body with existing product data
  const updatedData = {
    ...product.toObject(),
    ...req.body,
    status: "pending",
  };

  // Update product
  product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
  // Send email notification to admin and user about the product update
  try {
    const adminEmail = process.env.ADMIN_EMAIL; // Ensure you have the admin email in your environment variables
    const emailContent = `
      <h2>Product Update Notification</h2>
      <p>Dear ${creatorInfo.name},</p>
      <p>Your product "${product.name}" has been updated and is now pending approval.</p>
      <p>Thank you for using our platform!</p>
    `;

    // Send email to user
    await sendEmail({
      fromEmail: "donotreply@glocre.com",
      email: creatorInfo.email,
      subject: "Product Update Notification",
      html: emailContent,
    });

    // Send email to admin
    await sendEmail({
      fromEmail: "donotreply@glocre.com",
      email: adminEmail,
      subject: "Product Update Notification",
      html: `
        <h2>Product Update Notification</h2>
        <p>Dear Admin,</p>
        <p>The product "${product.name}" has been updated by ${creatorInfo.name} and is now pending approval.</p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
  }
});

// Get a product (only if it belongs to the seller)
exports.getSellerSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    // isArchived: false,
  })
    .populate("reviews.user", "name email")
    .populate("createdBy", "name");
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Clone a product - api/v1/product/clone/:id
exports.cloneProduct = catchAsyncError(async (req, res, next) => {
  // Find the product to be cloned
  const productToClone = await Product.findById(req.params.id);

  if (!productToClone) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  // Create a new product with the same details
  const clonedProduct = new Product({
    name: `${productToClone.name} (Copy)`,
    description: productToClone.description,
    maincategory: productToClone.maincategory,
    category: productToClone.category,
    subcategory: productToClone.subcategory,
    brand: productToClone.brand,
    condition: productToClone.condition,
    tax: productToClone.tax,
    keyPoints: productToClone.keyPoints,
    images: productToClone.images,
    variants: productToClone.variants,
    createdBy: req.user.id,
    isRefundable: productToClone.isRefundable,
    price: productToClone.price,
    offPrice: productToClone.offPrice,
    stock: productToClone.stock,
    itemModelNum: productToClone.itemModelNum,
    serialNum: productToClone.serialNum,
    connectionType: productToClone.connectionType,
    hardwarePlatform: productToClone.hardwarePlatform,
    os: productToClone.os,
    powerConception: productToClone.powerConception,
    batteries: productToClone.batteries,
    packageDimension: productToClone.packageDimension,
    portDescription: productToClone.portDescription,
    connectivityType: productToClone.connectivityType,
    compatibleDevices: productToClone.compatibleDevices,
    powerSource: productToClone.powerSource,
    specialFeatures: productToClone.specialFeatures,
    includedInThePackage: productToClone.includedInThePackage,
    manufacturer: productToClone.manufacturer,
    itemSize: productToClone.itemSize,
    itemWidth: productToClone.itemWidth,
    status: "pending", // Set status to pending for the cloned product
  });

  // Save the cloned product to the database
  await clonedProduct.save();

  res.status(201).json({
    success: true,
    product: clonedProduct,
  });
});
// Archive a product
exports.archiveProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product.isArchived = true;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Product archived successfully",
  });
});

// Unarchive a product
exports.unarchiveProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product.isArchived = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Product unarchived successfully",
  });
});