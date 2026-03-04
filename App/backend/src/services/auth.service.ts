import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { AppError } from '../middleware/error.middleware';

/**
 * Generate a JWT token for a user
 * @param userId The ID of the user
 * @returns The generated token
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

/**
 * Register a new user
 * @param data The user registration data
 * @returns The registered user and token
 */
export const register = async (data: any) => {
  const { email, password, name } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Login a user
 * @param data The user login data
 * @returns The user and token
 */
export const login = async (data: any) => {
  const { email, password } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id);

  // Prepare response user data
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };

  return { user: userData, token };
};
