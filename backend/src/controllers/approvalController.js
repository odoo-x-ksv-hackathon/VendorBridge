import { prisma } from '../db.js';
import { sendQuotationStatusEmail } from '../services/emailServices.js';

export const processApproval = async (req, res) => {
  const { quotationId, status, remarks } = req.body;

  // status must be 'APPROVED' or 'REJECTED'
  if (!quotationId || !status) {
    return res.status(400).json({ error: 'quotationId and status are required' });
  }

  try {
    // 1. Fetch the quotation to ensure it exists and get relationship data for emails
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        vendor: { include: { org: true } },
        rfq: true,
      }
    });

    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

    // 2. Database Transaction: Process the decision securely
    const result = await prisma.$transaction(async (tx) => {
      // Create the official Approval Audit Record
      const approval = await tx.approval.create({
        data: {
          quotationId,
          approverId: req.user.id,
          status, // 'APPROVED' or 'REJECTED'
          remarks,
          actionedAt: new Date()
        }
      });

      // Update the Quotation status
      const updatedQuotationStatus = status === 'APPROVED' ? 'SELECTED' : 'REJECTED';
      await tx.quotation.update({
        where: { id: quotationId },
        data: { 
          status: updatedQuotationStatus,
          isSelected: status === 'APPROVED' 
        }
      });

      // If Approved, lock down the RFQ so no one else can win it
      if (status === 'APPROVED') {
        await tx.rfq.update({
          where: { id: quotation.rfqId },
          data: { status: 'CLOSED' }
        });
      }

      return approval;
    });

    // 3. Email the Vendor with the result
    const vendorAdmin = await prisma.user.findFirst({
      where: { orgId: quotation.vendor.orgId, role: 'VENDOR' }
    });

    if (vendorAdmin) {
      sendQuotationStatusEmail(vendorAdmin.email, quotation.rfq.title, status, remarks)
        .catch(err => console.error("Non-fatal: Failed to send status email", err));
    }

    res.status(200).json({ message: `Quotation ${status.toLowerCase()} successfully`, approval: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process approval' });
  }
};