import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound } from './app/middlewares/notFound';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { PaymentControllers } from './app/modules/payment/payment.controller';
import { AppRoutes } from './app/routes';

const app: Application = express();

app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), PaymentControllers.handleStripeWebhook);

// parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(cookieParser());



app.use('/api/v1', AppRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.send('Server is running!');
});



app.use(globalErrorHandler);
app.use(notFound)

export default app;
