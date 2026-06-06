import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js'; // Ensure this points to your Prisma client instance
import { generateAccessToken, generateRefreshToken, setTokenCookies } from '../lib/tokens.js';
import { authenticate,authorizeRoles } from '../middleware/auth.js';

const router = Router();

// --- 1. Register Organization & Initial User ---
router.post('/register', async (req, res) => {
  const { orgName, type, gstNumber, userName, email, password } = req.body;

  if (!email || !password || !orgName || !type || !userName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction ensures both Org and User are created, or neither are
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: orgName, type, gstNumber },
      });

      const role = type === 'VENDOR' ? 'VENDOR' : 'ADMIN';

      const user = await tx.user.create({
        data: {
          orgId: org.id,
          name: userName,
          email,
          passwordHash: hashedPassword, // Updated to match schema
          role,
        },
      });

      if (type === 'VENDOR') {
        await tx.vendor.create({ data: { orgId: org.id } });
      }

      return { org, user };
    });

    const { user } = result;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      orgId: user.orgId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 2. Login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Check if user exists and is active
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    // Compare with passwordHash
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken,
        lastLoginAt: new Date() 
      },
    });

    setTokenCookies(res, accessToken, refreshToken);
    res.json({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      orgId: user.orgId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 3. Refresh Token ---
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || user.refreshToken !== token)
      return res.status(401).json({ error: 'Invalid refresh token' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    setTokenCookies(res, accessToken, refreshToken);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// --- 4. Logout ---
router.post('/logout', authenticate, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  }
});

// --- 5. Get Current User (Me) ---
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        name: true,
        email: true, 
        role: true, 
        orgId: true,
        isActive: true,
        org: {
          select: {
            name: true,
            type: true
          }
        }
      },
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post(
  '/add-member',
  authenticate,
  authorizeRoles('ADMIN'), // Only Admins can do this
  async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(409).json({ error: 'Email already in use' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          orgId: req.user.orgId, // Automatically link to the Admin's Organization
          name,
          email,
          passwordHash: hashedPassword,
          role, // e.g., 'PROCUREMENT_OFFICER' or 'MANAGER'
        },
      });

      res.status(201).json({ 
        message: 'Team member added successfully',
        user: { id: newUser.id, email: newUser.email, role: newUser.role }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
export default router;