import bcrypt from "bcrypt";
import db from "../db/db.Config";

// Define types for user objects
interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  password?: string; // Now optional to avoid errors when deleting it
  role?: string;
}

interface AuthenticatedUserFromDB extends User {
  password: string; // Required only when fetched from the DB for authentication
}

// Get all users
const getAllUser = async (): Promise<User[]> => {
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
    const oneUser = await db.one<User>("SELECT * FROM users WHERE id=$1", [id]);
    return oneUser;
  } catch (err) {
    console.error("Error retrieving one user", err);
    throw err;
  }
};

// Authenticate user by username and password
const authenticateUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const user = await db.oneOrNone<AuthenticatedUserFromDB>(
      "SELECT * FROM users WHERE username=$1", 
      [username]
    );

    if (!user) throw new Error("Invalid username");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Invalid password");

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err) {
    console.error("Error during user authentication", err);
    throw err;
  }
};

// Update user
const updateUser = async (
  id: number,
  user: Partial<User> // Allows updating some fields only
): Promise<User | null> => {
  try {
    const { name, username, email, password, role } = user;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const updatedUser = await db.oneOrNone<User>(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           username = COALESCE($2, username), 
           email = COALESCE($3, email), 
           password = COALESCE($4, password), 
           role = COALESCE($5, role) 
       WHERE id=$6 
       RETURNING *`,
      [name, username, email, hashedPassword, role, id]
    );

    return updatedUser;
  } catch (err) {
    console.error("Error updating user", err);
    throw err;
  }
};
