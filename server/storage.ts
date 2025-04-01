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

import * as googleSheets from './google-sheets';

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private googleSheetsAvailable: boolean;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.googleSheetsAvailable = false;

    // Initialize with some products
    const productsList: InsertProduct[] = [
      {
        title: "AI-Driven Solutions",
        description: "Built on the NVIDIA Jetson Orin Nano Ecosystem. This powerful AI platform delivers exceptional performance for edge computing applications, enabling real-time processing and analysis.",
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
        softwareInfo: "The AI-driven chatbot solution deployed on this hardware platform utilizes a highly efficient, open-source language model optimized for edge computing, alongside a suite of supporting software components.\n\nLanguage Model:\n• Parameter Size: Approximately 2–7 billion parameters, ensuring a balance between performance and resource efficiency.\n• Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.\n• Context Window: Configurable up to 4096–8192 tokens (~3000–6000 words, equivalent to 10–20 pages of A4 text), enabling robust handling of enterprise knowledge bases.\n• Performance: Capable of generating 5–10 tokens per second during inference, suitable for sequential processing of user queries.\n• Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), allowing unrestricted use, modification, and deployment within organizational networks.\n\nAdditional Software Components:\n• Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities to maximize inference speed on the hardware.\n• Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing, enabling seamless integration of enterprise-specific datasets into the model's knowledge base.\n• Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data from an external storage medium (e.g., microSD or NVMe), supporting up to 500 GB of unstructured text data (approximately 200 million A4 pages).\n• Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet, ensuring data privacy and low-latency responses.\n• Installation Requirements: Compatible with a Linux-based operating system, requiring approximately 20–50 GB of storage for the OS, model weights, and supporting libraries."
      },
      {
        title: "Machine Learning Systems",
        description: "ML Systems Leveraging the NVIDIA DGX Spark. Advanced computing platform designed for enterprise-grade machine learning development and deployment.",
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
        hardwareInfo: `<div class="grid md:grid-cols-2 gap-4">
  <div class="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-600">
    <h3 class="text-lg font-semibold text-blue-800 mb-3">NVIDIA DGX Spark Platform</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Processor:</span> 20-core ARMv9 CPU (10 Cortex-X925 + 10 Cortex-A725)</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">GPU Architecture:</span> NVIDIA GB10 Grace Blackwell Superchip</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Performance:</span> Up to 1 petaflop (1000 TOPS) in FP4 precision</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Cores:</span> 5th-generation Tensor Cores & 4th-generation RT Cores</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-indigo-100 p-4 rounded-lg border-l-4 border-indigo-600">
    <h3 class="text-lg font-semibold text-indigo-800 mb-3">Memory & Storage</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">RAM:</span> 128 GB unified LPDDR5x memory</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Memory Bandwidth:</span> 273 GB/s</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Storage:</span> 1 TB NVMe SSD (base configuration)</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Expandable:</span> Up to 4 TB storage capacity</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-600">
    <h3 class="text-lg font-semibold text-purple-800 mb-3">Connectivity & Interfaces</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">USB:</span> 4× USB4 (Type-C, 40 Gbit/s)</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Display:</span> HDMI 2.1a</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Network:</span> 10GbE Ethernet, Wi-Fi 7, Bluetooth 5.3</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Clustering:</span> ConnectX-7 (200 Gbit/s RDMA)</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
    <h3 class="text-lg font-semibold text-green-800 mb-3">Power & Software</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-green-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Power Consumption:</span> Approximately 170 watts</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-green-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Power Supply:</span> USB-C power delivery</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-green-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Operating System:</span> NVIDIA DGX OS (Ubuntu-based)</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-green-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">AI Stack:</span> Pre-installed NVIDIA AI stack (PyTorch, NeMo, RAPIDS)</span>
      </li>
    </ul>
  </div>
</div>`,
        softwareInfo: "The ML system deployed on this platform employs an advanced, open-source machine learning model optimized for natural language processing and multimodal capabilities, supported by a comprehensive software ecosystem. Below is a depersonalized specification reflecting the system's capabilities without identifying specific vendors or developers:\n\nMachine Learning Model:\n• Parameter Size: Approximately 7–13 billion parameters, balancing computational efficiency with high-quality language understanding and generation.\n• Precision: Supports mixed precision (e.g., FP16 or 4-bit quantization such as INT8/GGUF), enabling operation within 128 GB memory while maximizing throughput.\n• Context Window: Configurable up to 8192–32,768 tokens (~6000–24,000 words, equivalent to 20–80 A4 pages), facilitating extensive contextual analysis for complex queries leveraging a robust knowledge base.\n• Performance: Capable of generating 20–50 tokens per second during inference, supporting real-time text and voice interactions with minimal latency.\n• Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) functionalities, processing audio inputs in real-time (0.5–1 second latency) and synthesizing natural-sounding speech outputs (<200 ms latency).\n• Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), permitting unrestricted use, modification, and commercial deployment.\n\nAdditional Software Components:\n• Inference Engine: A high-performance runtime optimized for GPU acceleration, utilizing advanced tensor computation and parallel processing to enhance inference speed and efficiency.\n• Speech Processing Framework: A modular system for real-time audio capture, speech recognition, and voice synthesis, supporting multiple languages and customizable voice profiles.\n• Knowledge Base Integration: A retrieval-augmented generation (RAG) system capable of indexing and querying up to 1 TB of unstructured data (approximately 400 million A4 pages), enabling dynamic access to enterprise knowledge repositories.\n• Networking Layer: A secure, intranet-compatible server framework (e.g., RESTful or WebSocket API) for handling simultaneous text and voice queries, ensuring data privacy and scalability within organizational networks.\n• Installation Requirements: Compatible with a Linux-based operating system, requiring approximately 50–100 GB of storage for the OS, model weights, speech modules, and supporting libraries."
      },
      {
        title: "Intelligent Automation Systems",
        description: "AI-Driven Platform based on NVIDIA's Founders Edition. Cutting-edge system delivering automated solutions for industrial and enterprise applications.",
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
        hardwareInfo: `<div class="grid md:grid-cols-2 gap-4">
  <div class="bg-rose-100 p-4 rounded-lg border-l-4 border-rose-600">
    <h3 class="text-lg font-semibold text-rose-800 mb-3">NVIDIA Founders Edition</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-rose-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">GPU:</span> NVIDIA RTX™ 6000 Ada Generation</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-rose-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Architecture:</span> Ada Lovelace</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-rose-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">CUDA® Cores:</span> 18,176</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-rose-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Tensor Cores:</span> 568 (4th-generation)</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-rose-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">RT Cores:</span> 142 (3rd-generation)</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-amber-100 p-4 rounded-lg border-l-4 border-amber-600">
    <h3 class="text-lg font-semibold text-amber-800 mb-3">Performance & Memory</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">FP32 Performance:</span> 142 TFLOPS</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Tensor Performance (FP16):</span> 568 TFLOPS</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Memory:</span> 48 GB GDDR6 with ECC</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Memory Bandwidth:</span> 864 GB/s</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-amber-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Memory Interface:</span> 256-bit</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-emerald-100 p-4 rounded-lg border-l-4 border-emerald-600">
    <h3 class="text-lg font-semibold text-emerald-800 mb-3">Storage & Connectivity</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Storage:</span> 2 TB NVMe SSD</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Read Speed:</span> Up to 7,000 MB/s</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Display Outputs:</span> 4× DisplayPort 1.4</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Interface:</span> PCIe 4.0 ×16</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">USB:</span> USB 3.2 Type-C with DisplayPort 1.4a Alt Mode</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-emerald-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Network:</span> 10 Gigabit Ethernet</span>
      </li>
    </ul>
  </div>
  
  <div class="bg-sky-100 p-4 rounded-lg border-l-4 border-sky-600">
    <h3 class="text-lg font-semibold text-sky-800 mb-3">Physical Specifications</h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <div class="bg-sky-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Dimensions:</span> 267mm × 112mm × 52mm</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-sky-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Thermal Design Power:</span> 300W</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-sky-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Cooling:</span> Advanced active cooling solution</span>
      </li>
      <li class="flex items-start gap-2">
        <div class="bg-sky-600 rounded-full w-5 h-5 flex items-center justify-center mt-1">
          <span class="text-white text-xs font-bold">✓</span>
        </div>
        <span><span class="font-medium">Applications:</span> Enterprise automation, RPA, voice assistance</span>
      </li>
    </ul>
  </div>
</div>`,
        softwareInfo: "The AI-driven platform employs an advanced, open-source machine learning model and a suite of supporting software tailored for intelligent automation, text-based interactions, and voice assistance. Below is a depersonalized specification reflecting the system's capabilities without identifying specific vendors or developers:\n\nMachine Learning Model:\n• Parameter Size: Approximately 13–20 billion parameters, providing robust performance for automation, natural language understanding, and generation tasks.\n• Precision: Supports mixed precision (e.g., FP16 or 4-bit quantization like INT8), optimizing memory usage within the 24 GB GDDR6X constraint while maintaining high throughput.\n• Context Window: Configurable up to 16,384–65,536 tokens (~12,000–48,000 words, equivalent to 40–160 A4 pages), enabling deep contextual analysis for automation workflows and multi-turn dialogues.\n• Performance: Capable of generating 30–60 tokens per second during inference, supporting real-time text and voice interactions with low latency.\n• Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with processing latencies of 0.3–0.8 seconds for STT and <150 ms for TTS, facilitating seamless voice-driven automation.\n• Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), allowing unrestricted enterprise customization and deployment.\n\nAdditional Software Components:\n• Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference, optimized for the Ada Lovelace architecture to maximize automation and chatbot performance.\n• Automation Framework: A modular system for designing, executing, and monitoring workflows, capable of integrating with enterprise APIs, robotic process automation (RPA), and IoT devices for end-to-end process automation.\n• Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs and customizable voice outputs for voice assistant functionality.\n• Knowledge Base Integration: A retrieval-augmented generation (RAG) system indexing up to 2 TB of unstructured data (~800 million A4 pages), enabling dynamic access to enterprise repositories for automation and query resolution.\n• Networking Layer: A secure, local server framework (e.g., RESTful or WebSocket API) for handling text, voice, and automation requests within an enterprise intranet, ensuring privacy and scalability.\n• Installation Requirements: Compatible with a Linux-based OS (e.g., Ubuntu), requiring ~50–100 GB of storage for the OS, model weights, automation scripts, and libraries."
      },
      {
        title: "AI Healthcare Analytics",
        description: "Advanced monitoring systems with built-in NVIDIA accelerated computing for real-time health analytics and predictive diagnostics.",
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
      console.log("Starting Stripe products synchronization...");
      console.log("Using Stripe secret key:", process.env.STRIPE_SECRET_KEY ? "Key exists (redacted)" : "Key is missing!");
      
      // Проверка наличия ключа Stripe
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY is not set. Cannot sync products with Stripe.");
        throw new Error("STRIPE_SECRET_KEY is not set");
      }
      
      // Импортируем Stripe с расширенным логированием
      // Используем динамический импорт вместо require
      const Stripe = await import('stripe').then(module => module.default);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-02-24.acacia', // Используем актуальную версию API
        telemetry: false // Отключаем телеметрию для лучшей производительности
      });
      
      console.log("Stripe client initialized. Fetching products...");
      
      // Получаем все продукты из Stripe
      const stripeProducts = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
        limit: 100 // Увеличиваем лимит для получения большего количества продуктов
      });
      
      console.log(`Received ${stripeProducts.data.length} products from Stripe`);
      
      // Логирование полученных продуктов
      if (stripeProducts.data.length > 0) {
        console.log("First Stripe product details:");
        console.log("- ID:", stripeProducts.data[0].id);
        console.log("- Name:", stripeProducts.data[0].name);
        console.log("- Description:", stripeProducts.data[0].description?.substring(0, 50) + "...");
        console.log("- Default price object:", 
          stripeProducts.data[0].default_price ? "Present" : "Missing");
      } else {
        console.log("No products found in Stripe. Please create products in Stripe dashboard first.");
      }
      
      // Получаем существующие продукты
      const existingProducts = Array.from(this.products.values());
      console.log(`Found ${existingProducts.length} existing products in the application`);
      
      const updatedProducts: Product[] = [];
      
      // Обновляем существующие и добавляем новые продукты
      for (const stripeProduct of stripeProducts.data) {
        // Сначала ищем продукт по Stripe ID (точное совпадение)
        let product = existingProducts.find(p => p.stripeProductId === stripeProduct.id);
        
        // Если не найдено по Stripe ID, пробуем найти по названию (неточное совпадение)
        if (!product) {
          const stripeTitle = stripeProduct.name.toLowerCase().trim();
          product = existingProducts.find(p => {
            const productTitle = p.title.toLowerCase().trim();
            return productTitle.includes(stripeTitle) || stripeTitle.includes(productTitle);
          });
          
          if (product) {
            console.log(`Found product match by name: "${product.title}" matches "${stripeProduct.name}"`);
          }
        }
        
        // Получаем цену из Stripe
        const price = stripeProduct.default_price;
        
        // Проверяем наличие цены
        if (!price || !price.unit_amount) {
          console.log(`Warning: Product ${stripeProduct.name} (${stripeProduct.id}) has no price. Skipping.`);
          continue;
        }
        
        const priceAmount = price.unit_amount / 100; // Stripe хранит цены в центах
        
        console.log(`Product ${stripeProduct.name} - price: ${priceAmount}, currency: ${price.currency}`);
        
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
            priceEUR: stripeProduct.metadata?.priceEUR 
              ? Number(stripeProduct.metadata.priceEUR) 
              : product.priceEUR, // Сохраняем оригинальную цену, если нет в метаданных
            imageUrl: stripeProduct.images && stripeProduct.images.length > 0 
              ? stripeProduct.images[0] 
              : product.imageUrl,
            category: stripeProduct.metadata?.category || product.category,
            hardwareInfo: stripeProduct.metadata?.hardwareInfo || product.hardwareInfo,
            softwareInfo: stripeProduct.metadata?.softwareInfo || product.softwareInfo,
            currency: price.currency,
            stripeProductId: stripeProduct.id  // Обязательно обновляем идентификатор продукта Stripe
          };
          
          this.products.set(product.id, updatedProduct);
          updatedProducts.push(updatedProduct);
          console.log(`Updated existing product: ${updatedProduct.title} (ID: ${product.id}, Stripe ID: ${stripeProduct.id})`);
          console.log(`  Price USD: ${updatedProduct.price}, Price EUR: ${updatedProduct.priceEUR}, Currency: ${updatedProduct.currency}`);
        } else {
          // Создаем новый продукт
          const newProduct: InsertProduct = {
            title: stripeProduct.name,
            description: stripeProduct.description || 'New product from Stripe',
            price: priceAmount,
            priceEUR: stripeProduct.metadata?.priceEUR ? Number(stripeProduct.metadata.priceEUR) : priceAmount, // Если нет EUR в метаданных, используем ту же цену что и USD
            imageUrl: stripeProduct.images && stripeProduct.images.length > 0 
              ? stripeProduct.images[0] 
              : 'https://placehold.co/600x400?text=Product',
            category: stripeProduct.metadata?.category || 'other',
            currency: price.currency,
            features: stripeProduct.metadata?.features ? JSON.parse(stripeProduct.metadata.features) : [],
            specifications: stripeProduct.metadata?.specifications ? JSON.parse(stripeProduct.metadata.specifications) : [],
            hardwareInfo: stripeProduct.metadata?.hardwareInfo || null,
            softwareInfo: stripeProduct.metadata?.softwareInfo || null,
            stripeProductId: stripeProduct.id  // Устанавливаем идентификатор продукта Stripe
          };
          
          const createdProduct = await this.createProduct(newProduct);
          updatedProducts.push(createdProduct);
          console.log(`Created new product: ${createdProduct.title} (ID: ${createdProduct.id}, Stripe ID: ${stripeProduct.id})`);
          console.log(`  Price USD: ${createdProduct.price}, Price EUR: ${createdProduct.priceEUR}, Currency: ${createdProduct.currency}`);
        }
      }
      
      // Если у нас нет продуктов из Stripe или есть ошибка получения, создадим базовые продукты
      if (updatedProducts.length === 0) {
        console.log("No products received from Stripe or no updates needed, keeping default products");
        
        // Информация об аппаратном обеспечении для первого продукта
        const hardwareInfo1 = `
Module: Jetson Orin Nano 8GB System-on-Module (SoM).
Processor: 6-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 1.5 GHz (up to 1.7 GHz in MAXN mode).
Graphics Processing Unit: NVIDIA Ampere GPU featuring 1024 CUDA cores and 32 Tensor Cores.
Memory: 8 GB 128-bit LPDDR5 with a bandwidth of 102 GB/s.
Storage: MicroSD slot or NVMe SSD via M.2 Key M (optional).
Interfaces: 4x USB 3.2 Gen 2 ports, 2x CSI camera connectors, DisplayPort 1.4, Gigabit Ethernet, and an M.2 Key E slot.
Cooling: Pre-installed thermal solution (heatsink) with an active fan.
Power: Configurable power consumption ranging from 7 to 25 watts, adjustable via power modes.
`;

        // Информация о программном обеспечении для первого продукта
        const softwareInfo1 = `
Language Model:
Parameter Size: Approximately 2–7 billion parameters, ensuring a balance between performance and resource efficiency.
Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.
Context Window: Configurable up to 4096–8192 tokens (~3000–6000 words, equivalent to 10–20 pages of A4 text).
Performance: Capable of generating 5–10 tokens per second during inference, suitable for sequential processing of user queries.
Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0).

Additional Software Components:
Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities.
Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing.
Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data.
Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet.
`;

        // Информация об аппаратном обеспечении для второго продукта (улучшенная версия)
        const hardwareInfo2 = `
Module: Jetson AGX Orin 32GB SoM
Processor: 12-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 2.2 GHz.
Graphics Processing Unit: NVIDIA Ampere GPU with 2048 CUDA cores and 64 Tensor Cores.
Memory: 32 GB 256-bit LPDDR5 with 204 GB/s bandwidth.
Storage: NVMe SSD via M.2 Key M (included).
Interfaces: Multiple USB 3.2 Gen 2 ports, CSI camera connectors, DisplayPort 1.4, 10 Gigabit Ethernet.
Cooling: Advanced thermal solution with precision-engineered heatsink and dual fans.
Power: Configurable power consumption modes optimized for high-performance computing.
`;

        // Информация о программном обеспечении для второго продукта (улучшенная версия)
        const softwareInfo2 = `
Machine Learning Model:
Parameter Size: Approximately 13–20 billion parameters, providing robust performance for automation and NLP tasks.
Precision: Supports mixed precision (FP16 or INT8), optimizing memory usage within the 32 GB GDDR6X constraint.
Context Window: Configurable up to 16,384–65,536 tokens (~12,000–48,000 words, equivalent to 40–160 A4 pages).
Performance: Capable of generating 30–60 tokens per second during inference, supporting real-time interactions.
Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with low latency processing.

Additional Software Components:
Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference.
Automation Framework: A modular system for designing, executing, and monitoring workflows with enterprise integrations.
Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs.
Knowledge Base Integration: A RAG system indexing up to 2 TB of unstructured data for enterprise access.
Networking Layer: A secure server framework for handling text, voice, and automation requests within an enterprise intranet.
`;

        // Информация об аппаратном обеспечении для третьего продукта (премиум версия)
        const hardwareInfo3 = `
Module: NVIDIA RTX A6000 Enterprise GPU
Processor: Server-grade CPU with 24 cores / 48 threads.
Graphics Processing Unit: NVIDIA Ampere architecture with 10,752 CUDA cores and 336 Tensor Cores.
Memory: 48 GB GDDR6 with ECC, 768 GB/s memory bandwidth.
Storage: 2TB NVMe SSD in RAID configuration.
Interfaces: Multiple high-speed network interfaces, including 100 Gigabit Ethernet.
Cooling: Enterprise-grade liquid cooling solution for maximum performance under sustained loads.
Power: Advanced power management system with redundant power supplies.
`;

        // Информация о программном обеспечении для третьего продукта (премиум версия)
        const softwareInfo3 = `
Enterprise AI System:
Parameter Size: Supports models with 40–70 billion parameters for advanced reasoning and generation capabilities.
Precision: Full FP16/BF16 precision with selective FP32 operations for maximum accuracy in critical workloads.
Context Window: Extended context processing up to 128K tokens for comprehensive document analysis and generation.
Performance: Achieves 100+ tokens per second for real-time inference across multiple concurrent sessions.
Multimodal Processing: Comprehensive vision, audio, and text processing capabilities with real-time integration.

Enterprise Software Suite:
Distributed Inference Engine: Scalable architecture supporting multiple concurrent model instances for enterprise workloads.
Advanced Orchestration: Enterprise-grade workflow management with high-availability features and failover capabilities.
Security Framework: Role-based access control, audit logging, and encrypted communications for sensitive enterprise data.
Integration Platform: Pre-built connectors for major enterprise systems including SAP, Oracle, and Microsoft environments.
Management Console: Comprehensive monitoring, analytics, and management interface for IT administrators.
`;

        // Создаем базовые продукты, если у нас их нет из Stripe
        const defaultProducts = [
          {
            title: "AI Assistant Basic",
            description: "Edge AI solution with NVIDIA Jetson Orin Nano 8GB. Ideal for small business automation and basic AI applications.",
            price: 1799,
            priceEUR: 1599,
            imageUrl: "https://storage.googleapis.com/aething-images/jetson-nano-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA Jetson Orin Nano 8GB SoM",
              "7B Parameter LLM for Edge Deployment",
              "Enterprise Knowledge Base Integration",
              "Low-Latency Text Interactions",
              "Local Data Processing for Privacy"
            ],
            specifications: [
              "6-core ARM CPU @ 1.5 GHz",
              "1024 CUDA cores, 32 Tensor Cores",
              "8 GB LPDDR5 Memory",
              "Up to 40 TOPS AI Performance",
              "7-25W Power Consumption"
            ],
            hardwareInfo: hardwareInfo1,
            softwareInfo: softwareInfo1,
            currency: "usd"
          },
          {
            title: "AI Assistant Professional",
            description: "Advanced edge computing solution with NVIDIA Jetson AGX Orin. Perfect for medium-sized enterprise automation and multimodal AI.",
            price: 3999,
            priceEUR: 3599,
            imageUrl: "https://storage.googleapis.com/aething-images/jetson-orin-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA Jetson AGX Orin 32GB",
              "13-20B Parameter AI Model",
              "Voice Assistant Capabilities",
              "Intelligent Process Automation",
              "Enterprise API Integration"
            ],
            specifications: [
              "12-core ARM CPU @ 2.2 GHz",
              "2048 CUDA cores, 64 Tensor Cores",
              "32 GB LPDDR5 Memory",
              "Up to 200 TOPS AI Performance",
              "Advanced Thermal Management"
            ],
            hardwareInfo: hardwareInfo2,
            softwareInfo: softwareInfo2,
            currency: "usd"
          },
          {
            title: "AI Assistant Enterprise",
            description: "Enterprise-grade AI computing platform with NVIDIA RTX A6000. Designed for large-scale enterprise deployment and advanced AI workloads.",
            price: 9999,
            priceEUR: 8999,
            imageUrl: "https://storage.googleapis.com/aething-images/rtx-a6000-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA RTX A6000 Enterprise GPU",
              "40-70B Parameter Enterprise Models",
              "Multimodal Processing Capabilities",
              "End-to-End Enterprise Automation",
              "Advanced Security & Compliance"
            ],
            specifications: [
              "Server-grade 24-core CPU",
              "10,752 CUDA cores, 336 Tensor Cores",
              "48 GB GDDR6 with ECC",
              "Up to 309.7 TFLOPS (FP32)",
              "Enterprise-grade Cooling Solution"
            ],
            hardwareInfo: hardwareInfo3,
            softwareInfo: softwareInfo3,
            currency: "usd"
          }
        ];
        
        for (const productData of defaultProducts) {
          const createdProduct = await this.createProduct(productData);
          updatedProducts.push(createdProduct);
          console.log(`Created default product: ${createdProduct.title}`);
          console.log(`  Price USD: ${createdProduct.price}, Price EUR: ${createdProduct.priceEUR}`);
        }
      }
      
      return updatedProducts;
    } catch (error) {
      console.error('Error syncing products with Stripe:', error);
      
      // В случае ошибки детализируем ее для облегчения диагностики
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // В случае ошибки и отсутствия продуктов создаем три базовых продукта
      const existingProducts = Array.from(this.products.values());
      
      if (existingProducts.length === 0) {
        console.log("No existing products, creating default products");
        
        // Информация об аппаратном обеспечении для первого продукта
        const hardwareInfo1 = `
Module: Jetson Orin Nano 8GB System-on-Module (SoM).
Processor: 6-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 1.5 GHz (up to 1.7 GHz in MAXN mode).
Graphics Processing Unit: NVIDIA Ampere GPU featuring 1024 CUDA cores and 32 Tensor Cores.
Memory: 8 GB 128-bit LPDDR5 with a bandwidth of 102 GB/s.
Storage: MicroSD slot or NVMe SSD via M.2 Key M (optional).
Interfaces: 4x USB 3.2 Gen 2 ports, 2x CSI camera connectors, DisplayPort 1.4, Gigabit Ethernet, and an M.2 Key E slot.
Cooling: Pre-installed thermal solution (heatsink) with an active fan.
Power: Configurable power consumption ranging from 7 to 25 watts, adjustable via power modes.
`;

        // Информация о программном обеспечении для первого продукта
        const softwareInfo1 = `
Language Model:
Parameter Size: Approximately 2–7 billion parameters, ensuring a balance between performance and resource efficiency.
Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.
Context Window: Configurable up to 4096–8192 tokens (~3000–6000 words, equivalent to 10–20 pages of A4 text).
Performance: Capable of generating 5–10 tokens per second during inference, suitable for sequential processing of user queries.
Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0).

Additional Software Components:
Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities.
Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing.
Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data.
Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet.
`;

        // Информация об аппаратном обеспечении для второго продукта (улучшенная версия)
        const hardwareInfo2 = `
Module: Jetson AGX Orin 32GB SoM
Processor: 12-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 2.2 GHz.
Graphics Processing Unit: NVIDIA Ampere GPU with 2048 CUDA cores and 64 Tensor Cores.
Memory: 32 GB 256-bit LPDDR5 with 204 GB/s bandwidth.
Storage: NVMe SSD via M.2 Key M (included).
Interfaces: Multiple USB 3.2 Gen 2 ports, CSI camera connectors, DisplayPort 1.4, 10 Gigabit Ethernet.
Cooling: Advanced thermal solution with precision-engineered heatsink and dual fans.
Power: Configurable power consumption modes optimized for high-performance computing.
`;

        // Информация о программном обеспечении для второго продукта (улучшенная версия)
        const softwareInfo2 = `
Machine Learning Model:
Parameter Size: Approximately 13–20 billion parameters, providing robust performance for automation and NLP tasks.
Precision: Supports mixed precision (FP16 or INT8), optimizing memory usage within the 32 GB GDDR6X constraint.
Context Window: Configurable up to 16,384–65,536 tokens (~12,000–48,000 words, equivalent to 40–160 A4 pages).
Performance: Capable of generating 30–60 tokens per second during inference, supporting real-time interactions.
Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with low latency processing.

Additional Software Components:
Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference.
Automation Framework: A modular system for designing, executing, and monitoring workflows with enterprise integrations.
Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs.
Knowledge Base Integration: A RAG system indexing up to 2 TB of unstructured data for enterprise access.
Networking Layer: A secure server framework for handling text, voice, and automation requests within an enterprise intranet.
`;

        // Информация об аппаратном обеспечении для третьего продукта (премиум версия)
        const hardwareInfo3 = `
Module: NVIDIA RTX A6000 Enterprise GPU
Processor: Server-grade CPU with 24 cores / 48 threads.
Graphics Processing Unit: NVIDIA Ampere architecture with 10,752 CUDA cores and 336 Tensor Cores.
Memory: 48 GB GDDR6 with ECC, 768 GB/s memory bandwidth.
Storage: 2TB NVMe SSD in RAID configuration.
Interfaces: Multiple high-speed network interfaces, including 100 Gigabit Ethernet.
Cooling: Enterprise-grade liquid cooling solution for maximum performance under sustained loads.
Power: Advanced power management system with redundant power supplies.
`;

        // Информация о программном обеспечении для третьего продукта (премиум версия)
        const softwareInfo3 = `
Enterprise AI System:
Parameter Size: Supports models with 40–70 billion parameters for advanced reasoning and generation capabilities.
Precision: Full FP16/BF16 precision with selective FP32 operations for maximum accuracy in critical workloads.
Context Window: Extended context processing up to 128K tokens for comprehensive document analysis and generation.
Performance: Achieves 100+ tokens per second for real-time inference across multiple concurrent sessions.
Multimodal Processing: Comprehensive vision, audio, and text processing capabilities with real-time integration.

Enterprise Software Suite:
Distributed Inference Engine: Scalable architecture supporting multiple concurrent model instances for enterprise workloads.
Advanced Orchestration: Enterprise-grade workflow management with high-availability features and failover capabilities.
Security Framework: Role-based access control, audit logging, and encrypted communications for sensitive enterprise data.
Integration Platform: Pre-built connectors for major enterprise systems including SAP, Oracle, and Microsoft environments.
Management Console: Comprehensive monitoring, analytics, and management interface for IT administrators.
`;

        // Создаем базовые продукты, если у нас их нет из Stripe
        const defaultProducts = [
          {
            title: "AI Assistant Basic",
            description: "Edge AI solution with NVIDIA Jetson Orin Nano 8GB. Ideal for small business automation and basic AI applications.",
            price: 1799,
            priceEUR: 1599,
            imageUrl: "https://storage.googleapis.com/aething-images/jetson-nano-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA Jetson Orin Nano 8GB SoM",
              "7B Parameter LLM for Edge Deployment",
              "Enterprise Knowledge Base Integration",
              "Low-Latency Text Interactions",
              "Local Data Processing for Privacy"
            ],
            specifications: [
              "6-core ARM CPU @ 1.5 GHz",
              "1024 CUDA cores, 32 Tensor Cores",
              "8 GB LPDDR5 Memory",
              "Up to 40 TOPS AI Performance",
              "7-25W Power Consumption"
            ],
            hardwareInfo: hardwareInfo1,
            softwareInfo: softwareInfo1,
            currency: "usd"
          },
          {
            title: "AI Assistant Professional",
            description: "Advanced edge computing solution with NVIDIA Jetson AGX Orin. Perfect for medium-sized enterprise automation and multimodal AI.",
            price: 3999,
            priceEUR: 3599,
            imageUrl: "https://storage.googleapis.com/aething-images/jetson-orin-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA Jetson AGX Orin 32GB",
              "13-20B Parameter AI Model",
              "Voice Assistant Capabilities",
              "Intelligent Process Automation",
              "Enterprise API Integration"
            ],
            specifications: [
              "12-core ARM CPU @ 2.2 GHz",
              "2048 CUDA cores, 64 Tensor Cores",
              "32 GB LPDDR5 Memory",
              "Up to 200 TOPS AI Performance",
              "Advanced Thermal Management"
            ],
            hardwareInfo: hardwareInfo2,
            softwareInfo: softwareInfo2,
            currency: "usd"
          },
          {
            title: "AI Assistant Enterprise",
            description: "Enterprise-grade AI computing platform with NVIDIA RTX A6000. Designed for large-scale enterprise deployment and advanced AI workloads.",
            price: 9999,
            priceEUR: 8999,
            imageUrl: "https://storage.googleapis.com/aething-images/rtx-a6000-product.jpg",
            category: "AI Solutions",
            features: [
              "NVIDIA RTX A6000 Enterprise GPU",
              "40-70B Parameter Enterprise Models",
              "Multimodal Processing Capabilities",
              "End-to-End Enterprise Automation",
              "Advanced Security & Compliance"
            ],
            specifications: [
              "Server-grade 24-core CPU",
              "10,752 CUDA cores, 336 Tensor Cores",
              "48 GB GDDR6 with ECC",
              "Up to 309.7 TFLOPS (FP32)",
              "Enterprise-grade Cooling Solution"
            ],
            hardwareInfo: hardwareInfo3,
            softwareInfo: softwareInfo3,
            currency: "usd"
          }
        ];
        
        const createdProducts = [];
        
        for (const productData of defaultProducts) {
          const createdProduct = await this.createProduct(productData);
          createdProducts.push(createdProduct);
          console.log(`Created default product: ${createdProduct.title}`);
          console.log(`  Price USD: ${createdProduct.price}, Price EUR: ${createdProduct.priceEUR}`);
        }
        
        return createdProducts;
      }
      
      // Возвращаем существующие продукты, если они есть
      return existingProducts;
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
  
  /**
   * Загружает пользователей из Google Sheets
   */
  async loadUsersFromGoogleSheets(): Promise<void> {
    try {
      const users = await googleSheets.getAllUsers();
      
      // Для всех успешно загруженных пользователей
      for (const user of users) {
        if (user.id) {
          // Если пользователь с таким ID уже существует, обновляем данные, иначе добавляем нового
          if (this.users.has(user.id)) {
            // Сохраняем пароль, так как его нет в Google Sheets
            const existingPassword = this.users.get(user.id)?.password || '';
            this.users.set(user.id, {
              ...user,
              password: existingPassword
            });
          } else {
            // Для нового пользователя устанавливаем пароль по умолчанию, если пользователь "testuser"
            if (user.username === 'testuser') {
              user.password = 'Test123!';
              this.users.set(user.id, user);
            } else {
              // В реальной системе пароли не должны загружаться из Sheets, 
              // но для демонстрации будем считать, что для новых пользователей 
              // надо сбросить пароль или в системе есть другой механизм аутентификации
              user.password = crypto.randomBytes(16).toString('hex'); // Случайный пароль
              this.users.set(user.id, user);
            }
          }
          
          // Обновляем счетчик ID, если загруженный ID больше
          if (user.id >= this.userIdCounter) {
            this.userIdCounter = user.id + 1;
          }
        }
      }
      
      console.log(`Loaded ${users.length} users from Google Sheets to MemStorage`);
      
      // Выводим всех загруженных пользователей для отладки
      console.log("Loaded users:", Array.from(this.users.values()).map(u => ({ 
        id: u.id, 
        username: u.username, 
        email: u.email,
        password: u.password ? '[SET]' : '[NOT SET]'
      })));
    } catch (error) {
      console.error('Error loading users from Google Sheets:', error);
      console.log('Continuing with existing in-memory users');
    }
  }
}

export const storage = new MemStorage();
