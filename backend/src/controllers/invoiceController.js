import { prisma } from '../db.js';
import { sendInvoiceEmail } from '../services/emailServices.js';

// --- 1. Generate Invoice from PO ---
export const generateInvoice = async (req, res) => {
  const { poId } = req.body;

  if (!poId) return res.status(400).json({ error: 'poId is required' });

  try {
    // 1. Fetch the Purchase Order and include relationship data for the email
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        vendor: { include: { org: true } }
      }
    });

    if (!po) return res.status(404).json({ error: 'Purchase Order not found' });

    // 2. Check if Invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { poId }
    });
    
    if (existingInvoice) {
      return res.status(409).json({ error: 'An Invoice has already been generated for this PO' });
    }

    // 3. Generate a unique Invoice Number (e.g., INV-20260606-X9Y8)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomHash}`;

    // 4. Find the Vendor's email address to send the invoice to
    const vendorAdmin = await prisma.user.findFirst({
      where: { orgId: po.vendor.orgId, role: 'VENDOR' }
    });

    // 5. Database Transaction: Create the Invoice
    const invoice = await prisma.invoice.create({
      data: {
        poId,
        invoiceNumber,
        subtotal: po.subtotal,
        taxAmount: po.taxAmount,
        totalAmount: po.totalAmount,
        status: 'ISSUED',
        emailed: !!vendorAdmin, // True if we found an email to send it to
        emailSentTo: vendorAdmin ? vendorAdmin.email : null,
        emailedAt: vendorAdmin ? new Date() : null
      }
    });

    // 6. Send the Email
    if (vendorAdmin) {
      sendInvoiceEmail(vendorAdmin.email, invoiceNumber, po.poNumber, Number(po.totalAmount))
        .catch(err => console.error("Non-fatal: Failed to send invoice email", err));
    }

    res.status(201).json({
      message: 'Invoice generated and emailed successfully',
      invoice
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate Invoice' });
  }
};

// --- 2. Get All Invoices (Dashboard) ---
export const getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.user.role === 'VENDOR') {
      // Vendors only see Invoices linked to their POs
      const vendorProfile = await prisma.vendor.findUnique({ where: { orgId: req.user.orgId } });
      if (!vendorProfile) return res.status(404).json({ error: 'Vendor profile not found' });

      invoices = await prisma.invoice.findMany({
        where: { po: { vendorId: vendorProfile.id } },
        include: { po: { select: { poNumber: true } } },
        orderBy: { generatedAt: 'desc' }
      });
    } else {
      // Buyers see all Invoices for their organization
      invoices = await prisma.invoice.findMany({
        where: { po: { orgId: req.user.orgId } },
        include: { 
          po: { 
            select: { 
              poNumber: true, 
              vendor: { include: { org: { select: { name: true } } } } 
            } 
          } 
        },
        orderBy: { generatedAt: 'desc' }
      });
    }

    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Invoices' });
  }
};