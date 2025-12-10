import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    [key: string]: any; // Allow other claims
}

/**
 * Sign a JWT token with the provided payload
 */
export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload as unknown as JWTPayload;
    } catch (error) {
        // console.error('JWT verification failed:', error); // Squelch in middleware to avoid noise
        return null;
    }
}
