import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware called');
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Extracted token:', token ? '(token present)' : 'null');

    if (!token) {
      console.log('No token provided');
      throw new Error('No token provided');
    }

    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    console.log('Token verified successfully, user:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Please authenticate.' });
  }
}; 