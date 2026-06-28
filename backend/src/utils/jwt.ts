import jwt from 'jsonwebtoken';

const getAccessSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  }
  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is missing.');
  }
  return secret;
};

const getAccessExpiry = (): string => {
  return process.env.ACCESS_TOKEN_EXPIRY || '15m';
};

const getRefreshExpiry = (): string => {
  return process.env.REFRESH_TOKEN_EXPIRY || '30d';
};

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, getAccessSecret(), {
    expiresIn: getAccessExpiry() as any
  });
}

export function generateRefreshToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, getRefreshSecret(), {
    expiresIn: getRefreshExpiry() as any
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, getAccessSecret()) as any;
    if (!payload.userId || !payload.email) {
      throw new Error('INVALID_PAYLOAD: Token payload is missing userId or email.');
    }
    return { userId: payload.userId, email: payload.email };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED: The access token has expired.');
    }
    throw new Error('INVALID_TOKEN: Failed to verify access token.');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, getRefreshSecret()) as any;
    if (!payload.userId || !payload.email) {
      throw new Error('INVALID_PAYLOAD: Token payload is missing userId or email.');
    }
    return { userId: payload.userId, email: payload.email };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED: The refresh token has expired.');
    }
    throw new Error('INVALID_TOKEN: Failed to verify refresh token.');
  }
}
