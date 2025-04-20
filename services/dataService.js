import { promises as fs } from "fs";

const paths = {
  user: "./data/user.json",
  market: "./data/markets.json",
};

// Function to read data from the file
export const getDataFromFile = async (key) => {
  const pathToUse = paths[key];
  if (!pathToUse) {
    console.error(`Invalid key provided: ${key}`);
    return [];
  }

  try {
    const data = await fs.readFile(pathToUse, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file doesn't exist, create an empty file and return an empty array
      await fs.writeFile(pathToUse, JSON.stringify([], null, 2));
      return [];
    }
    console.error("Error reading data from file:", error);
    return [];
  }
};

// Function to save data to the file
export const saveDataToFile = async (key, data) => {
  const pathToUse = paths[key];
  if (!pathToUse) {
    console.error(`Invalid key provided: ${key}`);
    return;
  }

  if (!Array.isArray(data)) {
    console.error("Error: Data must be an array before saving.");
    return;
  }

  try {
    await fs.writeFile(pathToUse, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving data to file:", error);
  }
};
