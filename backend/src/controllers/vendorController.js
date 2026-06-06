import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import {sendVendorWelcomeEmail} from '../services/emailServices.js';

// --- Register a New Vendor ---
export const registerVendor = async (req, res) => {
  const { companyName, contactName, email, gstNumber, category } = req.body;

  if (!companyName || !email || !contactName) {
    return res.status(400).json({ error: 'Company Name, Contact Name, and Email are required' });
  }

  try {
    // 1. Check for existing email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Vendor email already exists in the system.' });
    }

    // 2. Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: companyName, type: 'VENDOR', gstNumber },
      });

      const user = await tx.user.create({
        data: { orgId: org.id, name: contactName, email, passwordHash: hashedPassword, role: 'VENDOR' },
      });

      const vendor = await tx.vendor.create({
        data: { orgId: org.id, category },
      });

      return { org, user, vendor };
    });

    // 4. Send the Email (Get the Buyer's Org Name from req.user context)
    const buyerOrg = await prisma.organization.findUnique({ where: { id: req.user.orgId } });
    
    sendVendorWelcomeEmail(result.user.email, result.user.name, buyerOrg.name, tempPassword)
      .catch(err => console.error("Email failed:", err));

    console.log(`\n🔐 [MOCK LOG] Temp password for ${email} is: ${tempPassword}\n`);

    res.status(201).json({ 
      message: 'Vendor registered successfully',
      vendorId: result.vendor.id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register vendor' });
  }
};

// --- Get All Vendors ---
export const getVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        org: { select: { name: true, gstNumber: true, isActive: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedVendors = vendors.map(v => ({
      id: v.id,
      orgId: v.orgId,
      companyName: v.org.name,
      category: v.category,
      gstNumber: v.org.gstNumber,
      status: v.isActive ? 'Active' : 'Inactive'
    }));

    res.json(formattedVendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};