import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertOrderSchema } from "@shared/schema";
import Stripe from "stripe";
import crypto from "crypto";
import { ZodError } from "zod";

// Check if Stripe secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
const stripe = new Stripe(stripeSecretKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for users
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
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
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
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
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
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
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
      const orders = await storage.getOrdersByUserId(userId);
      
      res.json(orders);
    } catch (error) {
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
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
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
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
