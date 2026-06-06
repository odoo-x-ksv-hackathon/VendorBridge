import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import {sendVendorWelcomeEmail} from '../services/emailServices.js';

// --- Register a New Vendor ---
export const registerVendor = async (req, res) => {
  const { companyName, contactName, email, phone, gstNumber, category } = req.body;

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
        data: { name: companyName, type: 'VENDOR', gstNumber, phone },
      });

      const user = await tx.user.create({
        data: { orgId: org.id, name: contactName, email, passwordHash: hashedPassword, role: 'VENDOR' },
      });

      const vendor = await tx.vendor.create({
        data: { orgId: org.id, category, addedByOrgId: req.user.orgId },
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

// --- Get Vendor By ID (with all related data) ---
export const getVendorById = async (req, res) => {
  if (req.user.role === 'VENDOR') return res.status(403).json({ error: 'Access denied' });
  try {
    const vendor = await prisma.vendor.findFirst({
      where: { id: req.params.id, addedByOrgId: req.user.orgId },
      include: {
        org: {
          select: {
            name: true, gstNumber: true, phone: true, address: true,
            users: {
              where: { role: 'VENDOR' },
              select: { name: true, email: true, inviteStatus: true, lastLoginAt: true },
              take: 1,
            },
          },
        },
        rfqVendors: {
          include: {
            rfq: { select: { id: true, title: true, status: true, deadline: true, createdAt: true } },
          },
          orderBy: { invitedAt: 'desc' },
        },
        quotations: {
          select: {
            id: true, totalAmount: true, status: true, deliveryDays: true, submittedAt: true,
            rfq: { select: { title: true } },
            approvals: { select: { status: true, remarks: true, actionedAt: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
        purchaseOrders: {
          select: {
            id: true, poNumber: true, totalAmount: true, status: true, createdAt: true,
            invoice: { select: { invoiceNumber: true, totalAmount: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const user = vendor.org.users[0];
    let status = 'Active';
    if (!vendor.isActive) status = 'Blocked';
    else if (user?.inviteStatus === 'PENDING') status = 'Pending';

    res.json({
      id: vendor.id,
      companyName: vendor.org.name,
      contactName: user?.name ?? '',
      email: user?.email ?? '',
      contact: vendor.org.phone ?? '',
      gstNumber: vendor.org.gstNumber ?? '',
      address: vendor.org.address ?? '',
      category: vendor.category ?? '',
      rating: vendor.rating,
      since: new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      lastLogin: user?.lastLoginAt ?? null,
      status,
      rfqs: vendor.rfqVendors.map(r => ({
        id: r.rfq.id, title: r.rfq.title, status: r.rfq.status,
        deadline: r.rfq.deadline, inviteStatus: r.inviteStatus, invitedAt: r.invitedAt,
      })),
      quotations: vendor.quotations.map(q => ({
        id: q.id, rfqTitle: q.rfq.title, totalAmount: q.totalAmount,
        status: q.status, deliveryDays: q.deliveryDays, submittedAt: q.submittedAt,
        approvals: q.approvals,
      })),
      purchaseOrders: vendor.purchaseOrders.map(po => ({
        id: po.id, poNumber: po.poNumber, totalAmount: po.totalAmount,
        status: po.status, createdAt: po.createdAt, invoice: po.invoice,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
};

// --- Get All Vendors ---
export const getVendors = async (req, res) => {
  if (req.user.role === 'VENDOR') return res.status(403).json({ error: 'Access denied' });
  try {
    const vendors = await prisma.vendor.findMany({
      where: { addedByOrgId: req.user.orgId },
      include: {
        org: {
          select: {
            name: true,
            gstNumber: true,
            phone: true,
            users: {
              where: { role: 'VENDOR' },
              select: { email: true, inviteStatus: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedVendors = vendors.map(v => {
      const user = v.org.users[0];
      let status = 'Active';
      if (!v.isActive) status = 'Blocked';
      else if (user?.inviteStatus === 'PENDING') status = 'Pending';

      return {
        id: v.id,
        orgId: v.orgId,
        companyName: v.org.name,
        category: v.category ?? '',
        gstNumber: v.org.gstNumber ?? '',
        contact: v.org.phone ?? '',
        email: user?.email ?? '',
        since: new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status,
      };
    });

    res.json(formattedVendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};