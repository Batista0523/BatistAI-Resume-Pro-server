import express, { Request, Response } from "express";
import {
  getAllUsers,
  getOneUser,
  authenticateUser,
  createUser,
  updateUser,
  deleteUser
} from "../queries/user";

const User = express.Router();

// Login route
User.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const authenticatedUser = await authenticateUser(username, password);
    res.status(200).json({ success: true, payload: authenticatedUser });
  } catch (err) {
    console.error("Error logging user", err);
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Get all users
User.get("/", async (_req: Request, res: Response) => {
  try {
    const allUsers = await getAllUsers();
    res.status(200).json({ success: true, payload: allUsers });
  } catch (err) {
    console.error("Error getting users", err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// Get one user by ID
User.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const oneUser = await getOneUser(Number(id));
    if (oneUser) {
      res.status(200).json({ success: true, payload: oneUser });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error("Error getting one user", err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// Create user
User.post("/", async (req: Request, res: Response) => {
  try {
    const createdUser = await createUser(req.body);
    res.status(201).json({ success: true, payload: createdUser });
  } catch (err: any) {
    console.error("Error creating user", err);
    res.status(400).json({ success: false, error: err.message || "Create error" });
  }
});

// Update user
User.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedUser = await updateUser(Number(id), req.body);
    if (updatedUser) {
      res.status(200).json({ success: true, payload: updatedUser });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error("Error updating user", err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// Delete user
User.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedUser = await deleteUser(Number(id));
    if (deletedUser) {
      res.status(200).json({ success: true, payload: deletedUser });
    } else {
      res.status(404).json({ success: false, error: "User not found" });
    }
  } catch (err) {
    console.error("Error deleting user", err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

export default User;
