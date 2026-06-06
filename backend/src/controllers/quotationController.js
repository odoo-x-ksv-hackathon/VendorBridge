import { prisma } from '../db.js';

// --- 1. Submit a New Quotation (Vendor) ---
export const submitQuotation = async (req, res) => {
  const { rfqId, deliveryDays, notes, items } = req.body;

  if (!rfqId || !items || !items.length) {
    return res.status(400).json({ error: 'rfqId and items array are required' });
  }

  try {
    const vendorProfile = await prisma.vendor.findUnique({
      where: { orgId: req.user.orgId }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found for this user' });
    }

    const rfqItems = await prisma.rfqItem.findMany({ where: { rfqId } });

    let totalAmount = 0;
    const quotationItemsData = [];

    for (const item of items) {
      const originalRfqItem = rfqItems.find(r => r.id === item.rfqItemId);
      if (!originalRfqItem) {
        return res.status(400).json({ 
          error: `Could not find an RFQ Item with the ID: ${item.rfqItemId}. Make sure you are using the rfqItemId, not the quotation item ID!` 
        });
      }

      const subtotal = Number(item.unitPrice) * Number(originalRfqItem.quantity);
      totalAmount += subtotal;

      quotationItemsData.push({
        rfqItemId: item.rfqItemId,
        unitPrice: Number(item.unitPrice),
        quantity: originalRfqItem.quantity,
        subtotal: subtotal
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          rfqId,
          vendorId: vendorProfile.id,
          submittedById: req.user.id,
          totalAmount,
          deliveryDays: Number(deliveryDays) || null,
          notes,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          items: { create: quotationItemsData }
        },
        include: { items: true }
      });

      await tx.rfqVendor.update({
        where: { rfqId_vendorId: { rfqId: rfqId, vendorId: vendorProfile.id } },
        data: { inviteStatus: 'RESPONDED', respondedAt: new Date() }
      });

      return quotation;
    });

    res.status(201).json({ message: 'Quotation submitted successfully', quotation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quotation' });
  }
};

// --- 2. Revise an Existing Quotation (Vendor Negotiation) ---
export const reviseQuotation = async (req, res) => {
  const { id } = req.params; 
  const { deliveryDays, notes, items } = req.body;

  try {
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingQuotation) return res.status(404).json({ error: 'Quotation not found' });
    
    if (existingQuotation.status === 'SELECTED') {
      return res.status(403).json({ error: 'Cannot revise a quotation that has already been awarded.' });
    }

    const rfqItems = await prisma.rfqItem.findMany({ where: { rfqId: existingQuotation.rfqId } });

    let totalAmount = 0;
    const updatePromises = [];

    for (const item of items) {
      const originalRfqItem = rfqItems.find(r => r.id === item.rfqItemId);
      if (!originalRfqItem) {
        return res.status(400).json({ 
          error: `Could not find an RFQ Item with the ID: ${item.rfqItemId}. Make sure you are using the rfqItemId, not the quotation item ID!` 
        });
      }

      const subtotal = Number(item.unitPrice) * Number(originalRfqItem.quantity);
      totalAmount += subtotal;

      const existingLineItem = existingQuotation.items.find(i => i.rfqItemId === item.rfqItemId);
      
      if (existingLineItem) {
        updatePromises.push(
          prisma.quotationItem.update({
            where: { id: existingLineItem.id },
            data: { unitPrice: Number(item.unitPrice), subtotal }
          })
        );
      }
    }

    await prisma.$transaction([
      ...updatePromises,
      prisma.quotation.update({
        where: { id },
        data: {
          totalAmount,
          deliveryDays: Number(deliveryDays) || existingQuotation.deliveryDays,
          notes,
          status: 'SUBMITTED', 
          updatedAt: new Date()
        }
      })
    ]);

    res.status(200).json({ message: 'Quotation revised successfully. Awaiting buyer review.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to revise quotation' });
  }
};

// --- 3. Get Quotations by RFQ (For Buyer Comparison) ---
export const getQuotationsByRfq = async (req, res) => {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { rfqId: req.params.rfqId },
      include: {
        vendor: { include: { org: { select: { name: true } } } },
        items: { include: { rfqItem: { select: { productName: true, unit: true } } } }
      },
      orderBy: { totalAmount: 'asc' } // Orders by lowest price first
    });

    res.json(quotations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};