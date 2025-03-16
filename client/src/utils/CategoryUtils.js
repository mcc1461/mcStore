// src/utils/categoryUtils.js

// A helper function to safely parse numbers from values.
export function parseNumber(value) {
  if (typeof value === "string") {
    let cleaned = value.replace(/[^0-9,.\-]/g, "");
    if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      cleaned = cleaned.replace(/\./g, "");
    } else if (cleaned.includes(",") && cleaned.includes(".")) {
      cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
    } else if (cleaned.includes(",")) {
      cleaned = cleaned.replace(/,/g, ".");
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return Number(value) || 0;
}

// Helper function to get a product's category name.
export function getProductCategoryName(prod) {
  if (
    prod.categoryId &&
    typeof prod.categoryId === "object" &&
    prod.categoryId.name
  ) {
    return prod.categoryId.name;
  } else if (prod.category) {
    return prod.category;
  }
  return "Unknown Category";
}

// Helper function to get a product's name from an array by its _id.
export function getProductName(products, productId) {
  const found = products.find((p) => p._id === productId);
  return found ? found.name : "Unknown Product";
}

// Helper function to get a user's display name from an array by its _id.
export function getUserName(users, userId) {
  if (!userId) return "Unknown Person";
  const found = users.find((u) => u._id === userId);
  if (!found) return "Unknown Person";
  if (found.firstName || found.lastName) {
    return (
      `${found.firstName || ""} ${found.lastName || ""}`.trim() ||
      found.username
    );
  }
  return found.username || "Unknown Person";
}

// Compute category summary from products, purchases, sells, and users.
export function computeCategorySummary(
  categoryName,
  products,
  purchases,
  sells,
  users
) {
  // 1) Filter products in the given category.
  const filteredProducts = products.filter(
    (prod) => getProductCategoryName(prod) === categoryName
  );
  const productCount = filteredProducts.length;
  const filteredProductIds = filteredProducts.map((p) => p._id);

  // 2) Filter purchases and sells for these products.
  const categoryPurchases = purchases.filter((p) =>
    filteredProductIds.includes(p.productId)
  );
  const categorySells = sells.filter((s) =>
    filteredProductIds.includes(s.productId)
  );

  // 3) Calculate totals for reference.
  const totalMoneySpent = categoryPurchases.reduce(
    (sum, p) => sum + parseNumber(p.purchasePrice) * parseNumber(p.quantity),
    0
  );
  const totalMoneyGained = categorySells.reduce(
    (sum, s) => sum + parseNumber(s.sellPrice) * parseNumber(s.quantity),
    0
  );

  // 4) Top sold product.
  const productSoldMap = {};
  categorySells.forEach((s) => {
    productSoldMap[s.productId] =
      (productSoldMap[s.productId] || 0) + parseNumber(s.quantity);
  });
  let topSoldId = null;
  let topSoldCount = 0;
  Object.entries(productSoldMap).forEach(([pid, qty]) => {
    if (qty > topSoldCount) {
      topSoldCount = qty;
      topSoldId = pid;
    }
  });
  const topSoldProduct = topSoldId
    ? { name: getProductName(products, topSoldId), soldCount: topSoldCount }
    : null;

  // 5) Top purchased product.
  const productPurchasedMap = {};
  categoryPurchases.forEach((p) => {
    productPurchasedMap[p.productId] =
      (productPurchasedMap[p.productId] || 0) + parseNumber(p.quantity);
  });
  let topPurchasedId = null;
  let topPurchasedCount = 0;
  Object.entries(productPurchasedMap).forEach(([pid, qty]) => {
    if (qty > topPurchasedCount) {
      topPurchasedCount = qty;
      topPurchasedId = pid;
    }
  });
  const topPurchasedProduct = topPurchasedId
    ? {
        name: getProductName(products, topPurchasedId),
        purchaseCount: topPurchasedCount,
      }
    : null;

  // 6) Top 3 most profitable products (by individual product profit)
  const profitableProducts = filteredProducts.map((prod) => {
    const sellingPrice = parseNumber(prod.price);
    // Get all purchase records for the product.
    const prodPurchases = categoryPurchases.filter(
      (p) => p.productId === prod._id
    );
    const totalPurchaseQuantity = prodPurchases.reduce(
      (sum, p) => sum + parseNumber(p.quantity),
      0
    );
    const totalPurchaseCost = prodPurchases.reduce(
      (sum, p) => sum + parseNumber(p.purchasePrice) * parseNumber(p.quantity),
      0
    );
    // Calculate effective cost:
    // If purchase records exist, use the average purchase cost;
    // otherwise, fallback to 75% of the product's selling (market) price.
    const effectiveCost =
      totalPurchaseQuantity > 0
        ? totalPurchaseCost / totalPurchaseQuantity
        : sellingPrice * 0.75;
    // Get total quantity sold for the product.
    const prodSells = categorySells.filter((s) => s.productId === prod._id);
    const totalSold = prodSells.reduce(
      (sum, s) => sum + parseNumber(s.quantity),
      0
    );
    // Product profit as (sellingPrice - effectiveCost) * totalSold.
    const productProfit = (sellingPrice - effectiveCost) * totalSold;
    return { name: prod.name, profit: productProfit };
  });
  profitableProducts.sort((a, b) => b.profit - a.profit);
  const top3Profitable = profitableProducts.slice(0, 3);

  // 7) Big Buyer.
  const buyerMap = {};
  categoryPurchases.forEach((p) => {
    const buyerId = p.buyerId && (p.buyerId._id || p.buyerId);
    if (!buyerId) return;
    buyerMap[buyerId] =
      (buyerMap[buyerId] || 0) +
      parseNumber(p.purchasePrice) * parseNumber(p.quantity);
  });
  let bigBuyerId = null;
  let bigBuyerSpent = 0;
  Object.entries(buyerMap).forEach(([bid, spent]) => {
    if (spent > bigBuyerSpent) {
      bigBuyerSpent = spent;
      bigBuyerId = bid;
    }
  });
  const bigBuyer = bigBuyerId
    ? { name: getUserName(users, bigBuyerId), totalSpent: bigBuyerSpent }
    : null;

  // 8) Big Seller.
  const sellerMap = {};
  categorySells.forEach((s) => {
    const sellerId = s.sellerId && (s.sellerId._id || s.sellerId);
    if (!sellerId) return;
    sellerMap[sellerId] =
      (sellerMap[sellerId] || 0) +
      parseNumber(s.sellPrice) * parseNumber(s.quantity);
  });
  let bigSellerId = null;
  let bigSellerAmount = 0;
  Object.entries(sellerMap).forEach(([sid, sold]) => {
    if (sold > bigSellerAmount) {
      bigSellerAmount = sold;
      bigSellerId = sid;
    }
  });
  const bigSeller = bigSellerId
    ? { name: getUserName(users, bigSellerId), totalSold: bigSellerAmount }
    : null;

  // 9) Revised profit calculation: Total profit as sum of individual product profits.
  let totalProfit = 0;
  filteredProducts.forEach((prod) => {
    const sellingPrice = parseNumber(prod.price);
    const prodPurchases = categoryPurchases.filter(
      (p) => p.productId === prod._id
    );
    const totalPurchaseQuantity = prodPurchases.reduce(
      (sum, p) => sum + parseNumber(p.quantity),
      0
    );
    const totalPurchaseCost = prodPurchases.reduce(
      (sum, p) => sum + parseNumber(p.purchasePrice) * parseNumber(p.quantity),
      0
    );
    // Calculate effective cost using the fallback if no purchase records exist.
    const effectiveCost =
      totalPurchaseQuantity > 0
        ? totalPurchaseCost / totalPurchaseQuantity
        : sellingPrice * 0.75;
    const prodSells = categorySells.filter((s) => s.productId === prod._id);
    const totalSold = prodSells.reduce(
      (sum, s) => sum + parseNumber(s.quantity),
      0
    );
    const productProfit = (sellingPrice - effectiveCost) * totalSold;
    totalProfit += productProfit;
  });

  return {
    productCount,
    totalMoneySpent,
    totalMoneyGained,
    profit: totalProfit, // Total profit across all products in the category.
    topSoldProduct,
    topPurchasedProduct,
    profitableProducts: top3Profitable,
    bigBuyer,
    bigSeller,
  };
}
