import bcrypt from "bcrypt";
import db from "../db/db.Config";

// Define User types
interface User {
  id?: number;
  full_name?: string;
  email: string;
  password?: string;
  is_premium?: boolean;
  created_at?: string;
}

interface AuthenticatedUserFromDB extends User {
  password_hash: string;
}

// Get all users (excluding password)
const getAllUsers = async (): Promise<User[]> => {
  try {
    const allUsers = await db.any<User>("SELECT id, full_name, email, is_premium, created_at FROM users");
    return allUsers;
  } catch (err) {
    console.error("Error retrieving users", err);
    throw err;
  }
};

// Get one user by ID
const getOneUser = async (id: number): Promise<User | null> => {
  try {
    const oneUser = await db.one<User>(
      "SELECT id, full_name, email, is_premium, created_at FROM users WHERE id=$1",
      [id]
    );
    return oneUser;
  } catch (err) {
    console.error("Error retrieving one user", err);
    throw err;
  }
};

// Authenticate user by email and password
const authenticateUser = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const user = await db.oneOrNone<AuthenticatedUserFromDB>(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!user) throw new Error("Invalid email");

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) throw new Error("Invalid password");

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    console.error("Error during user authentication", err);
    throw err;
  }
};

// Create a new user
const createUser = async (user: User): Promise<User> => {
  try {
    const existingUser = await db.oneOrNone<User>(
      "SELECT id FROM users WHERE email=$1",
      [user.email]
    );
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(user.password!, 10);
    const createdUser = await db.one<User>(
      `INSERT INTO users (full_name, email, password_hash, is_premium) 
       VALUES($1, $2, $3, $4) 
       RETURNING id, full_name, email, is_premium, created_at`,
      [user.full_name, user.email, hashedPassword, user.is_premium ?? false]
    );
    return createdUser;
  } catch (err) {
    console.error("Error creating user", err);
    throw err;
  }
};

// Update user information
const updateUser = async (
  id: number,
  user: Partial<User>
): Promise<User | null> => {
  try {
    const { full_name, email, password, is_premium } = user;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const updatedUser = await db.oneOrNone<User>(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           password_hash = COALESCE($3, password_hash),
           is_premium = COALESCE($4, is_premium)
       WHERE id=$5 
       RETURNING id, full_name, email, is_premium, created_at`,
      [full_name, email, hashedPassword, is_premium, id]
    );
    return updatedUser;
  } catch (err) {
    console.error("Error updating user", err);
    throw err;
  }
};

// Delete user by ID
const deleteUser = async (id: number): Promise<User | null> => {
  try {
    const deletedUser = await db.oneOrNone<User>(
      "DELETE FROM users WHERE id=$1 RETURNING id, full_name, email, is_premium, created_at",
      [id]
    );
    return deletedUser;
  } catch (err) {
    console.error("Error deleting user", err);
    throw err;
  }
};

export {
  getAllUsers,
  getOneUser,
  authenticateUser,
  createUser,
  updateUser,
  deleteUser
};
