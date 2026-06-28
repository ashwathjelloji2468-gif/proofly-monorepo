import { Response, CookieOptions } from 'express';

const getCookieDomain = (): string | undefined => {
  const domain = process.env.COOKIE_DOMAIN;
  if (!domain || domain === 'localhost') {
    return undefined;
  }
  return domain;
};

const getBaseCookieOptions = (maxAgeMs: number): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // Only true in production HTTPS
    sameSite: isProd ? 'none' : 'lax', // Use 'none' for cross-domain cookies in prod, otherwise 'lax'
    domain: getCookieDomain(),
    maxAge: maxAgeMs
  };
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  // Access Token: 15 minutes
  const accessTokenMaxAge = 15 * 60 * 1000;
  // Refresh Token: 30 days
  const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;

  res.cookie('access_token', accessToken, getBaseCookieOptions(accessTokenMaxAge));
  res.cookie('refresh_token', refreshToken, getBaseCookieOptions(refreshTokenMaxAge));
}

export function clearAuthCookies(res: Response) {
  const baseOptions = getBaseCookieOptions(0);
  
  res.clearCookie('access_token', baseOptions);
  res.clearCookie('refresh_token', baseOptions);
}
