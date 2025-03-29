import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertOrderSchema, User } from "@shared/schema";
import Stripe from "stripe";
import crypto from "crypto";
import { ZodError } from "zod";
import * as googleSheets from "./google-sheets";

// Расширяем типы для Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      logout(done: (err: any) => void): void;
    }
  }
}

// Check if Stripe secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(stripeSecretKey);

/**
 * Determine if the country should use EUR as currency
 * @param country Country name
 * @returns true if country should use EUR, false otherwise
 */
function shouldUseEUR(country: string): boolean {
  const eurCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
  ];
  
  return eurCountries.includes(country);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Инициализация Google Sheets
  let googleSheetsAvailable = false;
  try {
    await googleSheets.initializeGoogleSheets();
    console.log("Google Sheets initialized successfully");
    googleSheetsAvailable = true;
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    console.log("Continuing without Google Sheets integration. User and order data will only be stored in memory.");
  }
  
  // Вспомогательная функция для безопасного вызова функций Google Sheets
  const safeGoogleSheetsCall = async (operation: Function, ...args: any[]) => {
    if (!googleSheetsAvailable) return;
    try {
      await operation(...args);
    } catch (error) {
      console.error(`Error during Google Sheets operation: ${error}`);
    }
  };
  // API routes for users
  
  // GET /api/users/me - Получение данных текущего пользователя
  app.get("/api/users/me", async (req: Request, res: Response) => {
    try {
      // Проверка аутентификации
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Отправка данных пользователя (без sensitive полей)
      res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        isVerified: req.user.isVerified,
        name: req.user.name,
        phone: req.user.phone,
        country: req.user.country,
        street: req.user.street,
        house: req.user.house,
        apartment: req.user.apartment
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
  
  // POST /api/users/logout - Выход из системы
  app.post("/api/users/logout", (req: Request, res: Response) => {
    try {
      // Проверка аутентификации
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not logged in" });
      }
      
      // Выход из системы (уничтожение сессии)
      req.logout((err) => {
        if (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({ message: "Error during logout" });
        }
        
        res.json({ success: true, message: "Successfully logged out" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Error during logout" });
    }
  });
  
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Generate verification token
      const token = await storage.generateVerificationToken(user.id);
      
      // Save user to Google Sheets
      await safeGoogleSheetsCall(googleSheets.saveUser, user);
      await safeGoogleSheetsCall(googleSheets.saveVerificationToken, user.id, token);
      
      // Устанавливаем пользователя в сессии
      if (req.session) {
        (req.session as any).userId = user.id;
      }
      
      // In a real application, send an email with the verification link
      // For this prototype, we'll just return the token
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        verificationToken: token
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/users/login", async (req: Request, res: Response) => {
    try {
      // Валидация входных данных
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: "Invalid request body" });
      }
      
      const { username, password } = req.body;
      
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: "Username and password are required and must be strings" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Устанавливаем userId в сессии для аутентификации
      if (req.session) {
        (req.session as any).userId = user.id;
      }
      
      // Возвращаем данные пользователя (без sensitive полей)
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        name: user.name,
        phone: user.phone,
        country: user.country,
        street: user.street,
        house: user.house,
        apartment: user.apartment
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = updateUserSchema.parse(req.body);
      
      // Проверка авторизации пользователя
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user in Google Sheets
      await safeGoogleSheetsCall(googleSheets.updateUser, updatedUser);
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
        name: updatedUser.name,
        phone: updatedUser.phone,
        country: updatedUser.country,
        street: updatedUser.street,
        house: updatedUser.house,
        apartment: updatedUser.apartment
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });
  
  // DELETE /api/users/:id - Удаление учетной записи пользователя
  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Проверка авторизации пользователя
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Delete user from Google Sheets
      await safeGoogleSheetsCall(googleSheets.deleteUser, userId);
      
      // Уничтожаем сессию пользователя
      req.logout(() => {});
      
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user account" });
    }
  });
  
  app.get("/api/users/:id/verify", async (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const verifiedUser = await storage.verifyUserByToken(token);
      
      if (!verifiedUser) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      // Also verify token in Google Sheets and update user verification status
      if (googleSheetsAvailable) {
        try {
          const gsUserId = await googleSheets.verifyToken(token);
          if (gsUserId) {
            await safeGoogleSheetsCall(googleSheets.updateUser, verifiedUser);
          }
        } catch (error) {
          console.error("Error verifying token in Google Sheets:", error);
        }
      }
      
      res.json({ message: "Email verified successfully", isVerified: true });
    } catch (error) {
      res.status(500).json({ message: "Error during verification" });
    }
  });
  
  app.post("/api/users/send-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      const token = await storage.generateVerificationToken(user.id);
      
      // Save verification token to Google Sheets
      await safeGoogleSheetsCall(googleSheets.saveVerificationToken, user.id, token);
      
      // In a real application, send the email with the verification link
      // For this prototype, we'll just return success
      
      res.json({ 
        message: "Verification email sent", 
        token // for testing only
      });
    } catch (error) {
      res.status(500).json({ message: "Error sending verification email" });
    }
  });
  
  // API routes for products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      // Check if we should filter by country
      const country = req.query.country as string | undefined;
      
      // Optional sync with Stripe products (for demo purposes)
      const syncWithStripe = req.query.sync === 'true';
      
      // Check if we should sort products
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
      
      if (syncWithStripe) {
        // This would sync with Stripe products in a real implementation
        await storage.syncStripeProducts();
      }
      
      let products = country 
        ? await storage.getProductsByCountry(country)
        : await storage.getProducts();
      
      // Apply sorting if requested
      if (sortBy) {
        products = [...products].sort((a, b) => {
          let valueA, valueB;
          
          // Handle different sort fields
          if (sortBy === 'price') {
            // Use the appropriate price based on country
            if (country && shouldUseEUR(country)) {
              valueA = a.priceEUR;
              valueB = b.priceEUR;
            } else {
              valueA = a.price;
              valueB = b.price;
            }
          } else if (sortBy === 'title') {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
          } else if (sortBy === 'category') {
            valueA = a.category.toLowerCase();
            valueB = b.category.toLowerCase();
          } else {
            // Default to sort by ID
            valueA = a.id;
            valueB = b.id;
          }
          
          // Apply sort order
          const multiplier = sortOrder === 'desc' ? -1 : 1;
          
          // Compare values
          if (typeof valueA === 'string') {
            return multiplier * valueA.localeCompare(valueB as string);
          } else {
            return multiplier * ((valueA as number) - (valueB as number));
          }
        });
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      // Check if the ID is a Stripe product ID (they start with 'prod_')
      const isStripeId = req.params.id.startsWith('prod_');
      let product;
      
      if (isStripeId) {
        product = await storage.getProductByStripeId(req.params.id);
      } else {
        const productId = parseInt(req.params.id);
        product = await storage.getProduct(productId);
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  
  // Endpoint to sync products with Stripe
  app.post("/api/stripe/sync-products", async (_req: Request, res: Response) => {
    try {
      // In a real implementation, this would fetch products from Stripe API
      // and sync them with our database
      const products = await storage.syncStripeProducts();
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ message: "Error syncing products with Stripe" });
    }
  });
  
  // API routes for orders
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // In a real application, verify that the user exists
      if (typeof orderData.userId !== 'number') {
        return res.status(400).json({ message: "Invalid userId format" });
      }
      
      const user = await storage.getUser(orderData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real application, verify that the product exists
      if (typeof orderData.productId !== 'number') {
        return res.status(400).json({ message: "Invalid productId format" });
      }
      
      const product = await storage.getProduct(orderData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const order = await storage.createOrder(orderData);
      
      // Save order to Google Sheets
      await safeGoogleSheetsCall(googleSheets.saveOrder, order);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });
  
  app.get("/api/users/:userId/orders", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Валидация ID пользователя
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Проверка аутентификации и авторизации
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const orders = await storage.getOrdersByUserId(userId);
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  
  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount, userId, productId, currency = "usd" } = req.body;
      
      if (!amount || !userId || !productId) {
        return res.status(400).json({ message: "Amount, userId, and productId are required" });
      }
      
      // Validate currency
      if (currency !== "usd" && currency !== "eur") {
        return res.status(400).json({ message: "Currency must be either 'usd' or 'eur'" });
      }
      
      // In a real application, check if the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real application, check if the product exists and has the correct price
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency, // Use the currency from the request
        // In a production app, you would set this to the customer's email
        receipt_email: user.email || undefined,
        metadata: {
          userId: userId.toString(),
          productId: productId.toString(),
          currency
        }
      });
      
      // Create an order in pending status
      const order = await storage.createOrder({
        userId,
        productId,
        status: "pending",
        amount,
        currency,
        stripePaymentId: paymentIntent.id
      });
      
      // Save order to Google Sheets
      await safeGoogleSheetsCall(googleSheets.saveOrder, order);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });
  
  // Endpoint for creating or retrieving a subscription
  app.post("/api/get-or-create-subscription", async (req: Request, res: Response) => {
    try {
      // Проверка аутентификации
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user;
      
      // Если у пользователя уже есть подписка, получаем информацию о ней
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
            expand: ['latest_invoice.payment_intent']
          });
          
          // Если есть активная подписка, возвращаем её данные
          res.json({
            subscriptionId: subscription.id,
            status: subscription.status,
            clientSecret: subscription.latest_invoice && 
              typeof subscription.latest_invoice !== 'string' &&
              subscription.latest_invoice.payment_intent &&
              typeof subscription.latest_invoice.payment_intent !== 'string'
                ? subscription.latest_invoice.payment_intent.client_secret
                : null
          });
          
          return;
        } catch (error) {
          console.error("Error retrieving subscription:", error);
          // Если подписка не найдена в Stripe, сбрасываем ID в нашей БД
          await storage.updateUserStripeSubscriptionId(user.id, "");
        }
      }
      
      // Получаем данные из запроса
      const { priceId, currency = "usd" } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      
      // Проверяем, есть ли у пользователя Stripe Customer ID
      if (!user.stripeCustomerId) {
        // Создаем нового клиента в Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.username,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        // Сохраняем ID клиента в нашей БД
        await storage.updateUserStripeCustomerId(user.id, customer.id);
        user.stripeCustomerId = customer.id;
      }
      
      // Создаем подписку
      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'], // Получаем платежное намерение для клиентской стороны
        metadata: {
          userId: user.id.toString()
        }
      });
      
      // Проверяем, что у нас есть latest_invoice как объект, а не строка
      const latest_invoice = subscription.latest_invoice;
      let clientSecret = null;
      
      if (latest_invoice && typeof latest_invoice !== 'string') {
        const payment_intent = latest_invoice.payment_intent;
        if (payment_intent && typeof payment_intent !== 'string') {
          clientSecret = payment_intent.client_secret;
        }
      }
      
      // Сохраняем ID подписки в нашей БД
      await storage.updateUserStripeSubscriptionId(user.id, subscription.id);
      
      // Отправляем данные клиенту для завершения подписки
      res.json({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
        status: subscription.status
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Error creating subscription" });
    }
  });
  
  app.post("/api/orders/:id/update-status", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Update order status in Google Sheets
      await safeGoogleSheetsCall(googleSheets.updateOrderStatus, orderId, status);
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });
  
  // Webhook для обработки событий от Stripe
  app.post("/api/webhook/stripe", async (req: Request, res: Response) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      
      if (!sig) {
        return res.status(400).json({ message: "Missing Stripe signature" });
      }
      
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn("STRIPE_WEBHOOK_SECRET is not set. Webhook verification will be skipped.");
      }
      
      let event;
      
      // Верификация вебхука (рекомендуется в production)
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        try {
          event = stripe.webhooks.constructEvent(
            req.body instanceof Buffer ? req.body : JSON.stringify(req.body),
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err: any) {
          console.error(`Webhook Error: ${err.message}`);
          return res.status(400).json({ message: `Webhook Error: ${err.message}` });
        }
      } else {
        // Без верификации в dev-окружении
        event = req.body;
      }
      
      // Обработка различных событий от Stripe
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
          
          // Обновляем статус заказа
          try {
            const order = await storage.getOrderByStripePaymentId(paymentIntent.id);
            if (order) {
              await storage.updateOrderStatus(order.id, 'completed');
              await safeGoogleSheetsCall(googleSheets.updateOrderStatus, order.id, 'completed');
              console.log(`Order ${order.id} marked as completed`);
            }
          } catch (error) {
            console.error('Error updating order after payment success:', error);
          }
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`Payment failed for PaymentIntent ${failedPayment.id}`);
          
          // Обновляем статус заказа
          try {
            const order = await storage.getOrderByStripePaymentId(failedPayment.id);
            if (order) {
              await storage.updateOrderStatus(order.id, 'failed');
              await safeGoogleSheetsCall(googleSheets.updateOrderStatus, order.id, 'failed');
              console.log(`Order ${order.id} marked as failed`);
            }
          } catch (error) {
            console.error('Error updating order after payment failure:', error);
          }
          break;
          
        case 'checkout.session.completed':
          // Обработка успешной сессии оформления заказа
          const session = event.data.object;
          console.log(`Checkout session ${session.id} completed`);
          break;
          
        case 'subscription_schedule.created':
        case 'subscription_schedule.updated':
        case 'subscription_schedule.released':
        case 'subscription_schedule.canceled':
        case 'subscription.created':
        case 'subscription.updated':
        case 'subscription.deleted':
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.trial_will_end':
          // Обработка событий, связанных с подписками
          console.log(`Subscription event: ${event.type}`);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
