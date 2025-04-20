import express from "express";
import { getDataFromFile, saveDataToFile } from "../services/dataService.js";
import idGenerator from "../services/idGenerator.js";

const router = express.Router();

// 🟢 CREATE a new market
router.post("/", async (req, res) => {
  try {
    const {
      region,
      town,
      marketName,
      products = [],
      password,
      status,
      address,
    } = req.body;

    let markets = await getDataFromFile("market");
    const id = idGenerator();

    const newMarket = {
      id,
      region,
      town,
      marketName,
      products,
      password,
      status,
      address,
    };
    markets.push(newMarket);
    await saveDataToFile("market", markets);

    res.status(201).json(newMarket);
  } catch (error) {
    res.status(500).json({ message: "Error creating market", error });
  }
});

// 🟢 GET all markets
router.get("/", async (req, res) => {
  try {
    const markets = await getDataFromFile("market");
    console.log(markets);
    res.json(markets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching markets", error });
  }
});

// 🟢 GET a specific market by ID
router.get("/:id", async (req, res) => {
  try {
    const markets = await getDataFromFile("market");
    const market = markets.find((market) => market.id == req.params.id);
    if (!market) return res.status(404).json({ message: "Market not found" });

    res.json(market);
  } catch (error) {
    res.status(500).json({ message: "Error fetching market", error });
  }
});

// 🟢 UPDATE a market
router.put("/:id", async (req, res) => {
  try {
    const { region, town, marketName, products, password, status, address } =
      req.body;

    let markets = await getDataFromFile("market");
    const market = markets.find((market) => market.id === req.params.id);
    if (!market) return res.status(404).json({ message: "Market not found" });

    if (region) market.region = region;
    if (town) market.town = town;
    if (marketName) market.marketName = marketName;
    if (products) market.products = products;
    if (password) market.password = password;
    if (status) market.status = status;
    if (address) market.address = address;

    await saveDataToFile("market", markets);
    res.json(market);
  } catch (error) {
    res.status(500).json({ message: "Error updating market", error });
  }
});

// 🟢 DELETE a market
router.delete("/:id", async (req, res) => {
  try {
    let markets = await getDataFromFile("market");
    const marketIndex = markets.findIndex(
      (market) => market.id === req.params.id
    );
    if (marketIndex === -1)
      return res.status(404).json({ message: "Market not found" });

    markets.splice(marketIndex, 1);
    await saveDataToFile("market", markets);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting market", error });
  }
});
export default router;
