import bcrypt from "bcrypt";
import db from "../db/db.Config";

// Define User types
interface User {
  id?: number;
  full_name?: string;
  email: string;
  password?: string; // Used when creating or authenticating
  created_at?: string;
}

interface AuthenticatedUserFromDB extends User {
  password_hash: string;
}

// Get all users (excluding password)
const getAllUsers = async (): Promise<User[]> => {
  try {
    const allUsers = await db.any<User>("SELECT * FROM users");
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
      "SELECT * FROM users WHERE id=$1",
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

    // Remove password_hash before returning user object
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
    //first check if user already exist
    const existingUser = await db.oneOrNone<User>(
      "SELECT * FROM users WHERE email=$1",
      [user.email]
    );
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(user.password!, 10);
    const createdUser = await db.one<User>(
      "INSERT INTO users (full_name, email, password_hash) VALUES($1, $2, $3) RETURNING *",
      [user.full_name, user.email, hashedPassword]
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
    const { full_name, email, password } = user;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const updatedUser = await db.oneOrNone<User>(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           password_hash = COALESCE($3, password_hash)
       WHERE id=$4 
       RETURNING *`,
      [full_name, email, hashedPassword, id]
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
      "DELETE FROM users WHERE id=$1 RETURNING *",
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
