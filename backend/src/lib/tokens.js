import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email , role: user.role,orgId: user.orgId}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });

export const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
