import express from "express";
import { getDataFromFile, saveDataToFile } from "../services/dataService.js";
import idGenerator from "../services/idGenerator.js";
import bcrypt from "bcryptjs"; // Changed from bcrypt to bcryptjs
import jwt from "jsonwebtoken"; // For JWT generation
import authenticateToken from "../middleware/authentication.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

// Secret key for JWT (you can store it in environment variables for better security)
const JWT_SECRET = process.env.JWT_SECRET;

// POST route to create a new user (register)
router.post("/", async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    // Get existing users from the file
    let users = await getDataFromFile("user");

    if (!Array.isArray(users)) {
      users = [];
    }

    // Check if the email already exists in the users array
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      // If user with the same email exists, return an error message
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a new unique ID for the new user
    const id = idGenerator();

    const newUser = {
      id,
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    };

    // Save the new user to the users array
    users.push(newUser);
    await saveDataToFile("user", users);

    // Create a JWT token for the newly registered user
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: "1h", // Set the expiration time of the token (can be adjusted)
    });

    // Send response with the user data and the generated JWT token
    res.status(201).json({
      message: "User registered successfully",
      token, // Send the token to the client
      newUser,
    });
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// POST route to login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let users = await getDataFromFile("user");
    if (!Array.isArray(users)) {
      users = [];
    }

    // Find user by email
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token after successful login
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token, // Send token in response
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Protected route to get user profile (GET)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const users = await getDataFromFile("user");
    const user = users.find((user) => user.id === req.user.userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Protected route to update user profile (PUT)
router.put("/profile", authenticateToken, async (req, res) => {
  const { username, firstName, lastName, email, password } = req.body;

  try {
    let users = await getDataFromFile("user");
    const userIndex = users.findIndex((user) => user.id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's profile
    const updatedUser = {
      ...users[userIndex],
      username,
      firstName,
      lastName,
      email,
    };

    // If password is provided, hash it and update
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    // Save the updated user data
    users[userIndex] = updatedUser;
    await saveDataToFile("user", users);

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Protected route to delete user profile (DELETE)
router.delete("/profile", authenticateToken, async (req, res) => {
  try {
    let users = await getDataFromFile("user");
    const userIndex = users.findIndex((user) => user.id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the user from the array
    users.splice(userIndex, 1);
    await saveDataToFile("user", users);

    res.status(200).json({ message: "User profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profile" });
  }
});

export default router;
