import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullName, email, phone, password } = req.body;

      if (!fullName || !email || !phone || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: fullName, email, phone, password.',
          },
        });
        return;
      }

      const user = await this.authService.register(fullName, email, phone, password);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || 'Failed to register user.',
        },
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: email, password.',
          },
        });
        return;
      }

      const result = await this.authService.login(email, password);

      // Assuming the AuthService returns an object containing the token and user info
      const token = (result as any).token || result; 
      const userData = (result as any).user || result;

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(200).json({
        success: true,
        data: userData,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error.message || 'Invalid credentials.',
        },
      });
    }
  };
}