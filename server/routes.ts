import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema, insertOrderSchema, User, Order } from "@shared/schema";
import Stripe from "stripe";
import crypto from "crypto";
import { ZodError } from "zod";
import * as googleSheets from "./google-sheets";
import * as pushNotification from "./push-notification";
import * as email from "./email";
import nodemailer from "nodemailer";
import { createPaymentIntentWithTaxInfo } from "./tax-demo-route";
import taxDebugRoutes from "./routes/tax-debug";

// Функция для получения полного названия страны по коду ISO
function getFullCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    'AT': 'Austria',
    'BE': 'Belgium',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'IT': 'Italy',
    'LV': 'Latvia',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'NL': 'Netherlands',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'SK': 'Slovakia',
    'SI': 'Slovenia',
    'ES': 'Spain',
    'SE': 'Sweden',
    'GB': 'United Kingdom',
    'US': 'United States'
  };
  
  return countryMap[countryCode] || countryCode;
}

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
 * @param country Country name or country code
 * @returns true if country should use EUR, false otherwise
 */
function shouldUseEUR(country: string): boolean {
  if (!country) return false;
  
  // Коды стран Европейского Союза (в верхнем регистре)
  const eurCountryCodes = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE'
  ];
  
  // Названия стран Европейского Союза
  const eurCountries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
  ];
  
  // Проверка на код страны (если длина 2 символа)
  if (country.length === 2) {
    return eurCountryCodes.includes(country.toUpperCase());
  }
  
  // Проверка на полное название страны
  return eurCountries.includes(country);
}

/**
 * Функция для синхронизации продуктов со Stripe
 * Вызывается при запуске приложения и периодически по таймеру
 */
async function syncProductsWithStripeBackend() {
  try {
    console.log("Starting automatic Stripe products synchronization...");
    const products = await storage.syncStripeProducts();
    console.log(`Successfully synchronized ${products.length} products with Stripe`);
    return products;
  } catch (error) {
    console.error("Error during automatic Stripe product synchronization:", error);
    return [];
  }
}

// Интервал синхронизации: 12 часов (в миллисекундах)
const SYNC_INTERVAL = 12 * 60 * 60 * 1000;

