import jwt from 'jsonwebtoken';

export interface LoginPayload extends jwt.JwtPayload {
    user: {
        id: number;
    }
}
