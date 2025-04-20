import express from "express";
import { getDataFromFile, saveDataToFile } from "../services/dataService.js";
import idGenerator from "../services/idGenerator.js";

const router = express.Router();

router.post("/:id/products", async (req, res) => {
  try {
    const products = req.body; // Expecting an array of products

    // Validate input data (check if products is an array and non-empty)
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    let markets = await getDataFromFile("market");
    const market = markets.find((market) => {
      return market.id == req.params.id;
    });
    // If market doesn't exist, return a 404 error
    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    const processedProducts = products.map((newProduct) => {
      const existingProduct = market.products.find((product) => {
        return (
          product.name.toLowerCase() ===
          newProduct["Product Name"].toLowerCase()
        );
      });

      if (existingProduct) {
        // If product exists, update quantity
        existingProduct.quantity += newProduct.Quantity;
        return existingProduct;
      } else {
        const newProductData = {
          id: idGenerator(),
          name: newProduct["Product Name"],
          quantity: newProduct.Quantity,
          expireDate: newProduct["Expiry Date"],
          normalPrice: newProduct["Regular Price"],
          salePrice: newProduct["Sale Price"],
          placeAtStore: newProduct["Place at Store"],
        };
        market.products.push(newProductData);
        return newProductData;
      }
    });

    // Filter out any products that had validation errors
    const validProducts = processedProducts.filter((product) => !product.error);

    // Save updated markets data back to file
    await saveDataToFile("market", markets);

    // Respond with success message and valid products
    res.status(201).json({
      message: "Products added/updated successfully",
      products: validProducts,
    });
  } catch (error) {
    // If an error occurs, return a generic error message
    console.error("Error adding products:", error);
    res.status(500).json({ message: "Error adding products", error });
  }
});

//Get Products
router.get("/:id/products", async (req, res) => {
  try {
    const markets = await getDataFromFile("market");
    const market = markets.find((market) => market.id == req.params.id);
    if (!market) return res.status(404).json({ message: "Market not found" });
    res.json(market.products || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching market", error });
  }
});

// 🟢 UPDATE an existing product in a market
router.put("/:id/products/:productId", async (req, res) => {
  try {
    const { name, quantity, expireDate, normalPrice, salePrice, image } =
      req.body;

    let markets = await getDataFromFile("market");
    const market = markets.find((market) => market.id == req.params.id);
    if (!market) return res.status(404).json({ message: "Market not found" });

    const product = market.products.find((p) => p.id == req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (quantity) product.quantity = quantity;
    if (expireDate) product.expireDate = expireDate;
    if (normalPrice) product.normalPrice = normalPrice;
    if (salePrice) product.salePrice = salePrice;
    if (image) product.image = image;

    await saveDataToFile("market", markets);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
});

router.delete("/:marketId/products/:productId", async (req, res) => {
  try {
    const { marketId, productId } = req.params;

    let markets = await getDataFromFile("market");
    const market = markets.find((market) => market.id == marketId);

    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    // Find the product index within the market
    const productIndex = market.products.findIndex(
      (product) => product.id == productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the product from the array
    market.products.splice(productIndex, 1);
    await saveDataToFile("market", markets);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});

export default router;
