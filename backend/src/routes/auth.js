import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js'; // Ensure this points to your Prisma client instance
import { generateAccessToken, generateRefreshToken, setTokenCookies } from '../lib/tokens.js';
import { authenticate,authorizeRoles } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailServices.js';

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

    const { user, org } = result;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    setTokenCookies(res, accessToken, refreshToken);
    sendWelcomeEmail(user.email, user.name, user.role, org.name).catch(err => 
      console.error("Non-fatal error: Failed to send welcome email", err)
    );
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
  authorizeRoles('ADMIN'),
  async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Email already in use',
        });
      }

      // Get organization details
      const organization = await prisma.organization.findUnique({
        where: {
          id: req.user.orgId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!organization) {
        return res.status(404).json({
          error: 'Organization not found',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          orgId: organization.id,
          name,
          email,
          passwordHash: hashedPassword,
          role,
        },
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(
        newUser.email,
        newUser.name,
        newUser.role,
        organization.name
      ).catch((err) => {
        console.error(
          'Non-fatal error: Failed to send welcome email',
          err
        );
      });

      return res.status(201).json({
        message: 'Team member added successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          orgId: newUser.orgId,
        },
      });
    } catch (err) {
      console.error('Add member error:', err);

      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
);
// --- Forgot Password (Generate Link & Email) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security best practice: Always return generic success so attackers can't guess emails
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate a 15-minute reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Trigger the email service
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Reset Password (Submit New Password) ---
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    // 1. Verify token
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update DB
    await prisma.user.update({
      where: { id: payload.id },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired reset token' });
  }
});
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Remove the refresh token from the database
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Clear the HTTP-only cookies regardless of DB success
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }
});
export default router;