import { prisma } from '../db.js';
import { sendRfqInvitationEmail } from '../services/emailServices.js';

// --- 1. Create a New RFQ ---
export const createRfq = async (req, res) => {
  const { title, description, deadline, items, vendorIds } = req.body;

  const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
  const parsedVendorIds = typeof vendorIds === 'string' ? JSON.parse(vendorIds) : (vendorIds ?? []);

  if (!title || !deadline || !parsedItems?.length) {
    return res.status(400).json({ error: 'Title, deadline, and at least one item are required' });
  }

  try {
    const rfq = await prisma.rfq.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        orgId: req.user.orgId,
        createdById: req.user.id,
        status: 'OPEN',
        items: {
          create: parsedItems.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            notes: item.notes,
          }))
        },
        vendors: parsedVendorIds.length > 0 ? {
          create: parsedVendorIds.map(vId => ({ vendorId: vId, inviteStatus: 'INVITED' }))
        } : undefined,
        attachments: req.files?.length > 0 ? {
          create: req.files.map(file => ({
            fileUrl: file.path,
            filename: file.originalname,
          }))
        } : undefined,
      },
      include: {
        items: true,
        attachments: true,
        vendors: { include: { vendor: { include: { org: true } } } },
        org: true,
      }
    });

    if (rfq.vendors?.length > 0) {
      rfq.vendors.forEach(async (rfqVendor) => {
        try {
          const vendorAdmin = await prisma.user.findFirst({
            where: { orgId: rfqVendor.vendor.orgId, role: 'VENDOR' }
          });
          if (vendorAdmin) {
            await sendRfqInvitationEmail(vendorAdmin.email, rfq.title, rfq.deadline, rfq.org.name);
          }
        } catch (emailErr) {
          console.error('Non-fatal: Failed to send RFQ email', emailErr);
        }
      });
    }

    res.status(201).json({ message: 'RFQ Created Successfully', rfq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
};

// --- 2. Get All RFQs (Dashboard List) ---
export const getRfqs = async (req, res) => {
  try {
    let rfqs;

    if (req.user.role === 'VENDOR') {
      // Vendors only see RFQs they were explicitly invited to
      const vendorProfile = await prisma.vendor.findUnique({
        where: { orgId: req.user.orgId }
      });

      if (!vendorProfile) return res.status(404).json({ error: 'Vendor profile not found' });

      rfqs = await prisma.rfq.findMany({
        where: {
          vendors: { some: { vendorId: vendorProfile.id } },
          status: { in: ['OPEN', 'CLOSED'] } 
        },
        include: {
          org: { select: { name: true } }, // Shows who the buyer is
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Buyers see all RFQs belonging to their Organization
      rfqs = await prisma.rfq.findMany({
        where: { orgId: req.user.orgId },
        include: {
          _count: { select: { items: true, vendors: true, quotations: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(rfqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

// --- 3. Get Single RFQ Details ---
export const getRfqById = async (req, res) => {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        attachments: true,
        vendors: {
          include: {
            vendor: { include: { org: { select: { name: true } } } }
          }
        },
        org: { select: { name: true, address: true } }
      }
    });

    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    res.json(rfq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch RFQ details' });
  }
};