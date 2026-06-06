import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import vendorRouter from './routes/vendor.js';
import rfqRouter from './routes/rfq.js';
import approvalRouter from './routes/approval.js';
import quotationRoter from './routes/quotation.js';
import poRouter from './routes/po.js';
import invoiceRouter from './routes/invoice.js';

const app = express();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  message: { error: 'Too many requests, please try again later' },
});

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/vendors', vendorRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/rfqs', rfqRouter);
app.use('/api/approvals', approvalRouter);
app.use('/api/quotations', quotationRoter);
app.use('/api/pos', poRouter);
app.use('/api/invoices', invoiceRouter);

export default app;
