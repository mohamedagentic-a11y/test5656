import { query } from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  private static getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is missing.');
    }
    return secret;
  }

  public static async register(fullName: string, email: string, phone: string, passwordRaw: string) {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordRaw, saltRounds);

    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, full_name, email, role`,
      [fullName, email, phone, passwordHash, 'MEMBER']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      this.getJwtSecret(),
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  public static async login(email: string, passwordRaw: string) {
    const result = await query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isValid = await bcrypt.compare(passwordRaw, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      this.getJwtSecret(),
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}