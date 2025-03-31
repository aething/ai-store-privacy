import { 
  users, type User, type InsertUser, type UpdateUser, 
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder
} from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: UpdateUser): Promise<User | undefined>;
  updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined>;
  generateVerificationToken(userId: number): Promise<string>;
  verifyUserByToken(token: string): Promise<User | undefined>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;
  updateUserStripeSubscriptionId(userId: number, subscriptionId: string | null): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  syncStripeProducts(): Promise<Product[]>;
  getProductByStripeId(stripeId: string): Promise<Product | undefined>;
  getProductsByCountry(country: string | null | undefined): Promise<Product[]>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderByStripePaymentId(stripePaymentId: string): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderStripePaymentId(id: number, paymentId: string): Promise<Order | undefined>;
  updateOrderTrackingNumber(id: number, trackingNumber: string): Promise<Order | undefined>;
  getOrder(id: number): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;

    // Initialize with some products
    const productsList: InsertProduct[] = [
      {
        title: "AI Personal Assistant",
        description: "Your intelligent companion for everyday tasks and reminders. This advanced AI assistant learns your preferences and adapts to your lifestyle, helping you stay organized and efficient.",
        price: 14999, // $149.99
        priceEUR: 13999, // €139.99
        imageUrl: "https://images.unsplash.com/photo-1673203834806-c320f851c9f9?auto=format&fit=crop&w=400&h=300",
        category: "Productivity",
        features: [
          "Advanced voice recognition",
          "Smart home integration",
          "Personalized recommendations",
          "Cloud-based processing",
          "Regular updates and improvements"
        ],
        specifications: [
          "Dimensions: 4.5\" x 4.5\" x 6.3\"",
          "Weight: 420g",
          "Connectivity: Wi-Fi, Bluetooth 5.0",
          "Power: AC Adapter (included)",
          "Warranty: 1 year limited"
        ],
        hardwareInfo: "Module: Jetson Orin Nano 8GB System-on-Module (SoM)\nProcessor: 6-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 1.5 GHz (up to 1.7 GHz in MAXN mode)\nGraphics Processing Unit: NVIDIA Ampere GPU featuring 1024 CUDA cores and 32 Tensor Cores\nMemory: 8 GB 128-bit LPDDR5 with a bandwidth of 102 GB/s (a 50% increase over the previous version)\nStorage: MicroSD slot (included with the Developer Kit) or NVMe SSD via M.2 Key M (optional)\nInterfaces: 4x USB 3.2 Gen 2 ports, 2x CSI camera connectors, DisplayPort 1.4, Gigabit Ethernet, and an M.2 Key E slot\nCooling: Pre-installed thermal solution (heatsink) with an active fan\nPower: Configurable power consumption ranging from 7 to 25 watts, adjustable via power modes",
        softwareInfo: "AI Performance: Up to 67 TOPS (INT8), a 70% improvement over prior version\nGenerative AI: Support for transformer models and LLMs up to 8B parameters (Llama-3.1-8B)\nEnergy Efficiency: 7–25 watts power draw, making it a leader in energy-efficient AI computing\nOperating System: AethingOS 2.5 with real-time capabilities for AI processing\nLanguages: Русский, English, Deutsch, Français, Español, Italiano, 日本語, 中文\nVoice Assistant: Aether Voice Assistant 4.0 with offline processing capabilities\nMedia Services: Spotify, YouTube Music, Netflix, Яндекс.Музыка, and more\nSmart Home: HomeKit, Google Home, Matter, Thread, Яндекс.Умный дом\nUpdates: Automatic OTA updates and self-diagnostic capabilities\nSecurity: AES-256 encryption, biometric voice recognition, secure boot, hardware privacy controls\nAdditional: Full privacy mode with physical microphone disconnection"
      },
      {
        title: "AI Home Hub",
        description: "Control your smart home with advanced voice recognition technology. Connect all your smart devices and manage them from a central hub with intuitive voice commands or the companion app.",
        price: 29999, // $299.99
        priceEUR: 27999, // €279.99
        imageUrl: "https://images.unsplash.com/photo-1677442135146-1d91a759eee8?auto=format&fit=crop&w=400&h=300",
        category: "Smart Home",
        features: [
          "Multi-room audio",
          "Compatible with major smart home ecosystems",
          "Energy usage monitoring",
          "Voice-controlled shopping",
          "Multi-user recognition"
        ],
        specifications: [
          "Dimensions: 5.7\" x 5.7\" x 4.2\"",
          "Weight: 580g",
          "Connectivity: Wi-Fi, Bluetooth 5.0, Zigbee",
          "Power: AC Adapter (included)",
          "Warranty: 2 years limited"
        ],
        hardwareInfo: "Процессор: Hexa-core ARM Cortex-A78 @ 2.4GHz\nПамять: 8GB LPDDR5\nХранение: 128GB UFS 3.1\nДинамики: 4 x 2\" широкополосных динамика + сабвуфер\nМикрофоны: Массив из 8 микрофонов с дальним полем\nДатчики: Температуры, Влажности, Освещенности, Движения, Присутствия\nРадиомодули: Wi-Fi 6E, Bluetooth 5.2, Zigbee, Thread, Matter\nРазъемы: USB-C, HDMI, Ethernet 1Gbps\nЭнергопотребление: 25Вт (макс.), 3Вт (режим ожидания)",
        softwareInfo: "Операционная система: AethingOS Home Edition 3.0\nПоддерживаемые языки: Русский, English, Deutsch, Français, Español, Italiano, 日本語, 中文\nГолосовой помощник: Aether Home Assistant 5.0\nПоддерживаемые сервисы: Все популярные музыкальные и видео сервисы\nПротоколы умного дома: HomeKit, Alexa, Google Home, Matter, Thread, Яндекс.Умный дом\nОбновления: Автоматические OTA-обновления\nБезопасность: Шифрование AES-256, локальная обработка команд\nДополнительно: Встроенный хаб для умного дома с поддержкой до 200 устройств"
      },
      {
        title: "AI Learning Device",
        description: "Personalized education system with adaptive learning algorithms. This device tailors educational content to individual learning styles and progress, making learning more engaging and effective.",
        price: 19999, // $199.99
        priceEUR: 18999, // €189.99
        imageUrl: "https://images.unsplash.com/photo-1655720031554-a929595d5fb0?auto=format&fit=crop&w=400&h=300",
        category: "Education",
        features: [
          "Personalized learning paths",
          "Progress tracking",
          "Interactive lessons",
          "Parent/teacher dashboard",
          "Offline content access"
        ],
        specifications: [
          "Dimensions: 9.5\" x 6.3\" x 0.4\"",
          "Weight: 350g",
          "Connectivity: Wi-Fi, Bluetooth 4.2",
          "Battery: Up to 12 hours",
          "Warranty: 1 year limited"
        ],
        hardwareInfo: "Процессор: Octa-core ARM Cortex-A55 @ 1.8GHz\nГрафика: Mali-G52 MP4\nПамять: 6GB LPDDR4X\nХранение: 128GB UFS 2.1, расширяемое до 1TB через microSD\nЭкран: 10.1\" IPS LCD, 2560x1600, 400 nits, 120Hz\nКамеры: Передняя 8MP, Задняя 13MP с автофокусом\nБатарея: 8000mAh, до 12 часов активного использования\nРазъемы: USB-C (USB 3.1), 3.5мм аудио разъем\nДополнительно: Стилус с 4096 уровнями нажатия",
        softwareInfo: "Операционная система: AethingOS Education Edition 2.0\nПоддерживаемые языки: Русский, English, Deutsch, Français, Español, Italiano, 日本語, 中文\nОбразовательная платформа: Aether Learn 3.0\nПредустановленные предметы: Математика, Физика, Химия, Биология, История, Языки\nРодительский контроль: Полный набор функций с удаленным мониторингом\nРежим преподавателя: Создание и распространение материалов, проведение тестов\nСинхронизация: Облачное хранение с офлайн-доступом\nАналитика: AI-анализ успеваемости и рекомендации по обучению"
      },
      {
        title: "AI Health Monitor",
        description: "Track your health metrics with precision and get AI-powered insights for better wellbeing. Monitor vital signs, activity levels, sleep patterns, and receive personalized recommendations.",
        price: 24999, // $249.99
        priceEUR: 22999, // €229.99
        imageUrl: "https://images.unsplash.com/photo-1686191669169-b42fcd632af0?auto=format&fit=crop&w=600&h=400",
        category: "Health & Fitness",
        features: [
          "24/7 heart rate monitoring",
          "Sleep quality analysis",
          "Stress level tracking",
          "Exercise recognition",
          "Personalized health insights"
        ],
        specifications: [
          "Dimensions: 44mm x 38mm x 10.7mm",
          "Weight: 48g",
          "Connectivity: Bluetooth 5.1, NFC",
          "Battery: Up to 7 days",
          "Water resistance: 5 ATM"
        ],
        hardwareInfo: "Процессор: Dual-core ARM Cortex-M33 @ 96MHz\nПамять: 512KB RAM\nХранение: 32MB Flash\nЭкран: 1.4\" AMOLED, 454x454, 326 PPI, всегда активный\nСенсоры: Оптический пульсометр, Акселерометр, Гироскоп, Альтиметр, Термометр, ЭКГ, Пульсоксиметр\nБатарея: 420mAh, до 7 дней автономной работы\nЗарядка: Беспроводная (Qi), полная зарядка за 1.5 часа\nВодонепроницаемость: 5 ATM (до 50 метров)\nМатериалы: Титановый корпус, Сапфировое стекло, Гипоаллергенный силиконовый ремешок",
        softwareInfo: "Операционная система: AethingOS Health Edition 1.5\nПоддерживаемые языки: Русский, English, Deutsch, Français, Español, Italiano, 日本語, 中文\nОтслеживание активности: 30+ видов спорта с продвинутыми метриками\nМониторинг здоровья: Пульс, ЭКГ, Кислород в крови, Температура тела, Качество сна, Уровень стресса\nОповещения: Уведомления со смартфона, звонки, сообщения, календарь\nПерсонализация: 200+ циферблатов, настраиваемые сложные функции\nСинхронизация: Автоматическая с Aether Health Cloud, экспорт в Apple Health и Google Fit\nАналитика: AI-анализ данных здоровья с персональными рекомендациями"
      }
    ];

    productsList.forEach(product => this.createProduct(product));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      verificationToken: this.generateRandomToken(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      name: null,
      phone: null,
      country: null,
      street: null,
      house: null,
      apartment: null,
      language: "en" // По умолчанию английский язык
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async generateVerificationToken(userId: number): Promise<string> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const token = this.generateRandomToken();
    const updatedUser = { ...user, verificationToken: token };
    this.users.set(userId, updatedUser);
    
    return token;
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async verifyUserByToken(token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
    
    if (!user) return undefined;
    
    const updatedUser = { ...user, isVerified: true, verificationToken: null };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeSubscriptionId(userId: number, subscriptionId: string | null): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, stripeSubscriptionId: subscriptionId || "" };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // Проверяем существование пользователя
    if (!this.users.has(id)) {
      return false;
    }
    
    // Удаляем пользователя
    const deleted = this.users.delete(id);
    
    // Также удаляем все связанные заказы (необязательно, но для чистоты данных)
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === id)
      .map(order => order.id);
    
    userOrders.forEach(orderId => this.orders.delete(orderId));
    
    // Если бы здесь была интеграция с Google Sheets, мы бы отправили уведомление
    // об удалении пользователя в Google Sheets
    
    return deleted;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { 
      id,
      title: insertProduct.title,
      description: insertProduct.description,
      price: insertProduct.price,
      priceEUR: insertProduct.priceEUR || 0, // Должна быть отдельно заданная цена в EUR
      imageUrl: insertProduct.imageUrl,
      category: insertProduct.category,
      features: insertProduct.features || [],
      specifications: insertProduct.specifications || [],
      hardwareInfo: insertProduct.hardwareInfo || null,
      softwareInfo: insertProduct.softwareInfo || null,
      stripeProductId: insertProduct.stripeProductId || null,
      currency: insertProduct.currency || "usd"
    };
    this.products.set(id, product);
    return product;
  }
  
  async syncStripeProducts(): Promise<Product[]> {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      // Получаем все продукты из Stripe
      const stripeProducts = await stripe.products.list({
        active: true,
        expand: ['data.default_price']
      });
      
      console.log(`Received ${stripeProducts.data.length} products from Stripe`);
      
      // Получаем существующие продукты
      const existingProducts = Array.from(this.products.values());
      const updatedProducts: Product[] = [];
      
      // Обновляем существующие и добавляем новые продукты
      for (const stripeProduct of stripeProducts.data) {
        // Ищем продукт в нашей базе по Stripe ID
        let product = existingProducts.find(p => p.stripeProductId === stripeProduct.id);
        
        const price = stripeProduct.default_price;
        const priceAmount = price ? price.unit_amount / 100 : 0; // Stripe хранит цены в центах
        
        console.log(`Product ${stripeProduct.name} - price: ${priceAmount}, currency: ${price?.currency}`);
        
        // Проверяем наличие метаданных для priceEUR
        if (stripeProduct.metadata && stripeProduct.metadata.priceEUR) {
          console.log(`Product ${stripeProduct.name} has EUR price in metadata: ${stripeProduct.metadata.priceEUR}`);
        } else {
          console.log(`Product ${stripeProduct.name} has no EUR price in metadata`);
        }
        
        if (product) {
          // Обновляем существующий продукт
          const updatedProduct = {
            ...product,
            title: stripeProduct.name,
            description: stripeProduct.description || product.description,
            price: priceAmount,
            priceEUR: stripeProduct.metadata?.priceEUR ? Number(stripeProduct.metadata.priceEUR) : product.priceEUR, // Обновляем цену в EUR, если она есть в метаданных
            imageUrl: stripeProduct.images && stripeProduct.images.length > 0 
              ? stripeProduct.images[0] 
              : product.imageUrl,
            category: product.category,
            hardwareInfo: stripeProduct.metadata?.hardwareInfo || product.hardwareInfo,
            softwareInfo: stripeProduct.metadata?.softwareInfo || product.softwareInfo,
            currency: price ? price.currency : 'usd'
          };
          
          this.products.set(product.id, updatedProduct);
          updatedProducts.push(updatedProduct);
          console.log(`Updated existing product: ${updatedProduct.title}`);
          console.log(`  Price USD: ${updatedProduct.price}, Price EUR: ${updatedProduct.priceEUR}, Currency: ${updatedProduct.currency}`);
        } else {
          // Создаем новый продукт
          const newProduct: InsertProduct = {
            title: stripeProduct.name,
            description: stripeProduct.description || 'New product from Stripe',
            price: priceAmount,
            priceEUR: stripeProduct.metadata?.priceEUR ? Number(stripeProduct.metadata.priceEUR) : 0, // Цена в EUR из метаданных
            imageUrl: stripeProduct.images && stripeProduct.images.length > 0 
              ? stripeProduct.images[0] 
              : 'https://placehold.co/600x400?text=Product',
            category: stripeProduct.metadata?.category || 'other',
            currency: price ? price.currency : 'usd',
            features: stripeProduct.metadata?.features ? JSON.parse(stripeProduct.metadata.features) : [],
            specifications: stripeProduct.metadata?.specifications ? JSON.parse(stripeProduct.metadata.specifications) : [],
            hardwareInfo: stripeProduct.metadata?.hardwareInfo || null,
            softwareInfo: stripeProduct.metadata?.softwareInfo || null,
            stripeProductId: stripeProduct.id
          };
          
          const createdProduct = await this.createProduct(newProduct);
          updatedProducts.push(createdProduct);
          console.log(`Created new product: ${createdProduct.title}`);
          console.log(`  Price USD: ${createdProduct.price}, Price EUR: ${createdProduct.priceEUR}, Currency: ${createdProduct.currency}`);
        }
      }
      
      return updatedProducts;
    } catch (error) {
      console.error('Error syncing products with Stripe:', error);
      // В случае ошибки возвращаем текущие продукты
      return Array.from(this.products.values());
    }
  }
  
  async getProductByStripeId(stripeId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.stripeProductId === stripeId
    );
  }
  
  async getProductsByCountry(country: string | null | undefined): Promise<Product[]> {
    // All products are available in all countries in our prototype
    // But in a real implementation, you might filter products based on availability
    return this.getProducts();
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now,
      userId: insertOrder.userId || null,
      productId: insertOrder.productId || null,
      currency: insertOrder.currency || 'usd',
      stripePaymentId: insertOrder.stripePaymentId || null,
      trackingNumber: null,
      couponCode: insertOrder.couponCode || null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getOrderByStripePaymentId(stripePaymentId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.stripePaymentId === stripePaymentId
    );
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderStripePaymentId(id: number, paymentId: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, stripePaymentId: paymentId };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderTrackingNumber(id: number, trackingNumber: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, trackingNumber };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
}

export const storage = new MemStorage();
