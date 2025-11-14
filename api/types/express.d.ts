import { User } from '../types/auth.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}