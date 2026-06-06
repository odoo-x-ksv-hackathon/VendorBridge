import { prisma } from '../db.js';

// Aggregated dashboard data for buyer/vendor
export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let filter = {};
    if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { orgId: req.user.orgId } });
      if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
      filter = { vendorId: vendor.id };
    } else {
      filter = { orgId: req.user.orgId };
    }

    // Active RFQs (only for buyers; vendors will get 0)
    const activeRfqs = req.user.role === 'VENDOR'
      ? 0
      : await prisma.rfq.count({ where: { orgId: req.user.orgId, status: 'OPEN' } });

    // Pending approvals: count quotations with status SUBMITTED for the org
    const pendingApprovals = req.user.role === 'VENDOR'
      ? await prisma.quotation.count({ where: { vendorId: filter.vendorId ?? undefined, status: 'SUBMITTED' } })
      : await prisma.quotation.count({ where: { rfq: { orgId: req.user.orgId }, status: 'SUBMITTED' } });

    // PO this month (sum of totalAmount for current month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const poThisMonthAgg = await prisma.purchaseOrder.aggregate({
      _sum: { totalAmount: true },
      where: {
        ...filter,
        createdAt: { gte: startOfMonth, lt: endOfMonth }
      }
    });
    const poThisMonth = Number(poThisMonthAgg._sum.totalAmount ?? 0);

    // Overdue invoices: not PAID and older than 30 days
    const overdueInvoices = await prisma.invoice.count({
      where: {
        po: req.user.role === 'VENDOR' ? { vendorId: filter.vendorId } : { orgId: req.user.orgId },
        status: { not: 'PAID' },
        generatedAt: { lt: thirtyDaysAgo }
      }
    });

    // Recent POs
    const recentPOs = await prisma.purchaseOrder.findMany({
      where: { ...(req.user.role === 'VENDOR' ? { vendorId: filter.vendorId } : { orgId: req.user.orgId }) },
      include: { vendor: { include: { org: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    // Spending data for last 6 months
    const spendingData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const agg = await prisma.purchaseOrder.aggregate({
        _sum: { totalAmount: true },
        where: { ...(req.user.role === 'VENDOR' ? { vendorId: filter.vendorId } : { orgId: req.user.orgId }), createdAt: { gte: start, lt: end } }
      });
      spendingData.push({ month: start.toLocaleString('en-US', { month: 'short' }), amount: Number(agg._sum.totalAmount ?? 0) });
    }

    // Category breakdown by vendor.category (simple aggregation)
    const posForCategory = await prisma.purchaseOrder.findMany({
      where: { ...(req.user.role === 'VENDOR' ? { vendorId: filter.vendorId } : { orgId: req.user.orgId }) },
      include: { vendor: true }
    });
    const categoryMap = {};
    let total = 0;
    posForCategory.forEach((p) => {
      const amt = Number(p.totalAmount ?? 0);
      const cat = p.vendor?.category ?? 'Others';
      total += amt;
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value], idx) => ({ name, value: total ? Math.round((value / total) * 100) : 0, color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4] }));

    res.json({
      activeRfqs,
      pendingApprovals,
      poThisMonth,
      overdueInvoices,
      recentPOs,
      spendingData,
      categoryData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
