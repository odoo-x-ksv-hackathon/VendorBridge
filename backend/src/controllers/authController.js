import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, setTokenCookies } from '../lib/token.js';
const prisma = new PrismaClient();

// --- 1. Register Organization & Initial User ---
export const registerOrganization = async (req, res) => {
  const { orgName, type, gstNumber, userName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure everything creates successfully
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Organization
      const org = await tx.organization.create({
        data: { name: orgName, type, gstNumber },
      });

      // 2. Determine initial role based on OrgType
      const role = type === 'VENDOR' ? 'VENDOR' : 'ADMIN';

      // 3. Create the User linked to the Org
      const user = await tx.user.create({
        data: {
          orgId: org.id,
          name: userName,
          email,
          passwordHash: hashedPassword,
          role,
        },
      });

      // 4. If it's a vendor org, immediately create their Vendor profile
      if (type === 'VENDOR') {
        await tx.vendor.create({ data: { orgId: org.id } });
      }

      return { org, user };
    });

    res.status(201).json({ message: 'Organization created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register organization' });
  }
};

// --- 2. Login Flow ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token, update last login, and mark invite as accepted on first login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
        ...(user.inviteStatus === 'PENDING' && { inviteStatus: 'ACCEPTED' }),
      },
    });

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role, orgId: user.orgId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};