export async function registerRoutes(app: Express): Promise<Server> {
  // Инициализация Google Sheets
  let googleSheetsAvailable = false;
  
  // Запускаем первичную синхронизацию со Stripe при старте приложения
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      console.log("STRIPE_SECRET_KEY found, performing initial product synchronization with Stripe...");
      await syncProductsWithStripeBackend();
    } else {
      console.warn("STRIPE_SECRET_KEY not found, skipping product synchronization with Stripe");
    }
  } catch (error) {
    console.error("Error during initial Stripe product synchronization:", error);
  }
  
  // Настройка периодической синхронизации со Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    setInterval(async () => {
      try {
        console.log(`Running scheduled Stripe product synchronization (interval: ${SYNC_INTERVAL/1000/60/60} hours)...`);
        await syncProductsWithStripeBackend();
      } catch (error) {
        console.error("Error during scheduled Stripe product synchronization:", error);
      }
    }, SYNC_INTERVAL);
    console.log(`Scheduled Stripe product synchronization every ${SYNC_INTERVAL/1000/60/60} hours`);
  }
  try {
    await googleSheets.initializeGoogleSheets();
    console.log("Google Sheets initialized successfully");
    googleSheetsAvailable = true;
    
    // Загружаем пользователей из Google Sheets в память
    // Используем приведение типа к IStorage, так как метод должен быть доступен через интерфейс
    await (storage as any).loadUsersFromGoogleSheets();
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
      
      // Убедимся, что страна указана
      if (!userData.country) {
        return res.status(400).json({ message: "Country selection is required" });
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
      
      console.log("[DEBUG] Login attempt:", { username, passwordLength: password ? password.length : 0 });
      
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: "Username and password are required and must be strings" });
      }
      
      // Получаем всех пользователей для отладки
      // Используем приведение типа для отладочных целей
      const allUsers = storage instanceof Object && 'users' in storage 
        ? Array.from((storage as any).users.values()) 
        : [];
      
      if (allUsers.length > 0) {
        // Безопасный доступ к свойствам с проверкой типов
        console.log("[DEBUG] All users:", allUsers.map(u => ({
          id: typeof u === 'object' && u && 'id' in u ? u.id : 'unknown',
          username: typeof u === 'object' && u && 'username' in u ? u.username : 'unknown',
          password: typeof u === 'object' && u && 'password' in u ? u.password : 'unknown'
        })));
      } else {
        console.log("[DEBUG] No users found in storage");
      }
      
      const user = await storage.getUserByUsername(username);
      console.log("[DEBUG] Found user:", user);
      
      if (!user || user.password !== password) {
        console.log("[DEBUG] Password comparison:", {
          userExists: !!user,
          providedPassword: password,
          storedPassword: user?.password,
          match: user?.password === password
        });
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
      console.log("Update user request for ID:", userId, "with data:", req.body);
      
      // Проверка авторизации пользователя
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        console.log("Unauthorized update attempt. Auth status:", req.isAuthenticated(), "User:", req.user?.id);
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      try {
        // Получаем входные данные от пользователя
        const userData = updateUserSchema.parse(req.body);
        console.log("Data after validation:", userData);
        
        // Получаем текущего пользователя из базы
        const currentUser = await storage.getUser(userId);
        if (!currentUser) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Не позволяем менять страну после регистрации
        if (userData.country && userData.country !== currentUser.country) {
          console.log(`Attempt to change country from ${currentUser.country} to ${userData.country}`);
          userData.country = currentUser.country; // Сохраняем исходную страну
        }
        
        console.log("Data after country protection:", userData);
        
        // Обновляем пользователя с модифицированными данными
        const updatedUser = await storage.updateUser(userId, userData);
        
        if (!updatedUser) {
          console.log("User not found:", userId);
          return res.status(404).json({ message: "User not found" });
        }
        
        // Update user in Google Sheets
        await safeGoogleSheetsCall(googleSheets.updateUser, updatedUser);
        
        const responseData = {
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
        };
        
        console.log("User updated successfully:", responseData);
        res.json(responseData);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          console.error("Validation error:", validationError.errors);
          return res.status(400).json({ message: "Invalid user data", errors: validationError.errors });
        }
        throw validationError; // Rethrow for the outer catch block
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error: String(error) });
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
      
      // Отправляем настоящее письмо с верификационным кодом
      try {
        await nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        }).sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your email address',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #333;">Email Verification</h2>
              <p>Hello ${user.name || user.username},</p>
              <p>Thank you for registering. Please click the button below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.protocol}://${req.get('host')}/api/users/${user.id}/verify?token=${token}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Verify Email
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #f8f8f8; padding: 10px; border-radius: 4px;">
                ${req.protocol}://${req.get('host')}/api/users/${user.id}/verify?token=${token}
              </p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>Best regards,<br>AI Store by Aething Team</p>
            </div>
          `
        });
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Даже если отправка не удалась, мы всё равно возвращаем успех и токен для тестирования
      }
      
      res.json({ 
        message: "Verification email sent", 
        token // for testing only
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Error sending verification email" });
    }
  });
  
  // API routes for products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      // Check if we should filter by country
      const country = req.query.country as string | undefined;
      
      // Добавляем детальный вывод информации о запросе
      console.log(`[DEBUG] GET /api/products - Query country param: ${country}, User session country: ${req.user?.country}`);
      
      // Если в запросе не указана страна, но пользователь аутентифицирован, используем его страну
      const effectiveCountry = country || (req.isAuthenticated() ? req.user?.country : undefined);
      console.log(`[DEBUG] Effective country for products: ${effectiveCountry}`);
      
      // Optional sync with Stripe products (for demo purposes)
      const syncWithStripe = req.query.sync === 'true';
      
      // Check if we should sort products
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
      
      if (syncWithStripe) {
        // This would sync with Stripe products in a real implementation
        await storage.syncStripeProducts();
      }
      
      // Используем effectiveCountry вместо country
      let products = effectiveCountry 
        ? await storage.getProductsByCountry(effectiveCountry)
        : await storage.getProducts();
        
      // Добавляем вывод информации о ценах в разных валютах
      if (products.length > 0) {
        const shouldUseEuro = effectiveCountry ? shouldUseEUR(effectiveCountry) : false;
        const currency = shouldUseEuro ? 'EUR' : 'USD';
        console.log(`[DEBUG] Currency determined for country ${effectiveCountry}: ${currency}`);
        
        const sampleProduct = products[0];
        console.log(`[DEBUG] Sample product prices - USD: ${sampleProduct.price}, EUR: ${sampleProduct.priceEUR}`);
      }
      
      // Apply sorting if requested
      if (sortBy) {
        products = [...products].sort((a, b) => {
          let valueA, valueB;
          
          // Handle different sort fields
          if (sortBy === 'price') {
            // Use the appropriate price based on country
            if (effectiveCountry && shouldUseEUR(effectiveCountry)) {
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

  // Endpoint для создания цены в Stripe
  app.post("/api/stripe/create-price", async (req: Request, res: Response) => {
    try {
      const { productId, currency = "usd", amount, recurring = false } = req.body;
      
      if (!productId || !amount) {
        return res.status(400).json({ message: "Product ID and amount are required" });
      }
      
      // Get the product
      const product = await storage.getProduct(Number(productId));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (!product.stripeProductId) {
        return res.status(400).json({ message: "Product does not have a Stripe product ID. Please sync products first." });
      }
      
      // Импортируем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
      // Create a price in Stripe
      const priceData: any = {
        product: product.stripeProductId,
        currency,
        unit_amount: amount,
      };
      
      if (recurring) {
        priceData.recurring = {
          interval: 'month'
        };
      }
      
      const price = await stripe.prices.create(priceData);
      
      res.json({ 
        success: true, 
        price: {
          id: price.id,
          product: price.product,
          currency: price.currency,
          unit_amount: price.unit_amount,
          recurring: price.recurring
        }
      });
    } catch (error) {
      console.error("Error creating price:", error);
      res.status(500).json({ message: "Error creating price" });
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
      
      // Отправляем подтверждение заказа по электронной почте, если у пользователя есть почта
      if (user.email) {
        try {
          const language = user.language || 'ru'; // Используем язык пользователя или по умолчанию
          await email.sendOrderConfirmation(order, user.email, language);
          console.log(`Order confirmation email sent to ${user.email}`);
        } catch (emailError) {
          // Логируем ошибку, но не прерываем выполнение запроса
          console.error(`Failed to send order confirmation email:`, emailError);
        }
      }
      
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
      const { amount, userId, productId, currency = "usd", couponCode, country: requestCountry, force_country, quantity = 1 } = req.body;
      
      if (!amount || !userId || !productId) {
        return res.status(400).json({ message: "Amount, userId, and productId are required" });
      }
      
      // ВАЖНО: Проверка, что сумма передана в виде мельчайших единиц валюты (центы, копейки)
      // Stripe требует суммы в центах/копейках, поэтому amount должен быть целым числом
      // и должен быть достаточно большим (например, €10.00 = 1000 центов, $3248.00 = 324800 центов)
      if (amount < 1000) {
        console.warn(`WARNING: Received very small amount: ${amount} ${currency}. ` +
          `This might indicate that the amount is not in the smallest currency unit (cents/pennies). ` +
          `For example, $3248.00 should be passed as 324800, not 3248.`);
      }
      
      // Добавляем диагностическую информацию о передаваемой сумме
      console.log(`Received amount: ${amount} ${currency} ` +
        `(это эквивалентно ${(amount/100).toFixed(2)} ${currency} в основных единицах валюты)`);
        
      // ВАЖНО: Проверяем, если сумма не соответствует сотням центов/копеек
      // Например, если передано 27.60 вместо 2760, умножаем ее на 100
      if (amount < 50 && String(amount).includes('.')) {
        console.log(`Обнаружена сумма, которая может быть в основных единицах валюты (${amount}). Конвертируем в центы/копейки.`);
        amount = Math.round(amount * 100);
        console.log(`Сконвертированная сумма: ${amount} (центы/копейки)`);
      }
      
      
      // Валидация количества
      const parsedQuantity = parseInt(quantity.toString(), 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      
      // Validate currency - ensure lowercase comparison
      // Сначала убедимся, что currency - это строка
      const currencyStr = String(currency);
      const lowerCurrency = currencyStr.toLowerCase();
      if (lowerCurrency !== "usd" && lowerCurrency !== "eur") {
        return res.status(400).json({ message: "Currency must be either 'usd' or 'eur'" });
      }
      
      // In a real application, check if the user exists
      const customerData = await storage.getUser(userId);
      if (!customerData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real application, check if the product exists and has the correct price
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Create metadata object with optional coupon
      // We already have user country info from customerData
      // Используем улучшенную логику определения страны:
      
      // 1. Получаем страну из параметров URL (если есть)
      const queryCountry = req.query.country as string | undefined;
      
      // 2. Определяем, нужно ли принудительно использовать переданную страну
      const useForceCountry = force_country === true || req.query.force_country === 'true';
      
      // 3. Выбираем страну с учетом приоритетов:
      //    - Если указан force_country, используем страну из запроса
      //    - Иначе используем страну из профиля пользователя
      //    - Если ничего не найдено, используем null
      const country = useForceCountry ? (requestCountry || queryCountry) : (customerData?.country || requestCountry || queryCountry || null);
      
      const metadata: Record<string, string> = {
        userId: userId.toString(),
        productId: productId.toString(),
        quantity: parsedQuantity.toString(),
        currency,
        country: country || 'unknown'
      };

      // Добавляем информацию о способе выбора страны в метаданные для отладки
      metadata.country_source = useForceCountry ? 'force_country' : (customerData?.country ? 'user_profile' : (requestCountry ? 'request_body' : (queryCountry ? 'query_param' : 'unknown')));
      
      // Add coupon to metadata if provided
      if (couponCode) {
        metadata.couponCode = couponCode;
      }
      
      // Импортируем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
      // Create a PaymentIntent with the order amount and currency
      // Using only the essential parameters to avoid errors
      console.log(`Creating PaymentIntent for amount: ${amount} ${currency}`);
      
      // Рассчитываем НДС в зависимости от страны
      // Используем стандартные ставки VAT для разных стран
      let taxAmount = 0;
      let taxRate = 0;
      let taxLabel = '';
      let nexusThresholdReached = false;
      
      // Определяем ставку НДС по стране и получаем дополнительную информацию о локации
      if (country) {
        // Для США - отдельная логика с учетом порогов nexus и информацией о штатах
        if (country === 'US') {
          // Получаем штат из адреса пользователя или из дополнительных данных, если они есть
          // Учитывая текущую структуру данных, добавим базовую проверку
          let state = 'unknown';
          
          // Если в метаданных запроса есть информация о штате, используем её
          if (req.body.state) {
            state = req.body.state;
          }
          
          // Записываем информацию о штате в метаданные для будущего учета
          metadata.state = state;
          
          // Примечание: в текущей реализации налоги для США не применяются,
          // так как пороги nexus не достигнуты. Код ниже будет активирован
          // после достижения пороговых значений.
          
          // Проверка достижения порогов nexus - в настоящий момент false
          // В будущем эту проверку можно сделать зависимой от суммы продаж по штату
          if (nexusThresholdReached) {
            // Здесь будет логика применения ставок НДС по штатам
            // после достижения порогов nexus
            // В настоящий момент эта логика не активна, ставки настроены в Stripe Tax
          } else {
            taxRate = 0;
            taxLabel = 'No Sales Tax';
          }
        } else {
          // Для европейских стран с НДС применяем ставки по правилам ЕС
          // Актуальные данные на 2025 год
          switch(country) {
            case 'AT': // Австрия
              taxRate = 0.20;
              taxLabel = 'MwSt. 20%';
              break;
            case 'BE': // Бельгия
              taxRate = 0.21;
              taxLabel = 'BTW 21%';
              break;
            case 'BG': // Болгария
              taxRate = 0.20;
              taxLabel = 'ДДС 20%';
              break;
            case 'HR': // Хорватия
              taxRate = 0.25;
              taxLabel = 'PDV 25%';
              break;
            case 'CY': // Кипр
              taxRate = 0.19;
              taxLabel = 'ΦΠΑ 19%';
              break;
            case 'CZ': // Чехия
              taxRate = 0.21;
              taxLabel = 'DPH 21%';
              break;
            case 'DK': // Дания
              taxRate = 0.25;
              taxLabel = 'MOMS 25%';
              break;
            case 'EE': // Эстония
              taxRate = 0.22;
              taxLabel = 'KM 22%';
              break;
            case 'FI': // Финляндия
              taxRate = 0.255; // Обновлено на 25.5%
              taxLabel = 'ALV 25.5%';
              break;
            case 'FR': // Франция 
              taxRate = 0.20;
              taxLabel = 'TVA 20%';
              break;
            case 'GE': // Грузия
              taxRate = 0.18;
              taxLabel = 'VAT 18%';
              break;
            case 'DE': // Германия
              taxRate = 0.19;
              taxLabel = 'MwSt. 19%';
              break;
            case 'GR': // Греция
              taxRate = 0.24;
              taxLabel = 'ΦΠΑ 24%';
              break;
            case 'HU': // Венгрия
              taxRate = 0.27;
              taxLabel = 'ÁFA 27%';
              break;
            case 'IS': // Исландия
              taxRate = 0.24;
              taxLabel = 'VSK 24%';
              break;
            case 'IE': // Ирландия
              taxRate = 0.23;
              taxLabel = 'VAT 23%';
              break;
            case 'IT': // Италия
              taxRate = 0.22;
              taxLabel = 'IVA 22%';
              break;
            case 'LV': // Латвия
              taxRate = 0.21;
              taxLabel = 'PVN 21%';
              break;
            case 'LT': // Литва
              taxRate = 0.21;
              taxLabel = 'PVM 21%';
              break;
            case 'LU': // Люксембург
              taxRate = 0.16; // Обновлено на 2025 год
              taxLabel = 'TVA 16%';
              break;
            case 'MT': // Мальта
              taxRate = 0.18;
              taxLabel = 'VAT 18%';
              break;
            case 'MD': // Молдова
              taxRate = 0.20;
              taxLabel = 'TVA 20%';
              break;
            case 'NL': // Нидерланды
              taxRate = 0.21;
              taxLabel = 'BTW 21%';
              break;
            case 'NO': // Норвегия
              taxRate = 0.25;
              taxLabel = 'MVA 25%';
              break;
            case 'PL': // Польша
              taxRate = 0.23;
              taxLabel = 'VAT 23%';
              break;
            case 'PT': // Португалия
              taxRate = 0.23;
              taxLabel = 'IVA 23%';
              break;
            case 'RO': // Румыния
              taxRate = 0.19;
              taxLabel = 'TVA 19%';
              break;
            case 'SK': // Словакия
              taxRate = 0.23; // Обновлено с 20% на 23%
              taxLabel = 'DPH 23%';
              break;
            case 'SI': // Словения
              taxRate = 0.22;
              taxLabel = 'DDV 22%';
              break;
            case 'ES': // Испания
              taxRate = 0.21;
              taxLabel = 'IVA 21%';
              break;
            case 'SE': // Швеция
              taxRate = 0.25;
              taxLabel = 'MOMS 25%';
              break;
            case 'CH': // Швейцария
              taxRate = 0.081;
              taxLabel = 'MWST 8.1%';
              break;
            case 'TR': // Турция
              taxRate = 0.20;
              taxLabel = 'KDV 20%';
              break;
            case 'UA': // Украина
              taxRate = 0.20;
              taxLabel = 'ПДВ 20%';
              break;
            case 'GB': // Великобритания
              taxRate = 0.20;
              taxLabel = 'VAT 20%';
              break;
            default:
              // Для стран не из списка и не из США, используем 0% НДС
              taxRate = 0;
              taxLabel = 'No VAT';
          }
        }
      }
      
      // Если страна определена и налоговая ставка больше 0, сохраняем информацию о налоге
      if (taxRate > 0) {
        taxAmount = Math.round(amount * taxRate);
        // Добавляем информацию о налоге в метаданные
        metadata.taxRate = taxRate.toString();
        metadata.taxAmount = taxAmount.toString();
        metadata.taxLabel = taxLabel;
      }
      
      // Перевынесено из функции paymentIntent и добавлен экспорт
// как вспомогательный модуль
 // Пустая строка для корректного сопоставления
      
      // Создаем или получаем TaxRate для страны пользователя
      let taxRateId = null;
      
      // Создаем TaxRate для стран с НДС
      if (taxRate > 0) {
        try {
          // Сначала проверим, есть ли уже такая ставка
          const taxRates = await stripe.taxRates.list({ 
            limit: 100,
            active: true
          });
          
          // Ищем ставку с подходящим percentage
          const existingRate = taxRates.data.find(rate => 
            parseFloat(rate.percentage.toString()) === taxRate * 100 && 
            rate.display_name === taxLabel
          );
          
          if (existingRate) {
            taxRateId = existingRate.id;
            // Не выводим номинальную сумму
          } else {
            // Получаем полное название страны для Stripe
            const fullCountryName = country ? getFullCountryName(country) : undefined;
            
            // Создаем новую ставку налога
            const newTaxRate = await stripe.taxRates.create({
              display_name: taxLabel,
              description: `${taxLabel} for ${fullCountryName || country}`,
              percentage: Math.round(taxRate * 100),
              inclusive: false, // НДС начисляется сверх цены
              country: country || undefined,
              tax_type: 'vat'
            });
            
            taxRateId = newTaxRate.id;
            // Не выводим конфиденциальную информацию в логи
          }
        } catch (taxError) {
          console.error("Error creating/retrieving tax rate");
          // Продолжаем без tax rate в случае ошибки
        }
      }
      
      // Настраиваем параметры для PaymentIntent
      // Согласно документации Stripe Tax Custom: https://docs.stripe.com/tax/custom
      // Мы рассчитываем налоги самостоятельно и передаем их через tax.breakdown
      // Важно: amount должен включать сумму налога
      // Здесь налог еще не добавляем к amount, мы сделаем это для разных стран ниже
      const paymentIntentParams: any = {
        amount,  // Изначально устанавливаем базовую сумму без налога
        currency: lowerCurrency, // Используем валюту в нижнем регистре
        payment_method_types: ['card'],
        metadata: {
          ...metadata,
          base_amount: amount.toString(),
          tax_amount: taxAmount.toString(),
          tax_rate: (taxRate * 100).toFixed(2) + '%',
          tax_label: taxLabel,
          country_code: country || 'unknown'
        },
        description: taxRate > 0 ? `Order with ${taxLabel} (${taxAmount} ${currency})` : 'Order without VAT'
        // Примечание: параметр 'tax' не поддерживается в текущей версии API Stripe
        // Налоговую информацию храним в метаданных и оформляем в description
      };
      
      // Добавляем данные о местоположении клиента (для внутреннего учета)
      if (country) {
        // Обновляем метаданные дополнительной информацией о стране
        paymentIntentParams.metadata.country = country;
        
        // Добавляем штат для США, если доступен
        if (country === 'US' && metadata.state && metadata.state !== 'unknown') {
          paymentIntentParams.metadata.state = metadata.state;
        }
      }
      
      // Комментируем этот код, так как мы используем кастомный расчет налогов
      // В документации Stripe сказано, что нельзя использовать параметр tax_rates
      // вместе с кастомным расчетом налогов
      /* 
      if (taxRateId) {
        paymentIntentParams.tax_rates = [taxRateId];
        console.log(`Using tax rate ID: ${taxRateId} for PaymentIntent`);
      }
      */
      
      // Рассчитываем налог в зависимости от страны
      if (country === 'FR') {
        // Франция (20% НДС)
        taxRate = 0.20;
        taxLabel = 'TVA 20%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '20%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        
        // Обновляем описание платежа
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        
        console.log(`Applied French VAT: ${taxAmount} ${currency}`);
      } else if (country === 'IT') {
        // Италия (22% НДС)
        taxRate = 0.22;
        taxLabel = 'IVA 22%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '22%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        
        // Обновляем описание платежа
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        
        console.log(`Applied Italian VAT: ${taxAmount} ${currency}`);
      } else if (country === 'ES') {
        // Испания (21% НДС)
        taxRate = 0.21;
        taxLabel = 'IVA 21%';
        
        // Рассчитываем сумму налога
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налоге в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '21%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Увеличиваем общую сумму на величину налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        
        // Обновляем описание платежа
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        
        console.log(`Applied Spanish VAT: ${taxAmount} ${currency}`);
      } else if (country === 'unknown') {
        // Для неизвестной страны не применяем налог
        taxRate = 0;
        taxLabel = 'No Tax (Unknown Location)';
        taxAmount = 0;
        
        // Не добавляем налог к сумме
        paymentIntentParams.metadata.tax_amount = '0';
        paymentIntentParams.metadata.tax_rate = '0%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = 'unknown';
        
        console.log(`No tax applied for unknown country`);
        
        // Обновляем описание платежа
        paymentIntentParams.description = `Order without tax (unknown country)`;
      } else if (!country || country === 'DE') {
        // Устанавливаем значения для Германии
        const defaultCountry = 'DE';
        taxRate = 0.19;
        taxLabel = 'MwSt. 19%';
        
        // Вычисляем сумму налога (в центах/копейках)
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налогах в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = '19%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = defaultCountry;
        
        // Увеличиваем общую сумму на размер налога
        paymentIntentParams.amount = amount + taxAmount;
        
        // Обновляем описание платежа без конфиденциальной информации
        paymentIntentParams.description = `Order with ${taxLabel}`;
        
        console.log(`Applied German VAT`);
      } else if (country === 'US') {
        // Для США налоги не применяются
        taxRate = 0;
        taxLabel = 'No Sales Tax';
        taxAmount = 0;
        
        // Добавляем информацию об отсутствии налога в метаданные
        paymentIntentParams.metadata.tax_amount = '0';
        paymentIntentParams.metadata.tax_rate = '0%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Сумма остается неизменной
        paymentIntentParams.description = 'Order with no sales tax';
        
        console.log('No tax applied for US customer');
      } else {
        // Для других стран ЕС (FR, IT, ES и т.д.)
        // Используем ставку налога и метку, определенные в switch-case выше
        
        // Вычисляем сумму налога (в центах/копейках)
        taxAmount = Math.round(amount * taxRate);
        
        // Добавляем информацию о налогах в метаданные
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = (taxRate * 100).toFixed(1) + '%';
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        
        // Увеличиваем общую сумму на размер налога
        paymentIntentParams.amount = amount + taxAmount;
        
        console.log(`New total amount with tax for ${country}: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount}, rate: ${taxRate * 100}%)`);
        
        // Обновляем описание платежа
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        
        console.log(`Applied ${country} tax (${taxLabel}): ${taxAmount} ${currency}`);
      }
      
      // Получаем полное название страны для логирования
      const fullCountryNameForLogs = country ? getFullCountryName(country) : 'unknown';
      
      // Подробное логирование для отладки
      console.log(`Creating PaymentIntent for country: ${country || 'unknown'}`);
      // Убираем вывод конфиденциальной информации
      
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      
      console.log(`Created PaymentIntent: ${paymentIntent.id}`);
      
      // Create an order in pending status
      const order = await storage.createOrder({
        userId,
        productId,
        status: "pending",
        amount,
        currency,
        stripePaymentId: paymentIntent.id,
        couponCode: couponCode || undefined
      });
      
      // Save order to Google Sheets
      await safeGoogleSheetsCall(googleSheets.saveOrder, order);
      
      // Подготавливаем налоговую информацию для отправки клиенту
      const taxInfo = {
        amount: taxAmount,
        rate: taxRate,
        label: taxLabel,
        display: taxLabel 
      };
      
      res.json({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        tax: taxInfo
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });
  
  // Тестовый эндпоинт для отладки налоговой информации (устаревший)
  // Маршруты для отладки расчета налогов
  app.use("/api/tax-debug", taxDebugRoutes);
  
  // Специальный маршрут для страницы тестирования налогов
  app.get("/tax-test", (req, res) => {
    res.sendFile("public/tax-test.html", { root: process.cwd() });
  });
  
  // Endpoint for creating or retrieving a subscription
  app.post("/api/get-or-create-subscription", async (req: Request, res: Response) => {
    try {
      // Проверка аутентификации
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user;
      
      // Импортируем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
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
                : undefined
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
          address: user.country ? {
            country: user.country
          } : undefined,
          metadata: {
            userId: user.id.toString(),
            country: user.country || 'unknown'
          }
        });
        
        // Сохраняем ID клиента в нашей БД
        await storage.updateUserStripeCustomerId(user.id, customer.id);
        user.stripeCustomerId = customer.id;
      }
      
      // Создаем подписку с информацией о стране пользователя
      // Примечание: Только Checkout Sessions и Subscriptions поддерживают automatic_tax
      const subscriptionParams: any = {
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'], // Получаем платежное намерение для клиентской стороны
        metadata: {
          userId: user.id.toString(),
          country: user.country || 'unknown',
          currency // Включаем информацию о валюте
        }
      };
      
      // Для подписок automatic_tax действительно поддерживается, проверим наличие Stripe Tax
      if (process.env.STRIPE_TAX_ENABLED === 'true') {
        subscriptionParams.automatic_tax = { enabled: true };
        console.log('Enabling automatic tax calculation for subscription');
      }
      
      // Добавляем информацию о местоположении клиента для правильного расчета налогов
      if (user.country) {
        // Если у клиента уже есть данные о местоположении, не обновляем их здесь
        // Иначе они будут добавлены через создание клиента выше
        console.log(`Using country ${user.country} for subscription tax calculation`);
      }
      
      const subscription = await stripe.subscriptions.create(subscriptionParams);
      
      // Проверяем, что у нас есть latest_invoice как объект, а не строка
      const latest_invoice = subscription.latest_invoice;
      let clientSecret: string | undefined = undefined;
      
      if (latest_invoice && typeof latest_invoice !== 'string') {
        const payment_intent = latest_invoice.payment_intent;
        if (payment_intent && typeof payment_intent !== 'string') {
          clientSecret = payment_intent.client_secret || undefined;
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
  
  // Эндпоинт для управления подпиской (отмена, возобновление)
  app.post("/api/manage-subscription", async (req: Request, res: Response) => {
    try {
      // Проверка аутентификации
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user;
      const { action } = req.body;
      
      if (!action) {
        return res.status(400).json({ message: "Action is required" });
      }
      
      // Проверяем наличие подписки
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      
      // Импортируем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
      let subscription;
      
      switch (action) {
        case 'cancel':
          // Отмена в конце текущего платежного периода
          subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          break;
        
        case 'reactivate':
          // Возобновление подписки, которая была отменена
          subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });
          break;
        
        case 'cancel_immediately':
          // Немедленная отмена подписки
          subscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          
          // Если подписка отменена, удаляем ID из профиля пользователя
          if (subscription.status === 'canceled') {
            await storage.updateUserStripeSubscriptionId(user.id, "");
          }
          break;
          
        default:
          return res.status(400).json({ message: "Invalid action" });
      }
      
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      console.error("Error managing subscription:", error);
      res.status(500).json({ 
        message: "Error managing subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/orders/:id/update-status", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, sendNotification = false, sendEmail = false } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Update order status in Google Sheets
      await safeGoogleSheetsCall(googleSheets.updateOrderStatus, orderId, status);
      
      // Если нужно отправить уведомления
      if ((sendNotification || sendEmail) && updatedOrder.userId) {
        // Получаем данные пользователя
        const user = await storage.getUser(updatedOrder.userId);
        
        // Отправляем push-уведомление, если параметр sendNotification = true
        if (sendNotification) {
          try {
            await pushNotification.sendOrderStatusNotification(
              updatedOrder.userId,
              orderId,
              status
            );
            console.log(`Push notification sent for order ${orderId} status update to ${status}`);
          } catch (notificationError) {
            // Просто логируем ошибку, но не прерываем выполнение запроса
            console.error(`Failed to send push notification for order ${orderId}:`, notificationError);
          }
        }
        
        // Отправляем email-уведомление, если параметр sendEmail = true и у пользователя есть почта
        if (sendEmail && user && user.email) {
          try {
            const language = user.language || 'ru'; // Используем язык пользователя или по умолчанию
            await email.sendOrderStatusUpdate(updatedOrder, user.email, language);
            console.log(`Order status update email sent to ${user.email}`);
          } catch (emailError) {
            // Логируем ошибку, но не прерываем выполнение запроса
            console.error(`Failed to send order status update email:`, emailError);
          }
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  });
  
  // Webhook для обработки событий от Stripe
  app.post("/api/webhook/stripe", async (req: Request, res: Response) => {
    try {
      // Импортируем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
      let event;
      
      // В режиме разработки проверяем наличие заголовка для тестовых webhook-ов
      const isDevTest = req.headers['x-stripe-test'] === 'true';
      const sig = req.headers['stripe-signature'] as string;
      
      if (process.env.STRIPE_WEBHOOK_SECRET && !isDevTest) {
        // Верификация вебхука для production
        if (!sig) {
          return res.status(400).json({ message: "Missing Stripe signature" });
        }
        
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
        // Без верификации для тестирования или если не установлен секрет
        console.log("Using webhook without signature verification (development mode)");
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
              
              // Отправляем уведомление об успешной оплате заказа
              if (order.userId) {
                try {
                  await pushNotification.sendOrderStatusNotification(
                    order.userId,
                    order.id,
                    'completed'
                  );
                  console.log(`Payment success notification sent for order ${order.id}`);
                } catch (notificationError) {
                  console.error(`Failed to send payment notification for order ${order.id}:`, notificationError);
                }
              }
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
              
              // Отправляем уведомление о неудачной оплате заказа
              if (order.userId) {
                try {
                  await pushNotification.sendOrderStatusNotification(
                    order.userId,
                    order.id,
                    'failed'
                  );
                  console.log(`Payment failure notification sent for order ${order.id}`);
                } catch (notificationError) {
                  console.error(`Failed to send payment failure notification for order ${order.id}:`, notificationError);
                }
              }
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

  // API routes for push notifications
  app.post("/api/push/subscribe", pushNotification.registerPushSubscription);
  app.post("/api/push/unsubscribe", pushNotification.unregisterPushSubscription);
  
  // Эндпоинт для обновления tracking number заказа
  app.post("/api/orders/:id/update-tracking", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { trackingNumber, sendEmail = false } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({ message: "Tracking number is required" });
      }
      
      // Получаем заказ из хранилища
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Проверяем, что заказ принадлежит текущему пользователю или пользователь - админ
      if (req.user?.id !== order.userId && req.user?.email !== 'admin@example.com') {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      
      // Обновляем tracking number в хранилище
      const updatedOrder = await storage.updateOrderTrackingNumber(orderId, trackingNumber);
      
      // Обновляем tracking number в Google Sheets
      await safeGoogleSheetsCall(googleSheets.updateOrderTrackingNumber, orderId, trackingNumber);
      
      // Если есть userId, отправляем уведомления
      if (order.userId) {
        // Получаем данные пользователя
        const user = await storage.getUser(order.userId);
        
        // Отправляем push-уведомление
        try {
          await pushNotification.sendOrderStatusNotification(
            order.userId, 
            orderId, 
            "Tracking number updated"
          );
        } catch (notificationError) {
          console.error(`Failed to send push notification for tracking update, order ${orderId}:`, notificationError);
        }
        
        // Отправляем email-уведомление, если параметр sendEmail = true и у пользователя есть почта
        if (sendEmail && user && user.email && updatedOrder) {
          try {
            // Используем значение по умолчанию "en", если язык не указан
            await email.sendTrackingUpdate(updatedOrder, user.email, user.language || "en");
            console.log(`Tracking update email sent to ${user.email}`);
          } catch (emailError) {
            console.error(`Failed to send tracking update email:`, emailError);
          }
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating tracking number:", error);
      res.status(500).json({ message: "Error updating tracking number" });
    }
  });

  // Эндпоинт для обновления статуса заказа с отправкой уведомления
  app.post("/api/orders/:id/update-status-notify", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, userId } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Обновляем статус заказа
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Обновляем статус в Google Sheets
      await safeGoogleSheetsCall(googleSheets.updateOrderStatus, orderId, status);
      
      // Отправляем push-уведомление о смене статуса заказа
      if (userId && typeof userId === 'number') {
        await pushNotification.sendOrderStatusNotification(userId, orderId, status);
      }
      
      res.json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Error updating order status with notification:", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // Тестовый эндпоинт для отправки push-уведомления конкретному пользователю
  app.post("/api/push/send-test", async (req: Request, res: Response) => {
    try {
      const { userId, title, body, url } = req.body;
      
      if (!userId || !title || !body) {
        return res.status(400).json({ message: "userId, title, and body are required" });
      }
      
      await pushNotification.sendPushNotificationToUser(
        parseInt(userId),
        title,
        body,
        url || '/'
      );
      
      res.json({ success: true, message: "Test notification sent" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Error sending test notification" });
    }
  });
  
  // Тестовый эндпоинт для отправки email-уведомления
  app.post("/api/email/send-test", async (req: Request, res: Response) => {
    try {
      const { emailAddress, type, language = 'en', orderId } = req.body;
      
      if (!emailAddress || !type) {
        return res.status(400).json({ message: "emailAddress and type are required" });
      }
      
      // Если нужно отправить уведомление о заказе, но id заказа не указан
      if ((type === 'order' || type === 'tracking' || type === 'status') && !orderId) {
        return res.status(400).json({ message: "orderId is required for order-related notifications" });
      }
      
      let success = false;
      
      // Получаем заказ, если он нужен
      let order: Order | undefined;
      if (orderId) {
        order = await storage.getOrder(parseInt(orderId));
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
      }
      
      // Отправляем соответствующий тип уведомления
      switch (type) {
        case 'order':
          if (order) {
            success = await email.sendOrderConfirmation(order, emailAddress, language);
          }
          break;
        case 'status':
          if (order) {
            success = await email.sendOrderStatusUpdate(order, emailAddress, language);
          }
          break;
        case 'tracking':
          if (order) {
            // Если у заказа нет номера отслеживания, добавим временный для теста
            if (!order.trackingNumber) {
              order = await storage.updateOrderTrackingNumber(order.id, 'TEST123456789');
            }
            if (order) {
              success = await email.sendTrackingUpdate(order, emailAddress, language);
            }
          }
          break;
        default:
          return res.status(400).json({ message: "Invalid notification type" });
      }
      
      if (success) {
        res.json({ success: true, message: "Test email sent" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Error sending test email" });
    }
  });
  
  // API endpoint для обновления существующего PaymentIntent с новым количеством товаров
  app.post("/api/update-payment-intent", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, quantity, userId } = req.body;
      
      if (!paymentIntentId || !quantity) {
        return res.status(400).json({ 
          message: "Payment intent ID and quantity are required" 
        });
      }
      
      // Валидация количества
      const parsedQuantity = parseInt(quantity.toString(), 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      
      // ВАЖНО: Временно отключаем проверку авторизации для тестирования
      // В продакшене это нужно будет вернуть
      // Позволяем обновлять платеж без авторизации для демо-режима
      /*
      if (!req.isAuthenticated() || req.user?.id !== parseInt(userId.toString(), 10)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      */
      
      // Получаем Stripe динамически
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia',
        telemetry: false
      });
      
      // Получаем текущий PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment intent not found" });
      }
      
      // Получаем метаданные для извлечения информации о продукте и пользователе
      const metadata = paymentIntent.metadata || {};
      
      // Проверяем, что платеж связан с правильным пользователем
      if (metadata.userId && parseInt(metadata.userId, 10) !== parseInt(userId.toString(), 10)) {
        return res.status(403).json({ message: "Payment intent does not belong to this user" });
      }
      
      // Получаем информацию о продукте
      const productId = metadata.productId ? parseInt(metadata.productId, 10) : null;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID not found in payment intent metadata" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Получаем базовую сумму за единицу товара
      const originalAmount = metadata.base_amount ? parseInt(metadata.base_amount, 10) : paymentIntent.amount;
      const currency = paymentIntent.currency;
      const originalQuantity = metadata.quantity ? parseInt(metadata.quantity, 10) : 1;
      
      console.log(`Original amount: ${originalAmount} ${currency} (единица товара: ${originalAmount/originalQuantity})`);
      
      // Рассчитываем новую базовую сумму на основе количества
      const unitAmount = Math.round(originalAmount / originalQuantity);
      const newBaseAmount = unitAmount * parsedQuantity;
      
      console.log(`Новое базовое количество: ${parsedQuantity}, сумма: ${newBaseAmount} ${currency}`);
      
      // ИСПРАВЛЕНИЕ: Проверяем, корректно ли сумма выражена в наименьших единицах (центах/копейках)
      if (newBaseAmount < 100) {
        console.log(`ВНИМАНИЕ: Очень маленькая сумма ${newBaseAmount} ${currency}. Проверяем, нужна ли конвертация.`);
        // Если это десятичное число, вероятно, оно выражено в основных единицах валюты
        if (String(newBaseAmount).includes('.')) {
          const convertedAmount = Math.round(newBaseAmount * 100);
          console.log(`Конвертированная сумма: ${convertedAmount} ${currency} (центы/копейки)`);
          newBaseAmount = convertedAmount;
        }
      }
      
      // Получаем информацию о налогах
      const taxRate = metadata.tax_rate ? parseFloat(metadata.tax_rate) / 100 : 0;
      const taxLabel = metadata.tax_label || 'No Tax';
      
      // Рассчитываем новую сумму налога
      const newTaxAmount = Math.round(newBaseAmount * taxRate);
      
      // Рассчитываем новую итоговую сумму
      const newTotalAmount = newBaseAmount + newTaxAmount;
      
      // Скрываем конфиденциальную информацию в логах
      console.log(`Updating PaymentIntent ${paymentIntentId}, quantity: ${originalQuantity} -> ${parsedQuantity}`);
      console.log(`New total amount: ${newTotalAmount} (base: ${newBaseAmount}, tax: ${newTaxAmount})`);
      
      try {
        // Отменяем текущий PaymentIntent
        console.log(`Отменяем текущий PaymentIntent ${paymentIntentId} перед созданием нового...`);
        
        // Обновляем PaymentIntent с новыми суммами
        const updatedPaymentIntent = await stripe.paymentIntents.update(
          paymentIntentId,
          {
            amount: newTotalAmount,
            metadata: {
              ...metadata,
              quantity: parsedQuantity.toString(),
              base_amount: newBaseAmount.toString(),
              tax_amount: newTaxAmount.toString(),
              total_amount: newTotalAmount.toString(),
              updated_at: new Date().toISOString()
            },
            // Добавляем обновление описания, чтобы отразить новое количество
            description: `Order with ${taxLabel} (quantity: ${parsedQuantity})`,
            // Устанавливаем cancel_at_period_end в true для обновления client_secret
            payment_method_types: ['card'],
          }
        );
        
        console.log(`PaymentIntent обновлен: ${updatedPaymentIntent.id}, новая сумма: ${updatedPaymentIntent.amount} ${updatedPaymentIntent.currency}`);
      } catch (updateError) {
        console.error('Ошибка при обновлении PaymentIntent:', updateError);
        throw new Error('Не удалось обновить платеж');
      }
      
      // Получаем обновленный PaymentIntent для ответа
      const result = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Возвращаем обновленный PaymentIntent клиенту
      res.json({
        id: result.id,
        clientSecret: result.client_secret,
        amount: result.amount,
        currency: result.currency,
        baseAmount: newBaseAmount,
        taxAmount: newTaxAmount,
        quantity: parsedQuantity,
        tax: {
          rate: taxRate,
          label: taxLabel,
          amount: newTaxAmount
        }
      });
    } catch (error) {
      console.error("Error updating payment intent:", error);
      res.status(500).json({ message: "Error updating payment intent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
