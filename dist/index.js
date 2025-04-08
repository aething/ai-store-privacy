var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/google-sheets.ts
import { google } from "googleapis";
function logPrivateKeyDiagnostics(key) {
  try {
    console.log("Private key diagnostics:");
    console.log(`- Length: ${key.length} characters`);
    console.log(`- Contains BEGIN marker: ${key.includes("-----BEGIN PRIVATE KEY-----")}`);
    console.log(`- Contains END marker: ${key.includes("-----END PRIVATE KEY-----")}`);
    console.log(`- Contains newlines: ${key.includes("\n")}`);
    console.log(`- First 10 chars after BEGIN: ${key.indexOf("-----BEGIN PRIVATE KEY-----\n") > -1 ? "[" + key.substring(
      key.indexOf("-----BEGIN PRIVATE KEY-----\n") + 28,
      key.indexOf("-----BEGIN PRIVATE KEY-----\n") + 38
    ) + "]" : "Not found"}`);
    const isPEM = key.startsWith("-----BEGIN PRIVATE KEY-----") && key.endsWith("-----END PRIVATE KEY-----") && key.includes("\n");
    console.log(`- Appears to be valid PEM format: ${isPEM}`);
  } catch (error) {
    console.error("Error in key diagnostics:", error);
  }
}
async function initializeGoogleSheets() {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });
    const existingSheets = spreadsheet.data.sheets?.map(
      (sheet) => sheet.properties?.title
    ) || [];
    const sheetsToAdd = Object.values(SHEETS).filter(
      (sheetName) => !existingSheets.includes(sheetName)
    );
    if (sheetsToAdd.length > 0) {
      const requests = sheetsToAdd.map((sheetName) => {
        return {
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        };
      });
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests
        }
      });
      await initializeHeaders();
    }
    console.log("Google Sheets initialized successfully");
  } catch (error) {
    console.error("Error initializing Google Sheets:", error);
    throw error;
  }
}
async function getAllUsers() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.USERS}!A2:L`
    });
    const rows = response.data.values || [];
    const users2 = [];
    for (const row of rows) {
      if (row.length >= 4) {
        const user = {
          id: parseInt(row[0]),
          username: row[1],
          email: row[2],
          password: "",
          // Пароль не хранится в Google Sheets из соображений безопасности
          isVerified: row[3] === "true",
          name: row[4] || null,
          phone: row[5] || null,
          country: row[6] || null,
          street: row[7] || null,
          house: row[8] || null,
          apartment: row[9] || null,
          stripeCustomerId: row[10] || null,
          stripeSubscriptionId: null
        };
        users2.push(user);
      }
    }
    console.log(`Loaded ${users2.length} users from Google Sheets`);
    return users2;
  } catch (error) {
    console.error("Error loading users from Google Sheets:", error);
    return [];
  }
}
async function initializeHeaders() {
  const userHeaders = [
    "id",
    "username",
    "email",
    "isVerified",
    "name",
    "phone",
    "country",
    "street",
    "house",
    "apartment",
    "stripeCustomerId",
    "createdAt"
  ];
  const orderHeaders = [
    "id",
    "userId",
    "productId",
    "status",
    "amount",
    "currency",
    "stripePaymentId",
    "trackingNumber",
    "couponCode",
    "createdAt"
  ];
  const verificationHeaders = [
    "userId",
    "token",
    "createdAt",
    "expiresAt",
    "isUsed"
  ];
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.USERS}!A1:L1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [userHeaders]
      }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A1:J1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [orderHeaders]
      }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [verificationHeaders]
      }
    });
    console.log("Headers initialized successfully");
  } catch (error) {
    console.error("Error initializing headers:", error);
    throw error;
  }
}
async function saveUser(user) {
  try {
    const values = [
      [
        user.id,
        user.username,
        user.email,
        user.isVerified,
        user.name || "",
        user.phone || "",
        user.country || "",
        user.street || "",
        user.house || "",
        user.apartment || "",
        "",
        // stripeCustomerId
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:L`,
      valueInputOption: "RAW",
      requestBody: {
        values
      }
    });
    console.log(`User saved to Google Sheets: ${user.email}`);
  } catch (error) {
    console.error("Error saving user to Google Sheets:", error);
    throw error;
  }
}
async function updateUser(user) {
  try {
    const userRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:A`
    });
    const rows = userRows.data.values || [];
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == user.id) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex === -1) {
      throw new Error(`User with id ${user.id} not found in Google Sheets`);
    }
    const values = [
      [
        user.id,
        user.username,
        user.email,
        user.isVerified,
        user.name || "",
        user.phone || "",
        user.country || "",
        user.street || "",
        user.house || "",
        user.apartment || "",
        "",
        // stripeCustomerId
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    ];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.USERS}!A${rowIndex}:L${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values
      }
    });
    console.log(`User updated in Google Sheets: ${user.email}`);
  } catch (error) {
    console.error("Error updating user in Google Sheets:", error);
    throw error;
  }
}
async function deleteUser(userId) {
  try {
    const userRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.USERS}!A:A`
    });
    const rows = userRows.data.values || [];
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == userId) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex === -1) {
      throw new Error(`User with id ${userId} not found in Google Sheets`);
    }
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${SHEETS.USERS}!A${rowIndex}:L${rowIndex}`
    });
    console.log(`User deleted from Google Sheets: ID ${userId}`);
  } catch (error) {
    console.error("Error deleting user from Google Sheets:", error);
    throw error;
  }
}
async function saveVerificationToken(userId, token, expiresInHours = 24) {
  try {
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1e3);
    const values = [
      [
        userId,
        token,
        now.toISOString(),
        expiresAt.toISOString(),
        false
      ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A:E`,
      valueInputOption: "RAW",
      requestBody: {
        values
      }
    });
    console.log(`Verification token saved for user ID: ${userId}`);
  } catch (error) {
    console.error("Error saving verification token:", error);
    throw error;
  }
}
async function verifyToken(token) {
  try {
    const tokens = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!A:E`
    });
    const rows = tokens.data.values || [];
    let rowIndex = -1;
    let userId = null;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === token && rows[i][4] === "false") {
        rowIndex = i + 1;
        userId = parseInt(rows[i][0], 10);
        break;
      }
    }
    if (rowIndex === -1 || userId === null) {
      return null;
    }
    const expiresAt = new Date(rows[rowIndex - 1][3]);
    if (expiresAt < /* @__PURE__ */ new Date()) {
      return null;
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.VERIFICATION}!E${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["true"]]
      }
    });
    return userId;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
async function saveOrder(order) {
  try {
    const values = [
      [
        order.id,
        order.userId,
        order.productId,
        order.status,
        order.amount,
        order.currency,
        order.stripePaymentId || "",
        order.trackingNumber || "",
        order.couponCode || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:J`,
      valueInputOption: "RAW",
      requestBody: {
        values
      }
    });
    console.log(`Order saved to Google Sheets: ID ${order.id}`);
  } catch (error) {
    console.error("Error saving order to Google Sheets:", error);
    throw error;
  }
}
async function updateOrderStatus(orderId, status) {
  try {
    const orderRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:A`
    });
    const rows = orderRows.data.values || [];
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == orderId) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex === -1) {
      throw new Error(`Order with id ${orderId} not found in Google Sheets`);
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!D${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]]
      }
    });
    console.log(`Order status updated in Google Sheets: ID ${orderId}, status: ${status}`);
  } catch (error) {
    console.error("Error updating order status in Google Sheets:", error);
    throw error;
  }
}
async function updateOrderTrackingNumber(orderId, trackingNumber) {
  try {
    const orderRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!A:A`
    });
    const rows = orderRows.data.values || [];
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == orderId) {
        rowIndex = i + 1;
        break;
      }
    }
    if (rowIndex === -1) {
      throw new Error(`Order with id ${orderId} not found in Google Sheets`);
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.ORDERS}!H${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[trackingNumber]]
      }
    });
    console.log(`Order tracking number updated in Google Sheets: ID ${orderId}, tracking: ${trackingNumber}`);
  } catch (error) {
    console.error("Error updating order tracking number in Google Sheets:", error);
    throw error;
  }
}
var privateKey, auth, sheets, spreadsheetId, SHEETS;
var init_google_sheets = __esm({
  "server/google-sheets.ts"() {
    "use strict";
    privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
    try {
      if (privateKey.startsWith("-----BEGIN PRIVATE KEY-----") && privateKey.endsWith("-----END PRIVATE KEY-----")) {
        if (!privateKey.includes("\n")) {
          const keyBody = privateKey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").trim();
          privateKey = "-----BEGIN PRIVATE KEY-----\n" + keyBody + "\n-----END PRIVATE KEY-----";
        }
      } else if (privateKey.includes("\\n")) {
        privateKey = privateKey.replace(/\\n/g, "\n");
      } else {
        privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey.trim() + "\n-----END PRIVATE KEY-----";
      }
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----(?!\n)/g, "-----BEGIN PRIVATE KEY-----\n");
      privateKey = privateKey.replace(/(?<!\n)-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----");
      const header = "-----BEGIN PRIVATE KEY-----\n";
      const footer = "\n-----END PRIVATE KEY-----";
      if (privateKey.startsWith("-----BEGIN PRIVATE KEY-----") && privateKey.endsWith("-----END PRIVATE KEY-----")) {
        let body = privateKey.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\n/g, "");
        let formattedBody = "";
        for (let i = 0; i < body.length; i += 64) {
          formattedBody += body.substring(i, i + 64) + "\n";
        }
        privateKey = header + formattedBody + footer;
      }
    } catch (error) {
      console.error("Error formatting private key:", error);
    }
    logPrivateKeyDiagnostics(privateKey);
    console.log("Private key formatting completed.");
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    sheets = google.sheets({ version: "v4", auth });
    spreadsheetId = process.env.GOOGLE_SHEET_ID;
    SHEETS = {
      USERS: "Users",
      ORDERS: "Orders",
      VERIFICATION: "Verification"
    };
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
import crypto from "crypto";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_google_sheets();
    MemStorage = class {
      users;
      products;
      orders;
      userIdCounter;
      productIdCounter;
      orderIdCounter;
      googleSheetsAvailable;
      // Используем Google Sheets как хранилище пользователей
      // Нам не нужно использовать файл для хранения данных, т.к. синхронизация происходит с Google Sheets
      USERS_FILE = "./backups/users_data.json";
      // Оставляем для совместимости с кодом
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.products = /* @__PURE__ */ new Map();
        this.orders = /* @__PURE__ */ new Map();
        this.userIdCounter = 1;
        this.productIdCounter = 1;
        this.orderIdCounter = 1;
        this.googleSheetsAvailable = false;
        this.loadUsersFromBackup();
        const productsList = [
          {
            title: "AI-Driven Solutions",
            description: "Built on the NVIDIA Jetson Orin Nano Ecosystem. This powerful AI platform delivers exceptional performance for edge computing applications, enabling real-time processing and analysis.",
            price: 1499900,
            // $1,499.99
            priceEUR: 1399900,
            // €1,399.99
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
              'Dimensions: 4.5" x 4.5" x 6.3"',
              "Weight: 420g",
              "Connectivity: Wi-Fi, Bluetooth 5.0",
              "Power: AC Adapter (included)",
              "Warranty: 1 year limited"
            ],
            hardwareInfo: "Module: Jetson Orin Nano 8GB System-on-Module (SoM)\nProcessor: 6-core ARM Cortex-A78AE v8.2 64-bit CPU, operating at 1.5 GHz (up to 1.7 GHz in MAXN mode)\nGraphics Processing Unit: NVIDIA Ampere GPU featuring 1024 CUDA cores and 32 Tensor Cores\nMemory: 8 GB 128-bit LPDDR5 with a bandwidth of 102 GB/s (a 50% increase over the previous version)\nStorage: MicroSD slot (included with the Developer Kit) or NVMe SSD via M.2 Key M (optional)\nInterfaces: 4x USB 3.2 Gen 2 ports, 2x CSI camera connectors, DisplayPort 1.4, Gigabit Ethernet, and an M.2 Key E slot\nCooling: Pre-installed thermal solution (heatsink) with an active fan\nPower: Configurable power consumption ranging from 7 to 25 watts, adjustable via power modes",
            softwareInfo: "The AI-driven chatbot solution deployed on this hardware platform utilizes a highly efficient, open-source language model optimized for edge computing, alongside a suite of supporting software components.\n\nLanguage Model:\n\u2022 Parameter Size: Approximately 2\u20137 billion parameters, ensuring a balance between performance and resource efficiency.\n\u2022 Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.\n\u2022 Context Window: Configurable up to 4096\u20138192 tokens (~3000\u20136000 words, equivalent to 10\u201320 pages of A4 text), enabling robust handling of enterprise knowledge bases.\n\u2022 Performance: Capable of generating 5\u201310 tokens per second during inference, suitable for sequential processing of user queries.\n\u2022 Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), allowing unrestricted use, modification, and deployment within organizational networks.\n\nAdditional Software Components:\n\u2022 Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities to maximize inference speed on the hardware.\n\u2022 Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing, enabling seamless integration of enterprise-specific datasets into the model's knowledge base.\n\u2022 Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data from an external storage medium (e.g., microSD or NVMe), supporting up to 500 GB of unstructured text data (approximately 200 million A4 pages).\n\u2022 Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet, ensuring data privacy and low-latency responses.\n\u2022 Installation Requirements: Compatible with a Linux-based operating system, requiring approximately 20\u201350 GB of storage for the OS, model weights, and supporting libraries."
          },
          {
            title: "Machine Learning Systems",
            description: "ML Systems Leveraging the NVIDIA DGX Spark. Advanced computing platform designed for enterprise-grade machine learning development and deployment.",
            price: 2999900,
            // $2,999.99
            priceEUR: 2799900,
            // €2,799.99
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
              'Dimensions: 5.7" x 5.7" x 4.2"',
              "Weight: 580g",
              "Connectivity: Wi-Fi, Bluetooth 5.0, Zigbee",
              "Power: AC Adapter (included)",
              "Warranty: 2 years limited"
            ],
            hardwareInfo: "The Machine Learning Systems (ML Systems) leveraging the NVIDIA DGX Spark utilize a high-performance, compact supercomputing platform tailored for advanced AI workloads. The kit is based on the NVIDIA DGX Spark (previously Project Digits), featuring the GB10 Grace Blackwell Superchip. This includes a 20-core ARMv9 CPU (10 Cortex-X925 + 10 Cortex-A725) and a Blackwell GPU with 5th-generation Tensor Cores and 4th-generation RT Cores, delivering up to 1 petaflop (1000 TOPS) in FP4 precision. It is equipped with 128 GB of unified LPDDR5x memory (273 GB/s bandwidth) and 1 TB NVMe SSD storage in the base configuration (expandable to 4 TB). Connectivity includes 4x USB4 (Type-C, 40 Gbit/s), HDMI 2.1a, 10GbE Ethernet, Wi-Fi 7, Bluetooth 5.3, and a ConnectX-7 (200 Gbit/s RDMA) interface for clustering. Power consumption is approximately 170 watts, supplied via USB-C, and the system operates on NVIDIA DGX OS (Ubuntu-based) with a pre-installed NVIDIA AI stack (PyTorch, NeMo, RAPIDS). This hardware provides a robust foundation for deploying a dual-purpose chatbot and voice assistant system within enterprise or organizational settings.",
            softwareInfo: "The ML system deployed on this platform employs an advanced, open-source machine learning model optimized for natural language processing and multimodal capabilities, supported by a comprehensive software ecosystem. Below is a depersonalized specification reflecting the system's capabilities without identifying specific vendors or developers:\n\nMachine Learning Model:\n\u2022 Parameter Size: Approximately 7\u201313 billion parameters, balancing computational efficiency with high-quality language understanding and generation.\n\u2022 Precision: Supports mixed precision (e.g., FP16 or 4-bit quantization such as INT8/GGUF), enabling operation within 128 GB memory while maximizing throughput.\n\u2022 Context Window: Configurable up to 8192\u201332,768 tokens (~6000\u201324,000 words, equivalent to 20\u201380 A4 pages), facilitating extensive contextual analysis for complex queries leveraging a robust knowledge base.\n\u2022 Performance: Capable of generating 20\u201350 tokens per second during inference, supporting real-time text and voice interactions with minimal latency.\n\u2022 Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) functionalities, processing audio inputs in real-time (0.5\u20131 second latency) and synthesizing natural-sounding speech outputs (<200 ms latency).\n\u2022 Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), permitting unrestricted use, modification, and commercial deployment.\n\nAdditional Software Components:\n\u2022 Inference Engine: A high-performance runtime optimized for GPU acceleration, utilizing advanced tensor computation and parallel processing to enhance inference speed and efficiency.\n\u2022 Speech Processing Framework: A modular system for real-time audio capture, speech recognition, and voice synthesis, supporting multiple languages and customizable voice profiles.\n\u2022 Knowledge Base Integration: A retrieval-augmented generation (RAG) system capable of indexing and querying up to 1 TB of unstructured data (approximately 400 million A4 pages), enabling dynamic access to enterprise knowledge repositories.\n\u2022 Networking Layer: A secure, intranet-compatible server framework (e.g., RESTful or WebSocket API) for handling simultaneous text and voice queries, ensuring data privacy and scalability within organizational networks.\n\u2022 Installation Requirements: Compatible with a Linux-based operating system, requiring approximately 50\u2013100 GB of storage for the OS, model weights, speech modules, and supporting libraries."
          },
          {
            title: "Intelligent Automation Systems",
            description: "AI-Driven Platform based on NVIDIA's Founders Edition. Cutting-edge system delivering automated solutions for industrial and enterprise applications.",
            price: 1999900,
            // $1,999.99
            priceEUR: 1899900,
            // €1,899.99
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
              'Dimensions: 9.5" x 6.3" x 0.4"',
              "Weight: 350g",
              "Connectivity: Wi-Fi, Bluetooth 4.2",
              "Battery: Up to 12 hours",
              "Warranty: 1 year limited"
            ],
            hardwareInfo: "The Intelligent Automation Systems platform is built on NVIDIA's Founders Edition hardware, featuring the NVIDIA RTX\u2122 6000 Ada Generation GPU. This high-performance computing system is powered by an Ada Lovelace architecture with 18,176 CUDA\xAE cores, 568 4th-generation Tensor Cores, and 142 3rd-generation RT cores. It provides 142 TFLOPS of FP32 performance and 568 TFLOPS of Tensor performance in FP16, enabling advanced AI-driven automation capabilities. The system is equipped with 48 GB of GDDR6 memory with ECC support, delivering a bandwidth of 864 GB/s, complemented by a 256-bit memory interface. For storage, it includes a 2 TB NVMe SSD with read speeds up to 7,000 MB/s. Connectivity options include 4\xD7 DisplayPort 1.4 outputs, PCIe 4.0 \xD716 interface, USB 3.2 Type-C with DisplayPort 1.4a Alt Mode, and 10 Gigabit Ethernet. The system operates with a thermal design power (TDP) of 300W, managed by an advanced active cooling solution, and measures 267mm \xD7 112mm \xD7 52mm. This hardware foundation provides exceptional computational resources for enterprise automation tasks, robotic process automation (RPA), and voice assistance functionality.",
            softwareInfo: "The AI-driven platform employs an advanced, open-source machine learning model and a suite of supporting software tailored for intelligent automation, text-based interactions, and voice assistance. Below is a depersonalized specification reflecting the system's capabilities without identifying specific vendors or developers:\n\nMachine Learning Model:\n\u2022 Parameter Size: Approximately 13\u201320 billion parameters, providing robust performance for automation, natural language understanding, and generation tasks.\n\u2022 Precision: Supports mixed precision (e.g., FP16 or 4-bit quantization like INT8), optimizing memory usage within the 24 GB GDDR6X constraint while maintaining high throughput.\n\u2022 Context Window: Configurable up to 16,384\u201365,536 tokens (~12,000\u201348,000 words, equivalent to 40\u2013160 A4 pages), enabling deep contextual analysis for automation workflows and multi-turn dialogues.\n\u2022 Performance: Capable of generating 30\u201360 tokens per second during inference, supporting real-time text and voice interactions with low latency.\n\u2022 Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with processing latencies of 0.3\u20130.8 seconds for STT and <150 ms for TTS, facilitating seamless voice-driven automation.\n\u2022 Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0), allowing unrestricted enterprise customization and deployment.\n\nAdditional Software Components:\n\u2022 Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference, optimized for the Ada Lovelace architecture to maximize automation and chatbot performance.\n\u2022 Automation Framework: A modular system for designing, executing, and monitoring workflows, capable of integrating with enterprise APIs, robotic process automation (RPA), and IoT devices for end-to-end process automation.\n\u2022 Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs and customizable voice outputs for voice assistant functionality.\n\u2022 Knowledge Base Integration: A retrieval-augmented generation (RAG) system indexing up to 2 TB of unstructured data (~800 million A4 pages), enabling dynamic access to enterprise repositories for automation and query resolution.\n\u2022 Networking Layer: A secure, local server framework (e.g., RESTful or WebSocket API) for handling text, voice, and automation requests within an enterprise intranet, ensuring privacy and scalability.\n\u2022 Installation Requirements: Compatible with a Linux-based OS (e.g., Ubuntu), requiring ~50\u2013100 GB of storage for the OS, model weights, automation scripts, and libraries."
          },
          {
            title: "AI Healthcare Analytics",
            description: "Advanced monitoring systems with built-in NVIDIA accelerated computing for real-time health analytics and predictive diagnostics.",
            price: 2499900,
            // $2,499.99
            priceEUR: 2299900,
            // €2,299.99
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
            hardwareInfo: '\u041F\u0440\u043E\u0446\u0435\u0441\u0441\u043E\u0440: Dual-core ARM Cortex-M33 @ 96MHz\n\u041F\u0430\u043C\u044F\u0442\u044C: 512KB RAM\n\u0425\u0440\u0430\u043D\u0435\u043D\u0438\u0435: 32MB Flash\n\u042D\u043A\u0440\u0430\u043D: 1.4" AMOLED, 454x454, 326 PPI, \u0432\u0441\u0435\u0433\u0434\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439\n\u0421\u0435\u043D\u0441\u043E\u0440\u044B: \u041E\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0443\u043B\u044C\u0441\u043E\u043C\u0435\u0442\u0440, \u0410\u043A\u0441\u0435\u043B\u0435\u0440\u043E\u043C\u0435\u0442\u0440, \u0413\u0438\u0440\u043E\u0441\u043A\u043E\u043F, \u0410\u043B\u044C\u0442\u0438\u043C\u0435\u0442\u0440, \u0422\u0435\u0440\u043C\u043E\u043C\u0435\u0442\u0440, \u042D\u041A\u0413, \u041F\u0443\u043B\u044C\u0441\u043E\u043A\u0441\u0438\u043C\u0435\u0442\u0440\n\u0411\u0430\u0442\u0430\u0440\u0435\u044F: 420mAh, \u0434\u043E 7 \u0434\u043D\u0435\u0439 \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u043D\u043E\u0439 \u0440\u0430\u0431\u043E\u0442\u044B\n\u0417\u0430\u0440\u044F\u0434\u043A\u0430: \u0411\u0435\u0441\u043F\u0440\u043E\u0432\u043E\u0434\u043D\u0430\u044F (Qi), \u043F\u043E\u043B\u043D\u0430\u044F \u0437\u0430\u0440\u044F\u0434\u043A\u0430 \u0437\u0430 1.5 \u0447\u0430\u0441\u0430\n\u0412\u043E\u0434\u043E\u043D\u0435\u043F\u0440\u043E\u043D\u0438\u0446\u0430\u0435\u043C\u043E\u0441\u0442\u044C: 5 ATM (\u0434\u043E 50 \u043C\u0435\u0442\u0440\u043E\u0432)\n\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B: \u0422\u0438\u0442\u0430\u043D\u043E\u0432\u044B\u0439 \u043A\u043E\u0440\u043F\u0443\u0441, \u0421\u0430\u043F\u0444\u0438\u0440\u043E\u0432\u043E\u0435 \u0441\u0442\u0435\u043A\u043B\u043E, \u0413\u0438\u043F\u043E\u0430\u043B\u043B\u0435\u0440\u0433\u0435\u043D\u043D\u044B\u0439 \u0441\u0438\u043B\u0438\u043A\u043E\u043D\u043E\u0432\u044B\u0439 \u0440\u0435\u043C\u0435\u0448\u043E\u043A',
            softwareInfo: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430: AethingOS Health Edition 1.5\n\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0435 \u044F\u0437\u044B\u043A\u0438: \u0420\u0443\u0441\u0441\u043A\u0438\u0439, English, Deutsch, Fran\xE7ais, Espa\xF1ol, Italiano, \u65E5\u672C\u8A9E, \u4E2D\u6587\n\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438: 30+ \u0432\u0438\u0434\u043E\u0432 \u0441\u043F\u043E\u0440\u0442\u0430 \u0441 \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u043C\u0438 \u043C\u0435\u0442\u0440\u0438\u043A\u0430\u043C\u0438\n\u041C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F: \u041F\u0443\u043B\u044C\u0441, \u042D\u041A\u0413, \u041A\u0438\u0441\u043B\u043E\u0440\u043E\u0434 \u0432 \u043A\u0440\u043E\u0432\u0438, \u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0442\u0435\u043B\u0430, \u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u043D\u0430, \u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0442\u0440\u0435\u0441\u0441\u0430\n\u041E\u043F\u043E\u0432\u0435\u0449\u0435\u043D\u0438\u044F: \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0441\u043E \u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D\u0430, \u0437\u0432\u043E\u043D\u043A\u0438, \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F, \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C\n\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F: 200+ \u0446\u0438\u0444\u0435\u0440\u0431\u043B\u0430\u0442\u043E\u0432, \u043D\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u043C\u044B\u0435 \u0441\u043B\u043E\u0436\u043D\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438\n\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F: \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441 Aether Health Cloud, \u044D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 Apple Health \u0438 Google Fit\n\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430: AI-\u0430\u043D\u0430\u043B\u0438\u0437 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F \u0441 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F\u043C\u0438"
          }
        ];
        productsList.forEach((product) => this.createProduct(product));
      }
      // User methods
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email === email
        );
      }
      async createUser(insertUser) {
        const id = this.userIdCounter++;
        const user = {
          ...insertUser,
          id,
          isVerified: false,
          verificationToken: this.generateRandomToken(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          // Используем значения из insertUser если они есть, иначе null
          name: insertUser.name || null,
          phone: insertUser.phone || null,
          country: insertUser.country || null,
          // Важно для выбора валюты
          street: insertUser.street || null,
          house: insertUser.house || null,
          apartment: insertUser.apartment || null,
          language: insertUser.language || "en"
          // По умолчанию английский язык
        };
        this.users.set(id, user);
        return user;
      }
      /**
       * Загружает пользователей из резервной копии 
       * Это помогает сохранить данные между перезапусками сервера
       */
      loadUsersFromBackup() {
        console.log("Skipping loading from backup, using Google Sheets for data persistence.");
      }
      /**
       * Сохраняет данные пользователей в резервную копию (не используется)
       * Вместо этого используется синхронизация с Google Sheets
       */
      saveUsersToBackup() {
        console.log("Skipping saving to backup, using Google Sheets for data persistence.");
      }
      async updateUser(id, userData) {
        const user = this.users.get(id);
        if (!user) return void 0;
        console.log("Storage: Updating user", id, "with data:", userData);
        const country = userData.country === "" ? null : userData.country;
        const updatedUser = {
          ...user,
          ...userData,
          country
        };
        console.log("Storage: Updated user data:", updatedUser);
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async updateUserVerification(id, isVerified) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, isVerified };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async generateVerificationToken(userId) {
        const user = this.users.get(userId);
        if (!user) throw new Error("User not found");
        const token = this.generateRandomToken();
        const updatedUser = { ...user, verificationToken: token };
        this.users.set(userId, updatedUser);
        return token;
      }
      generateRandomToken() {
        return crypto.randomBytes(32).toString("hex");
      }
      async verifyUserByToken(token) {
        const user = Array.from(this.users.values()).find(
          (user2) => user2.verificationToken === token
        );
        if (!user) return void 0;
        const updatedUser = { ...user, isVerified: true, verificationToken: null };
        this.users.set(user.id, updatedUser);
        return updatedUser;
      }
      async updateUserStripeCustomerId(userId, customerId) {
        const user = this.users.get(userId);
        if (!user) return void 0;
        const updatedUser = { ...user, stripeCustomerId: customerId };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async updateUserStripeSubscriptionId(userId, subscriptionId) {
        const user = this.users.get(userId);
        if (!user) return void 0;
        const updatedUser = { ...user, stripeSubscriptionId: subscriptionId || "" };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async deleteUser(id) {
        if (!this.users.has(id)) {
          return false;
        }
        const deleted = this.users.delete(id);
        const userOrders = Array.from(this.orders.values()).filter((order) => order.userId === id).map((order) => order.id);
        userOrders.forEach((orderId) => this.orders.delete(orderId));
        return deleted;
      }
      // Product methods
      async getProducts() {
        return Array.from(this.products.values());
      }
      async getProduct(id) {
        if (id === null || id === void 0) return void 0;
        return this.products.get(id);
      }
      async createProduct(insertProduct) {
        const id = this.productIdCounter++;
        const product = {
          id,
          title: insertProduct.title,
          description: insertProduct.description,
          price: insertProduct.price,
          priceEUR: insertProduct.priceEUR || 0,
          // Должна быть отдельно заданная цена в EUR
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
      async syncStripeProducts() {
        try {
          console.log("Starting Stripe products synchronization...");
          console.log("Using Stripe secret key:", process.env.STRIPE_SECRET_KEY ? "Key exists (redacted)" : "Key is missing!");
          if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY is not set. Cannot sync products with Stripe.");
            throw new Error("STRIPE_SECRET_KEY is not set");
          }
          const Stripe2 = await import("stripe").then((module) => module.default);
          const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-02-24.acacia",
            // Используем актуальную версию API
            telemetry: false
            // Отключаем телеметрию для лучшей производительности
          });
          console.log("Stripe client initialized. Fetching products...");
          const stripeProducts = await stripe2.products.list({
            active: true,
            expand: ["data.default_price"],
            limit: 100
            // Увеличиваем лимит для получения большего количества продуктов
          });
          console.log(`Received ${stripeProducts.data.length} products from Stripe`);
          if (stripeProducts.data.length > 0) {
            console.log("First Stripe product details:");
            console.log("- ID:", stripeProducts.data[0].id);
            console.log("- Name:", stripeProducts.data[0].name);
            console.log("- Description:", stripeProducts.data[0].description?.substring(0, 50) + "...");
            console.log(
              "- Default price object:",
              stripeProducts.data[0].default_price ? "Present" : "Missing"
            );
          } else {
            console.log("No products found in Stripe. Please create products in Stripe dashboard first.");
          }
          const existingProducts = Array.from(this.products.values());
          console.log(`Found ${existingProducts.length} existing products in the application`);
          const updatedProducts = [];
          for (const stripeProduct of stripeProducts.data) {
            let product = existingProducts.find((p) => p.stripeProductId === stripeProduct.id);
            if (!product) {
              const stripeTitle = stripeProduct.name.toLowerCase().trim();
              product = existingProducts.find((p) => {
                const productTitle = p.title.toLowerCase().trim();
                return productTitle.includes(stripeTitle) || stripeTitle.includes(productTitle);
              });
              if (product) {
                console.log(`Found product match by name: "${product.title}" matches "${stripeProduct.name}"`);
              }
            }
            const price = stripeProduct.default_price;
            if (!price || !price.unit_amount) {
              console.log(`Warning: Product ${stripeProduct.name} (${stripeProduct.id}) has no price. Skipping.`);
              continue;
            }
            const priceAmount = price.unit_amount / 100;
            console.log(`Product ${stripeProduct.name} - price: ${priceAmount}, currency: ${price.currency}`);
            console.log(`Checking metadata for ${stripeProduct.name}:`, stripeProduct.metadata);
            if (stripeProduct.metadata && stripeProduct.metadata.priceEUR) {
              console.log(`\u2705 Product ${stripeProduct.name} has EUR price in metadata: ${stripeProduct.metadata.priceEUR}`);
            } else {
              console.log(`\u274C Product ${stripeProduct.name} has no EUR price in metadata`);
              try {
                console.log(`Attempting to find EUR price for product ${stripeProduct.id} via Stripe API...`);
                const prices = await stripe2.prices.list({
                  product: stripeProduct.id,
                  active: true,
                  currency: "eur"
                });
                if (prices.data.length > 0) {
                  const eurPrice = prices.data[0];
                  console.log(`\u2705 Found EUR price via Stripe API: ${eurPrice.unit_amount ? eurPrice.unit_amount / 100 : "undefined"}`);
                  if (eurPrice.unit_amount) {
                    stripeProduct.metadata = stripeProduct.metadata || {};
                    stripeProduct.metadata.priceEUR = String(eurPrice.unit_amount / 100);
                    console.log(`\u2705 Updated EUR price in metadata to: ${stripeProduct.metadata.priceEUR}`);
                  }
                } else {
                  console.log(`\u274C No EUR prices found via Stripe API for product ${stripeProduct.id}`);
                }
              } catch (error) {
                console.error(`Error finding EUR price via Stripe API: ${error}`);
              }
            }
            if (product) {
              const updatedProduct = {
                ...product,
                title: stripeProduct.name,
                description: stripeProduct.description || product.description,
                price: priceAmount,
                priceEUR: stripeProduct.metadata?.priceEUR ? Number(stripeProduct.metadata.priceEUR) : product.priceEUR,
                // Сохраняем оригинальную цену, если нет в метаданных
                imageUrl: stripeProduct.images && stripeProduct.images.length > 0 ? stripeProduct.images[0] : product.imageUrl,
                category: stripeProduct.metadata?.category || product.category,
                hardwareInfo: stripeProduct.metadata?.hardwareInfo || product.hardwareInfo,
                softwareInfo: stripeProduct.metadata?.softwareInfo || product.softwareInfo,
                currency: price.currency,
                stripeProductId: stripeProduct.id
                // Обязательно обновляем идентификатор продукта Stripe
              };
              this.products.set(product.id, updatedProduct);
              updatedProducts.push(updatedProduct);
              console.log(`Updated existing product: ${updatedProduct.title} (ID: ${product.id}, Stripe ID: ${stripeProduct.id})`);
              console.log(`  Price USD: ${updatedProduct.price}, Price EUR: ${updatedProduct.priceEUR}, Currency: ${updatedProduct.currency}`);
            } else {
              const newProduct = {
                title: stripeProduct.name,
                description: stripeProduct.description || "New product from Stripe",
                price: priceAmount,
                priceEUR: stripeProduct.metadata?.priceEUR ? Number(stripeProduct.metadata.priceEUR) : priceAmount,
                // Если нет EUR в метаданных, используем ту же цену что и USD
                imageUrl: stripeProduct.images && stripeProduct.images.length > 0 ? stripeProduct.images[0] : "https://placehold.co/600x400?text=Product",
                category: stripeProduct.metadata?.category || "other",
                currency: price.currency,
                features: stripeProduct.metadata?.features ? JSON.parse(stripeProduct.metadata.features) : [],
                specifications: stripeProduct.metadata?.specifications ? JSON.parse(stripeProduct.metadata.specifications) : [],
                hardwareInfo: stripeProduct.metadata?.hardwareInfo || null,
                softwareInfo: stripeProduct.metadata?.softwareInfo || null,
                stripeProductId: stripeProduct.id
                // Устанавливаем идентификатор продукта Stripe
              };
              const createdProduct = await this.createProduct(newProduct);
              updatedProducts.push(createdProduct);
              console.log(`Created new product: ${createdProduct.title} (ID: ${createdProduct.id}, Stripe ID: ${stripeProduct.id})`);
              console.log(`  Price USD: ${createdProduct.price}, Price EUR: ${createdProduct.priceEUR}, Currency: ${createdProduct.currency}`);
            }
          }
          if (updatedProducts.length === 0) {
            console.log("No products received from Stripe or no updates needed, keeping default products");
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
            const softwareInfo1 = `
Language Model:
Parameter Size: Approximately 2\u20137 billion parameters, ensuring a balance between performance and resource efficiency.
Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.
Context Window: Configurable up to 4096\u20138192 tokens (~3000\u20136000 words, equivalent to 10\u201320 pages of A4 text).
Performance: Capable of generating 5\u201310 tokens per second during inference, suitable for sequential processing of user queries.
Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0).

Additional Software Components:
Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities.
Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing.
Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data.
Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet.
`;
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
            const softwareInfo2 = `
Machine Learning Model:
Parameter Size: Approximately 13\u201320 billion parameters, providing robust performance for automation and NLP tasks.
Precision: Supports mixed precision (FP16 or INT8), optimizing memory usage within the 32 GB GDDR6X constraint.
Context Window: Configurable up to 16,384\u201365,536 tokens (~12,000\u201348,000 words, equivalent to 40\u2013160 A4 pages).
Performance: Capable of generating 30\u201360 tokens per second during inference, supporting real-time interactions.
Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with low latency processing.

Additional Software Components:
Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference.
Automation Framework: A modular system for designing, executing, and monitoring workflows with enterprise integrations.
Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs.
Knowledge Base Integration: A RAG system indexing up to 2 TB of unstructured data for enterprise access.
Networking Layer: A secure server framework for handling text, voice, and automation requests within an enterprise intranet.
`;
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
            const softwareInfo3 = `
Enterprise AI System:
Parameter Size: Supports models with 40\u201370 billion parameters for advanced reasoning and generation capabilities.
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
          console.error("Error syncing products with Stripe:", error);
          if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
          const existingProducts = Array.from(this.products.values());
          if (existingProducts.length === 0) {
            console.log("No existing products, creating default products");
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
            const softwareInfo1 = `
Language Model:
Parameter Size: Approximately 2\u20137 billion parameters, ensuring a balance between performance and resource efficiency.
Precision: Supports 4-bit quantization (e.g., INT8 or GGUF format) to fit within the 8 GB RAM constraint while maintaining quality.
Context Window: Configurable up to 4096\u20138192 tokens (~3000\u20136000 words, equivalent to 10\u201320 pages of A4 text).
Performance: Capable of generating 5\u201310 tokens per second during inference, suitable for sequential processing of user queries.
Licensing: Fully open-source with permissive licensing (e.g., MIT or Apache 2.0).

Additional Software Components:
Inference Engine: A lightweight runtime environment optimized for GPU acceleration, leveraging CUDA and tensor core capabilities.
Text Processing Framework: A modular toolkit for tokenization, embedding generation, and text preprocessing.
Knowledge Base Integration: A retrieval-augmented generation (RAG) system that indexes and retrieves relevant textual data.
Networking Layer: A secure, local server framework (e.g., RESTful API) for handling user queries within the enterprise intranet.
`;
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
            const softwareInfo2 = `
Machine Learning Model:
Parameter Size: Approximately 13\u201320 billion parameters, providing robust performance for automation and NLP tasks.
Precision: Supports mixed precision (FP16 or INT8), optimizing memory usage within the 32 GB GDDR6X constraint.
Context Window: Configurable up to 16,384\u201365,536 tokens (~12,000\u201348,000 words, equivalent to 40\u2013160 A4 pages).
Performance: Capable of generating 30\u201360 tokens per second during inference, supporting real-time interactions.
Multimodal Capabilities: Integrates speech-to-text (STT) and text-to-speech (TTS) with low latency processing.

Additional Software Components:
Inference Engine: A GPU-accelerated runtime leveraging CUDA and Tensor Cores for high-speed inference.
Automation Framework: A modular system for designing, executing, and monitoring workflows with enterprise integrations.
Speech Processing Framework: A real-time audio processing suite for STT and TTS, supporting multilingual inputs.
Knowledge Base Integration: A RAG system indexing up to 2 TB of unstructured data for enterprise access.
Networking Layer: A secure server framework for handling text, voice, and automation requests within an enterprise intranet.
`;
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
            const softwareInfo3 = `
Enterprise AI System:
Parameter Size: Supports models with 40\u201370 billion parameters for advanced reasoning and generation capabilities.
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
          return existingProducts;
        }
      }
      async getProductByStripeId(stripeId) {
        return Array.from(this.products.values()).find(
          (product) => product.stripeProductId === stripeId
        );
      }
      async getProductsByCountry(country) {
        return this.getProducts();
      }
      // Order methods
      async createOrder(insertOrder) {
        const id = this.orderIdCounter++;
        const now = /* @__PURE__ */ new Date();
        const order = {
          ...insertOrder,
          id,
          createdAt: now,
          userId: insertOrder.userId || null,
          productId: insertOrder.productId || null,
          currency: insertOrder.currency || "usd",
          stripePaymentId: insertOrder.stripePaymentId || null,
          trackingNumber: null,
          couponCode: insertOrder.couponCode || null
        };
        this.orders.set(id, order);
        return order;
      }
      async getOrdersByUserId(userId) {
        return Array.from(this.orders.values()).filter(
          (order) => order.userId === userId
        );
      }
      async getOrderByStripePaymentId(stripePaymentId) {
        return Array.from(this.orders.values()).find(
          (order) => order.stripePaymentId === stripePaymentId
        );
      }
      async updateOrderStatus(id, status) {
        const order = this.orders.get(id);
        if (!order) return void 0;
        const updatedOrder = { ...order, status };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      async updateOrderStripePaymentId(id, paymentId) {
        const order = this.orders.get(id);
        if (!order) return void 0;
        const updatedOrder = { ...order, stripePaymentId: paymentId };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      async updateOrderTrackingNumber(id, trackingNumber) {
        const order = this.orders.get(id);
        if (!order) return void 0;
        const updatedOrder = { ...order, trackingNumber };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      async getOrder(id) {
        return this.orders.get(id);
      }
      /**
       * Загружает пользователей из Google Sheets
       */
      async loadUsersFromGoogleSheets() {
        try {
          const users2 = await getAllUsers();
          for (const user of users2) {
            if (user.id) {
              if (this.users.has(user.id)) {
                const existingPassword = this.users.get(user.id)?.password || "";
                this.users.set(user.id, {
                  ...user,
                  password: existingPassword
                });
              } else {
                if (user.username === "testuser") {
                  user.password = "Test123!";
                  this.users.set(user.id, user);
                } else {
                  user.password = crypto.randomBytes(16).toString("hex");
                  this.users.set(user.id, user);
                }
              }
              if (user.id >= this.userIdCounter) {
                this.userIdCounter = user.id + 1;
              }
            }
          }
          console.log(`Loaded ${users2.length} users from Google Sheets to MemStorage`);
          console.log("Loaded users:", Array.from(this.users.values()).map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            password: u.password ? "[SET]" : "[NOT SET]"
          })));
        } catch (error) {
          console.error("Error loading users from Google Sheets:", error);
          console.log("Continuing with existing in-memory users");
        }
      }
    };
    storage = new MemStorage();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  name: text("name"),
  phone: text("phone"),
  country: text("country"),
  street: text("street"),
  house: text("house"),
  apartment: text("apartment"),
  language: text("language").default("ru"),
  verificationToken: text("verification_token"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id")
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  // in USD cents
  priceEUR: integer("price_eur").notNull(),
  // in EUR cents
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  features: text("features").array(),
  specifications: text("specifications").array(),
  hardwareInfo: text("hardware_info"),
  softwareInfo: text("software_info"),
  stripeProductId: text("stripe_product_id"),
  currency: text("currency").notNull().default("usd")
  // 'usd' or 'eur'
});
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  // 'usd' or 'eur'
  stripePaymentId: text("stripe_payment_id"),
  trackingNumber: text("tracking_number"),
  couponCode: text("coupon_code"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  verificationToken: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true
}).extend({
  email: z.string().email("Please enter a valid email address")
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});
var updateUserSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  email: true,
  isVerified: true,
  verificationToken: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true
}).extend({
  country: z.string().optional().transform((val) => val || null),
  name: z.string().optional().transform((val) => val || null),
  phone: z.string().optional().transform((val) => val || null),
  street: z.string().optional().transform((val) => val || null),
  house: z.string().optional().transform((val) => val || null),
  apartment: z.string().optional().transform((val) => val || null)
});

// server/routes.ts
init_google_sheets();
import Stripe from "stripe";
import { ZodError } from "zod";

// server/push-notification.ts
init_storage();
import webpush from "web-push";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/push-notification.ts
import * as admin from "firebase-admin";
var firebaseInitialized = false;
var webpushInitialized = false;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Заменяем экранированные новые строки настоящими новыми строками
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n")
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });
    firebaseInitialized = true;
    log("Firebase Admin SDK initialized successfully", "push-notification");
  } catch (error) {
    log(`Failed to initialize Firebase Admin SDK: ${error}`, "push-notification");
  }
} else {
  log("Skipping Firebase Admin SDK initialization: missing required environment variables", "push-notification");
}
if (process.env.FIREBASE_VAPID_PUBLIC_KEY && process.env.FIREBASE_VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      "mailto:contact@example.com",
      // Заменить на действительный email для контакта
      process.env.FIREBASE_VAPID_PUBLIC_KEY,
      process.env.FIREBASE_VAPID_PRIVATE_KEY
    );
    webpushInitialized = true;
    log("Web-push initialized successfully with VAPID keys", "push-notification");
  } catch (error) {
    log(`Failed to initialize web-push: ${error}`, "push-notification");
  }
} else {
  log("Skipping web-push initialization: missing VAPID keys", "push-notification");
}
var pushSubscriptions = /* @__PURE__ */ new Map();
async function registerPushSubscription(req, res) {
  try {
    if (!webpushInitialized) {
      log("Push notification service is not initialized", "push-notification");
      return res.status(503).json({
        error: "Push notification service is unavailable",
        initialized: false
      });
    }
    const subscription = req.body.subscription;
    const userId = req.body.userId;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription object" });
    }
    if (userId) {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userSubscriptions = pushSubscriptions.get(userId) || [];
      const existingIndex = userSubscriptions.findIndex((sub) => sub.endpoint === subscription.endpoint);
      if (existingIndex === -1) {
        userSubscriptions.push({
          ...subscription,
          userId
        });
        pushSubscriptions.set(userId, userSubscriptions);
      }
    }
    log(`Push subscription registered for user ID: ${userId}`, "push-notification");
    return res.status(201).json({
      message: "Subscription added successfully",
      initialized: true
    });
  } catch (error) {
    log(`Error registering push subscription: ${error}`, "push-notification");
    return res.status(500).json({ error: "Failed to register subscription" });
  }
}
async function unregisterPushSubscription(req, res) {
  try {
    if (!webpushInitialized) {
      log("Push notification service is not initialized", "push-notification");
      return res.status(503).json({
        error: "Push notification service is unavailable",
        initialized: false
      });
    }
    const endpoint = req.body.endpoint;
    const userId = req.body.userId;
    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint is required" });
    }
    if (userId) {
      const userSubscriptions = pushSubscriptions.get(userId);
      if (userSubscriptions) {
        const updatedSubscriptions = userSubscriptions.filter((sub) => sub.endpoint !== endpoint);
        if (updatedSubscriptions.length === 0) {
          pushSubscriptions.delete(userId);
        } else {
          pushSubscriptions.set(userId, updatedSubscriptions);
        }
      }
    }
    log(`Push subscription unregistered for user ID: ${userId}`, "push-notification");
    return res.status(200).json({
      message: "Subscription removed successfully",
      initialized: true
    });
  } catch (error) {
    log(`Error unregistering push subscription: ${error}`, "push-notification");
    return res.status(500).json({ error: "Failed to unregister subscription" });
  }
}
async function sendPushNotificationToUser(userId, title, body, url = "/") {
  if (!webpushInitialized) {
    log("Cannot send push notifications: web-push is not initialized", "push-notification");
    return Promise.resolve();
  }
  const userSubscriptions = pushSubscriptions.get(userId);
  if (!userSubscriptions || userSubscriptions.length === 0) {
    log(`No push subscriptions found for user ID: ${userId}`, "push-notification");
    return Promise.resolve();
  }
  const payload = JSON.stringify({
    notification: {
      title,
      body,
      icon: "/icons/app-icon-96x96.png",
      vibrate: [100, 50, 100],
      data: {
        url
      }
    }
  });
  const notificationPromises = userSubscriptions.map((subscription) => {
    return webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: subscription.keys
    }, payload).catch((error) => {
      if (error.statusCode === 410) {
        log(`Subscription is no longer valid: ${subscription.endpoint}`, "push-notification");
      } else {
        log(`Error sending push notification: ${error}`, "push-notification");
      }
    });
  });
  return Promise.all(notificationPromises);
}
async function sendOrderStatusNotification(userId, orderId, newStatus) {
  const statusMessages = {
    "processing": {
      title: "\u0417\u0430\u043A\u0430\u0437 \u043F\u0440\u0438\u043D\u044F\u0442 \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443",
      body: `\u0417\u0430\u043A\u0430\u0437 \u2116${orderId} \u0431\u044B\u043B \u043F\u0440\u0438\u043D\u044F\u0442 \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443. \u041C\u044B \u0443\u0432\u0435\u0434\u043E\u043C\u0438\u043C \u0432\u0430\u0441 \u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\u0445 \u0441\u0442\u0430\u0442\u0443\u0441\u0430.`
    },
    "completed": {
      title: "\u041E\u043F\u043B\u0430\u0442\u0430 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430",
      body: `\u041E\u043F\u043B\u0430\u0442\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 \u2116${orderId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430. \u0417\u0430\u043A\u0430\u0437 \u043F\u0435\u0440\u0435\u0434\u0430\u043D \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443.`
    },
    "shipped": {
      title: "\u0417\u0430\u043A\u0430\u0437 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D",
      body: `\u0417\u0430\u043A\u0430\u0437 \u2116${orderId} \u0431\u044B\u043B \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D. \u041E\u0436\u0438\u0434\u0430\u0439\u0442\u0435 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0443 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F.`
    },
    "delivered": {
      title: "\u0417\u0430\u043A\u0430\u0437 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
      body: `\u0417\u0430\u043A\u0430\u0437 \u2116${orderId} \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D. \u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043F\u043E\u043A\u0443\u043F\u043A\u0443!`
    },
    "cancelled": {
      title: "\u0417\u0430\u043A\u0430\u0437 \u043E\u0442\u043C\u0435\u043D\u0435\u043D",
      body: `\u0417\u0430\u043A\u0430\u0437 \u2116${orderId} \u0431\u044B\u043B \u043E\u0442\u043C\u0435\u043D\u0435\u043D. \u0415\u0441\u043B\u0438 \u0443 \u0432\u0430\u0441 \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u043C\u0438.`
    },
    "failed": {
      title: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u043F\u043B\u0430\u0442\u044B",
      body: `\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u043F\u0440\u0438 \u043E\u043F\u043B\u0430\u0442\u0435 \u0437\u0430\u043A\u0430\u0437\u0430 \u2116${orderId} \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0432\u0430\u0448 \u0441\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B \u0438\u043B\u0438 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u043C\u0438 \u0434\u043B\u044F \u043F\u043E\u043C\u043E\u0449\u0438.`
    }
  };
  const message = statusMessages[newStatus];
  if (!message) {
    log(`No notification message for status: ${newStatus}`, "push-notification");
    return;
  }
  return sendPushNotificationToUser(userId, message.title, message.body, `/account?order=${orderId}`);
}

// server/email.ts
init_storage();
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
async function sendOrderConfirmation(order, email, language = "en") {
  try {
    const product = await storage.getProduct(order.productId || 0);
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }
    const subjects = {
      ru: `\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430 #${order.id}`,
      en: `Order Confirmation #${order.id}`,
      de: `Bestellbest\xE4tigung #${order.id}`,
      es: `Confirmaci\xF3n de pedido #${order.id}`,
      fr: `Confirmation de commande #${order.id}`,
      it: `Conferma dell'ordine #${order.id}`,
      ja: `\u6CE8\u6587\u78BA\u8A8D #${order.id}`,
      zh: `\u8BA2\u5355\u786E\u8BA4 #${order.id}`
    };
    const templates = {
      ru: `
        <h2>\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0432\u0430\u0448 \u0437\u0430\u043A\u0430\u0437!</h2>
        <p>\u041C\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u0432\u0430\u0448 \u0437\u0430\u043A\u0430\u0437 \u0438 \u0441\u0435\u0439\u0447\u0430\u0441 \u043E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u0435\u0433\u043E.</p>
        <h3>\u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430:</h3>
        <ul>
          <li>\u041D\u043E\u043C\u0435\u0440 \u0437\u0430\u043A\u0430\u0437\u0430: ${order.id}</li>
          <li>\u041F\u0440\u043E\u0434\u0443\u043A\u0442: ${product.title}</li>
          <li>\u0421\u0443\u043C\u043C\u0430: ${formatCurrency(order.amount, order.currency)}</li>
          <li>\u0421\u0442\u0430\u0442\u0443\u0441: ${order.status}</li>
        </ul>
        <p>\u0412\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435, \u043A\u043E\u0433\u0434\u0430 \u0432\u0430\u0448 \u0437\u0430\u043A\u0430\u0437 \u0431\u0443\u0434\u0435\u0442 \u0433\u043E\u0442\u043E\u0432 \u043A \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435.</p>
        <p>\u0415\u0441\u043B\u0438 \u0443 \u0432\u0430\u0441 \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0442\u0432\u0435\u0442\u044C\u0442\u0435 \u043D\u0430 \u044D\u0442\u043E \u043F\u0438\u0441\u044C\u043C\u043E \u0438\u043B\u0438 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438.</p>
        <p>\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,<br>AI Store \u043E\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B Aething</p>
      `,
      en: `
        <h2>Thank you for your order!</h2>
        <p>We have received your order and are processing it now.</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Amount: ${formatCurrency(order.amount, order.currency)}</li>
          <li>Status: ${order.status}</li>
        </ul>
        <p>You will receive another notification when your order is ready to ship.</p>
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `
      // Добавьте шаблоны для других языков по аналогии
    };
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });
    console.log(`Order confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}
async function sendOrderStatusUpdate(order, email, language = "en") {
  try {
    const product = await storage.getProduct(order.productId || 0);
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }
    const subjects = {
      ru: `\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 #${order.id}`,
      en: `Order Status Update #${order.id}`,
      de: `Aktualisierung des Bestellstatus #${order.id}`,
      es: `Actualizaci\xF3n del estado del pedido #${order.id}`,
      fr: `Mise \xE0 jour du statut de la commande #${order.id}`,
      it: `Aggiornamento dello stato dell'ordine #${order.id}`,
      ja: `\u6CE8\u6587\u72B6\u6CC1\u306E\u66F4\u65B0 #${order.id}`,
      zh: `\u8BA2\u5355\u72B6\u6001\u66F4\u65B0 #${order.id}`
    };
    const statusTranslations = {
      ru: {
        pending: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438",
        processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
        shipped: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D",
        delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
        cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D"
      },
      en: {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled"
      }
      // Добавьте переводы для других языков
    };
    const translatedStatus = statusTranslations[language] && statusTranslations[language][order.status.toLowerCase()] || statusTranslations.en && statusTranslations.en[order.status.toLowerCase()] || order.status;
    const templates = {
      ru: `
        <h2>\u0421\u0442\u0430\u0442\u0443\u0441 \u0432\u0430\u0448\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D!</h2>
        <p>\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435:</p>
        <h3>\u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430:</h3>
        <ul>
          <li>\u041D\u043E\u043C\u0435\u0440 \u0437\u0430\u043A\u0430\u0437\u0430: ${order.id}</li>
          <li>\u041F\u0440\u043E\u0434\u0443\u043A\u0442: ${product.title}</li>
          <li>\u0421\u0443\u043C\u043C\u0430: ${formatCurrency(order.amount, order.currency)}</li>
          <li>\u041D\u043E\u0432\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441: <strong>${translatedStatus}</strong></li>
          ${order.trackingNumber ? `<li>\u041D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F: ${order.trackingNumber}</li>` : ""}
        </ul>
        ${order.trackingNumber ? `<p>\u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0432\u0430\u0448\u0443 \u043F\u043E\u0441\u044B\u043B\u043A\u0443 \u043F\u043E \u043D\u043E\u043C\u0435\u0440\u0443 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F ${order.trackingNumber}.</p>` : ""}
        <p>\u0415\u0441\u043B\u0438 \u0443 \u0432\u0430\u0441 \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0442\u0432\u0435\u0442\u044C\u0442\u0435 \u043D\u0430 \u044D\u0442\u043E \u043F\u0438\u0441\u044C\u043C\u043E \u0438\u043B\u0438 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438.</p>
        <p>\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,<br>AI Store \u043E\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B Aething</p>
      `,
      en: `
        <h2>Your Order Status Has Been Updated!</h2>
        <p>Here is the latest information about your order:</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Amount: ${formatCurrency(order.amount, order.currency)}</li>
          <li>New status: <strong>${translatedStatus}</strong></li>
          ${order.trackingNumber ? `<li>Tracking number: ${order.trackingNumber}</li>` : ""}
        </ul>
        ${order.trackingNumber ? `<p>You can track your package using the tracking number ${order.trackingNumber}.</p>` : ""}
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `
      // Добавьте шаблоны для других языков по аналогии
    };
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });
    console.log(`Order status update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending order status update email:", error);
    return false;
  }
}
async function sendTrackingUpdate(order, email, language = "ru") {
  try {
    if (!order.trackingNumber) {
      throw new Error("No tracking number provided");
    }
    const product = await storage.getProduct(order.productId || 0);
    if (!product) {
      throw new Error(`Product with id ${order.productId} not found`);
    }
    const subjects = {
      ru: `\u041D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F \u0434\u043B\u044F \u0437\u0430\u043A\u0430\u0437\u0430 #${order.id}`,
      en: `Tracking Number for Order #${order.id}`,
      de: `Sendungsverfolgungsnummer f\xFCr Bestellung #${order.id}`,
      es: `N\xFAmero de seguimiento para el pedido #${order.id}`,
      fr: `Num\xE9ro de suivi pour la commande #${order.id}`,
      it: `Numero di tracciamento per l'ordine #${order.id}`,
      ja: `\u6CE8\u6587\u306E\u8FFD\u8DE1\u756A\u53F7 #${order.id}`,
      zh: `\u8BA2\u5355\u7684\u8DDF\u8E2A\u53F7 #${order.id}`
    };
    const templates = {
      ru: `
        <h2>\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D!</h2>
        <p>\u0414\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u043D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F:</p>
        <h3>\u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430:</h3>
        <ul>
          <li>\u041D\u043E\u043C\u0435\u0440 \u0437\u0430\u043A\u0430\u0437\u0430: ${order.id}</li>
          <li>\u041F\u0440\u043E\u0434\u0443\u043A\u0442: ${product.title}</li>
          <li>\u041D\u043E\u043C\u0435\u0440 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F: <strong>${order.trackingNumber}</strong></li>
        </ul>
        <p>\u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0432\u0430\u0448\u0443 \u043F\u043E\u0441\u044B\u043B\u043A\u0443 \u043F\u043E \u0441\u0441\u044B\u043B\u043A\u0435: <a href="https://www.aftership.com/track?tracking_number=${order.trackingNumber}">\u041E\u0442\u0441\u043B\u0435\u0434\u0438\u0442\u044C \u043F\u043E\u0441\u044B\u043B\u043A\u0443</a></p>
        <p>\u0415\u0441\u043B\u0438 \u0443 \u0432\u0430\u0441 \u0432\u043E\u0437\u043D\u0438\u043A\u043B\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0442\u0432\u0435\u0442\u044C\u0442\u0435 \u043D\u0430 \u044D\u0442\u043E \u043F\u0438\u0441\u044C\u043C\u043E \u0438\u043B\u0438 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438.</p>
        <p>\u0421 \u0443\u0432\u0430\u0436\u0435\u043D\u0438\u0435\u043C,<br>AI Store \u043E\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B Aething</p>
      `,
      en: `
        <h2>Your Order Has Been Shipped!</h2>
        <p>A tracking number has been added to your order:</p>
        <h3>Order details:</h3>
        <ul>
          <li>Order number: ${order.id}</li>
          <li>Product: ${product.title}</li>
          <li>Tracking number: <strong>${order.trackingNumber}</strong></li>
        </ul>
        <p>You can track your package using this link: <a href="https://www.aftership.com/track?tracking_number=${order.trackingNumber}">Track Package</a></p>
        <p>If you have any questions, please reply to this email or contact our support team.</p>
        <p>Best regards,<br>AI Store by Aething Team</p>
      `
      // Добавьте шаблоны для других языков по аналогии
    };
    const emailTemplate = templates[language] || templates.en;
    const emailSubject = subjects[language] || subjects.en;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailSubject,
      html: emailTemplate
    });
    console.log(`Tracking number update email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending tracking number update email:", error);
    return false;
  }
}
function formatCurrency(amount, currency = "usd") {
  const value = amount / 100;
  const currencyCode = currency.toLowerCase();
  if (currencyCode === "eur") {
    return `\u20AC${value.toFixed(2)}`;
  } else if (currencyCode === "gbp") {
    return `\xA3${value.toFixed(2)}`;
  } else if (currencyCode === "jpy") {
    return `\xA5${Math.round(value)}`;
  } else if (currencyCode === "rub") {
    return `\u20BD${value.toFixed(2)}`;
  } else if (currencyCode === "cny" || currencyCode === "rmb") {
    return `\xA5${value.toFixed(2)}`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

// server/routes.ts
import nodemailer2 from "nodemailer";

// server/routes/tax-debug.ts
import { Router } from "express";

// shared/tax.ts
var EU_COUNTRIES = [
  "AT",
  // Austria
  "BE",
  // Belgium
  "BG",
  // Bulgaria
  "HR",
  // Croatia
  "CY",
  // Cyprus
  "CZ",
  // Czech Republic
  "DK",
  // Denmark
  "EE",
  // Estonia
  "FI",
  // Finland
  "FR",
  // France
  "DE",
  // Germany
  "GR",
  // Greece
  "HU",
  // Hungary
  "IE",
  // Ireland
  "IT",
  // Italy
  "LV",
  // Latvia
  "LT",
  // Lithuania
  "LU",
  // Luxembourg
  "MT",
  // Malta
  "NL",
  // Netherlands
  "PL",
  // Poland
  "PT",
  // Portugal
  "RO",
  // Romania
  "SK",
  // Slovakia
  "SI",
  // Slovenia
  "ES",
  // Spain
  "SE"
  // Sweden
];
function isEUCountry(country) {
  return EU_COUNTRIES.includes(country.toUpperCase());
}
var EU_VAT_RATES = {
  "AT": 0.2,
  // Austria - 20%
  "BE": 0.21,
  // Belgium - 21%
  "BG": 0.2,
  // Bulgaria - 20%
  "HR": 0.25,
  // Croatia - 25%
  "CY": 0.19,
  // Cyprus - 19%
  "CZ": 0.21,
  // Czech Republic - 21%
  "DK": 0.25,
  // Denmark - 25%
  "EE": 0.2,
  // Estonia - 20%
  "FI": 0.24,
  // Finland - 24%
  "FR": 0.2,
  // France - 20%
  "DE": 0.19,
  // Germany - 19%
  "GR": 0.24,
  // Greece - 24%
  "HU": 0.27,
  // Hungary - 27%
  "IE": 0.23,
  // Ireland - 23%
  "IT": 0.22,
  // Italy - 22%
  "LV": 0.21,
  // Latvia - 21%
  "LT": 0.21,
  // Lithuania - 21%
  "LU": 0.17,
  // Luxembourg - 17%
  "MT": 0.18,
  // Malta - 18%
  "NL": 0.21,
  // Netherlands - 21%
  "PL": 0.23,
  // Poland - 23%
  "PT": 0.23,
  // Portugal - 23%
  "RO": 0.19,
  // Romania - 19%
  "SK": 0.2,
  // Slovakia - 20%
  "SI": 0.22,
  // Slovenia - 22%
  "ES": 0.21,
  // Spain - 21%
  "SE": 0.25
  // Sweden - 25%
};
var US_TAX_RATE = 0;
function getTaxRateForCountry(country) {
  const countryCode = country.toUpperCase();
  if (isEUCountry(countryCode)) {
    return EU_VAT_RATES[countryCode] || 0.2;
  }
  if (countryCode === "US") {
    return US_TAX_RATE;
  }
  return 0;
}
function calculateTaxRate(country) {
  console.log(`[TAX DEBUG] calculateTaxRate called with country: ${country}`);
  if (!country) {
    console.log(`[TAX DEBUG] No country provided, returning default rate`);
    return { rate: 0, label: "No VAT/Tax" };
  }
  const countryCode = country.toUpperCase();
  console.log(`[TAX DEBUG] Processing country code: ${countryCode}`);
  if (countryCode === "US") {
    return { rate: 0, label: "No Sales Tax" };
  }
  const taxRate = getTaxRateForCountry(countryCode);
  let taxLabel = "";
  if (countryCode === "DE") {
    taxLabel = `MwSt. ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "FR") {
    taxLabel = `TVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "IT") {
    taxLabel = `IVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "ES") {
    taxLabel = `IVA ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "AT") {
    taxLabel = `MwSt. ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "BE") {
    taxLabel = `BTW ${(taxRate * 100).toFixed(0)}%`;
  } else if (countryCode === "NL") {
    taxLabel = `BTW ${(taxRate * 100).toFixed(0)}%`;
  } else {
    taxLabel = `VAT ${(taxRate * 100).toFixed(0)}%`;
  }
  return { rate: taxRate, label: taxLabel };
}

// server/routes/tax-debug.ts
var router = Router();
router.post("/api/tax-debug", (req, res) => {
  const { country } = req.body;
  console.log(`[TAX DEBUG] Received country in POST body: ${country}`);
  try {
    if (!country) {
      return res.status(400).json({
        error: "Country is required",
        success: false
      });
    }
    const taxInfo = calculateTaxRate(country);
    console.log(`[TAX DEBUG] Calculated tax info for ${country}:`, taxInfo);
    return res.json({
      country,
      taxInfo,
      success: true
    });
  } catch (error) {
    console.error(`[TAX DEBUG] Error calculating tax for ${country}:`, error);
    return res.status(500).json({
      error: String(error),
      country,
      success: false
    });
  }
});
router.get("/:country", (req, res) => {
  const { country } = req.params;
  console.log(`[TAX DEBUG] Received country in URL: ${country}`);
  try {
    const taxInfo = calculateTaxRate(country);
    console.log(`[TAX DEBUG] Calculated tax info for ${country}:`, taxInfo);
    return res.json({
      country,
      taxInfo,
      success: true
    });
  } catch (error) {
    console.error(`[TAX DEBUG] Error calculating tax for ${country}:`, error);
    return res.status(500).json({
      error: String(error),
      country,
      success: false
    });
  }
});
router.get("/all", (_req, res) => {
  const countries = ["DE", "FR", "IT", "ES", "AT", "BE", "NL", "FI", "GB", "US"];
  const results = {};
  try {
    for (const country of countries) {
      results[country] = calculateTaxRate(country);
    }
    return res.json({
      results,
      success: true
    });
  } catch (error) {
    console.error("[TAX DEBUG] Error testing all countries:", error);
    return res.status(500).json({
      error: String(error),
      success: false
    });
  }
});
var tax_debug_default = router;

// server/logs.ts
import fs2 from "fs";
import path3 from "path";
var LOGS_DIR = path3.join(process.cwd(), "logs");
var MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;
if (!fs2.existsSync(LOGS_DIR)) {
  fs2.mkdirSync(LOGS_DIR, { recursive: true });
}
var saveClientLogs = async (req, res) => {
  try {
    const logs = req.body;
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: "Invalid logs data" });
    }
    const logsByType = {};
    logs.forEach((log2) => {
      const type = log2.type || "unknown";
      if (!logsByType[type]) {
        logsByType[type] = [];
      }
      log2.clientInfo = {
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown"
      };
      logsByType[type].push(log2);
    });
    for (const [type, typeLogs] of Object.entries(logsByType)) {
      const logFilePath = path3.join(LOGS_DIR, `${type}.log`);
      let filePath = logFilePath;
      if (fs2.existsSync(logFilePath)) {
        const stats = fs2.statSync(logFilePath);
        if (stats.size > MAX_LOG_FILE_SIZE) {
          const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
          filePath = path3.join(LOGS_DIR, `${type}-${timestamp2}.log`);
        }
      }
      const logData = typeLogs.map((log2) => JSON.stringify(log2)).join("\n") + "\n";
      fs2.appendFileSync(filePath, logData, "utf8");
    }
    const criticalLogs = logs.filter(
      (log2) => log2.type === "app_crash" || log2.type === "payment_error" || log2.type === "error" && log2.additionalData?.isCritical
    );
    if (criticalLogs.length > 0) {
      console.warn(`[CRITICAL LOGS] Received ${criticalLogs.length} critical errors`);
    }
    return res.status(200).json({ success: true, count: logs.length });
  } catch (error) {
    console.error("Error saving logs:", error);
    return res.status(500).json({ message: "Failed to save logs" });
  }
};
var getLogsStats = async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const stats = {};
    const files = fs2.readdirSync(LOGS_DIR);
    for (const file of files) {
      if (!file.endsWith(".log")) continue;
      const filePath = path3.join(LOGS_DIR, file);
      const stat = fs2.statSync(filePath);
      const logType = file.split("-")[0].replace(".log", "");
      if (!stats[logType]) {
        stats[logType] = { count: 0, lastUpdated: null };
      }
      const content = fs2.readFileSync(filePath, "utf8");
      const lines = content.split("\n").filter((line) => line.trim().length > 0);
      stats[logType].count += lines.length;
      if (!stats[logType].lastUpdated || stat.mtime > stats[logType].lastUpdated) {
        stats[logType].lastUpdated = stat.mtime;
      }
    }
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting logs stats:", error);
    return res.status(500).json({ message: "Failed to get logs stats" });
  }
};
var getRecentLogs = async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const logFiles = fs2.readdirSync(LOGS_DIR).filter((file) => file.startsWith(`${type}.`) || file.startsWith(`${type}-`)).sort((a, b) => {
      const statA = fs2.statSync(path3.join(LOGS_DIR, a));
      const statB = fs2.statSync(path3.join(LOGS_DIR, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    if (logFiles.length === 0) {
      return res.status(404).json({ message: `No logs found for type: ${type}` });
    }
    const latestFile = logFiles[0];
    const filePath = path3.join(LOGS_DIR, latestFile);
    const content = fs2.readFileSync(filePath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim().length > 0).map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { raw: line, parseError: true };
      }
    });
    const recentLogs = lines.slice(-limit);
    return res.status(200).json({
      type,
      count: recentLogs.length,
      total: lines.length,
      logs: recentLogs
    });
  } catch (error) {
    console.error(`Error getting logs for type ${req.params.type}:`, error);
    return res.status(500).json({ message: "Failed to get logs" });
  }
};

// server/routes.ts
function getFullCountryName(countryCode) {
  const countryMap = {
    "AT": "Austria",
    "BE": "Belgium",
    "BG": "Bulgaria",
    "HR": "Croatia",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "EE": "Estonia",
    "FI": "Finland",
    "FR": "France",
    "DE": "Germany",
    "GR": "Greece",
    "HU": "Hungary",
    "IE": "Ireland",
    "IT": "Italy",
    "LV": "Latvia",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MT": "Malta",
    "NL": "Netherlands",
    "PL": "Poland",
    "PT": "Portugal",
    "RO": "Romania",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "ES": "Spain",
    "SE": "Sweden",
    "GB": "United Kingdom",
    "US": "United States"
  };
  return countryMap[countryCode] || countryCode;
}
var stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(stripeSecretKey);
function shouldUseEUR(country) {
  if (!country) return false;
  const eurCountryCodes = [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE"
  ];
  const eurCountries = [
    "Austria",
    "Belgium",
    "Bulgaria",
    "Croatia",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Ireland",
    "Italy",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden"
  ];
  if (country.length === 2) {
    return eurCountryCodes.includes(country.toUpperCase());
  }
  return eurCountries.includes(country);
}
async function syncProductsWithStripeBackend() {
  try {
    console.log("Starting automatic Stripe products synchronization...");
    const products2 = await storage.syncStripeProducts();
    console.log(`Successfully synchronized ${products2.length} products with Stripe`);
    return products2;
  } catch (error) {
    console.error("Error during automatic Stripe product synchronization:", error);
    return [];
  }
}
var SYNC_INTERVAL = 12 * 60 * 60 * 1e3;
async function registerRoutes(app2) {
  let googleSheetsAvailable = false;
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
  if (process.env.STRIPE_SECRET_KEY) {
    setInterval(async () => {
      try {
        console.log(`Running scheduled Stripe product synchronization (interval: ${SYNC_INTERVAL / 1e3 / 60 / 60} hours)...`);
        await syncProductsWithStripeBackend();
      } catch (error) {
        console.error("Error during scheduled Stripe product synchronization:", error);
      }
    }, SYNC_INTERVAL);
    console.log(`Scheduled Stripe product synchronization every ${SYNC_INTERVAL / 1e3 / 60 / 60} hours`);
  }
  try {
    await initializeGoogleSheets();
    console.log("Google Sheets initialized successfully");
    googleSheetsAvailable = true;
    await storage.loadUsersFromGoogleSheets();
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    console.log("Continuing without Google Sheets integration. User and order data will only be stored in memory.");
  }
  const safeGoogleSheetsCall = async (operation, ...args) => {
    if (!googleSheetsAvailable) return;
    try {
      await operation(...args);
    } catch (error) {
      console.error(`Error during Google Sheets operation: ${error}`);
    }
  };
  app2.get("/api/users/me", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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
  app2.post("/api/users/logout", (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not logged in" });
      }
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
  app2.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (!userData.country) {
        return res.status(400).json({ message: "Country selection is required" });
      }
      const user = await storage.createUser(userData);
      const token = await storage.generateVerificationToken(user.id);
      await safeGoogleSheetsCall(saveUser, user);
      await safeGoogleSheetsCall(saveVerificationToken, user.id, token);
      if (req.session) {
        req.session.userId = user.id;
      }
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
  app2.post("/api/users/login", async (req, res) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Invalid request body" });
      }
      const { username, password } = req.body;
      if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Username and password are required and must be strings" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (req.session) {
        req.session.userId = user.id;
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
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log("Update user request for ID:", userId, "with data:", req.body);
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        console.log("Unauthorized update attempt. Auth status:", req.isAuthenticated(), "User:", req.user?.id);
        return res.status(401).json({ message: "Unauthorized" });
      }
      try {
        const userData = updateUserSchema.parse(req.body);
        console.log("Data after validation:", userData);
        const currentUser = await storage.getUser(userId);
        if (!currentUser) {
          return res.status(404).json({ message: "User not found" });
        }
        if (userData.country && userData.country !== currentUser.country) {
          console.log(`Attempt to change country from ${currentUser.country} to ${userData.country}`);
          userData.country = currentUser.country;
        }
        console.log("Data after country protection:", userData);
        const updatedUser = await storage.updateUser(userId, userData);
        if (!updatedUser) {
          console.log("User not found:", userId);
          return res.status(404).json({ message: "User not found" });
        }
        await safeGoogleSheetsCall(updateUser, updatedUser);
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
        throw validationError;
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error: String(error) });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      await safeGoogleSheetsCall(deleteUser, userId);
      req.logout(() => {
      });
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user account" });
    }
  });
  app2.get("/api/users/:id/verify", async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      const verifiedUser = await storage.verifyUserByToken(token);
      if (!verifiedUser) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      if (googleSheetsAvailable) {
        try {
          const gsUserId = await verifyToken(token);
          if (gsUserId) {
            await safeGoogleSheetsCall(updateUser, verifiedUser);
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
  app2.post("/api/users/send-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
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
      await safeGoogleSheetsCall(saveVerificationToken, user.id, token);
      try {
        await nodemailer2.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        }).sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #333;">Email Verification</h2>
              <p>Hello ${user.name || user.username},</p>
              <p>Thank you for registering. Please click the button below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${req.protocol}://${req.get("host")}/api/users/${user.id}/verify?token=${token}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Verify Email
                </a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #f8f8f8; padding: 10px; border-radius: 4px;">
                ${req.protocol}://${req.get("host")}/api/users/${user.id}/verify?token=${token}
              </p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>Best regards,<br>AI Store by Aething Team</p>
            </div>
          `
        });
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
      }
      res.json({
        message: "Verification email sent",
        token
        // for testing only
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Error sending verification email" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const country = req.query.country;
      const effectiveCountry = country || (req.isAuthenticated() ? req.user?.country : void 0);
      const syncWithStripe = req.query.sync === "true";
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;
      if (syncWithStripe) {
        await storage.syncStripeProducts();
      }
      let products2 = effectiveCountry ? await storage.getProductsByCountry(effectiveCountry) : await storage.getProducts();
      if (products2.length > 0 && sortBy === "price") {
        const shouldUseEuro = effectiveCountry ? shouldUseEUR(effectiveCountry) : false;
        const currency = shouldUseEuro ? "EUR" : "USD";
      }
      if (sortBy) {
        products2 = [...products2].sort((a, b) => {
          let valueA, valueB;
          if (sortBy === "price") {
            if (effectiveCountry && shouldUseEUR(effectiveCountry)) {
              valueA = a.priceEUR;
              valueB = b.priceEUR;
            } else {
              valueA = a.price;
              valueB = b.price;
            }
          } else if (sortBy === "title") {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
          } else if (sortBy === "category") {
            valueA = a.category.toLowerCase();
            valueB = b.category.toLowerCase();
          } else {
            valueA = a.id;
            valueB = b.id;
          }
          const multiplier = sortOrder === "desc" ? -1 : 1;
          if (typeof valueA === "string") {
            return multiplier * valueA.localeCompare(valueB);
          } else {
            return multiplier * (valueA - valueB);
          }
        });
      }
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  app2.post("/api/stripe/create-price", async (req, res) => {
    try {
      const { productId, currency = "usd", amount, recurring = false } = req.body;
      if (!productId || !amount) {
        return res.status(400).json({ message: "Product ID and amount are required" });
      }
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.stripeProductId) {
        return res.status(400).json({ message: "Product does not have a Stripe product ID. Please sync products first." });
      }
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      const priceData = {
        product: product.stripeProductId,
        currency,
        unit_amount: amount
      };
      if (recurring) {
        priceData.recurring = {
          interval: "month"
        };
      }
      const price = await stripe2.prices.create(priceData);
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
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const isStripeId = req.params.id.startsWith("prod_");
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
  app2.post("/api/stripe/sync-products", async (_req, res) => {
    try {
      const products2 = await storage.syncStripeProducts();
      res.json({ success: true, products: products2 });
    } catch (error) {
      res.status(500).json({ message: "Error syncing products with Stripe" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      if (typeof orderData.userId !== "number") {
        return res.status(400).json({ message: "Invalid userId format" });
      }
      const user = await storage.getUser(orderData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (typeof orderData.productId !== "number") {
        return res.status(400).json({ message: "Invalid productId format" });
      }
      const product = await storage.getProduct(orderData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const order = await storage.createOrder(orderData);
      await safeGoogleSheetsCall(saveOrder, order);
      if (user.email) {
        try {
          const language = user.language || "ru";
          await sendOrderConfirmation(order, user.email, language);
          console.log(`Order confirmation email sent to ${user.email}`);
        } catch (emailError) {
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
  app2.get("/api/users/:userId/orders", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      if (!req.isAuthenticated() || !req.user || req.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const orders2 = await storage.getOrdersByUserId(userId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      let { amount, userId, productId, currency = "usd", couponCode, country: requestCountry, force_country, quantity = 1 } = req.body;
      if (!amount || !userId || !productId) {
        return res.status(400).json({ message: "Amount, userId, and productId are required" });
      }
      if (amount < 1e3) {
        console.warn(`WARNING: Received very small amount: ${amount} ${currency}. This might indicate that the amount is not in the smallest currency unit (cents/pennies). For example, $3248.00 should be passed as 324800, not 3248.`);
      }
      console.log(`Received amount: ${amount} ${currency} (\u044D\u0442\u043E \u044D\u043A\u0432\u0438\u0432\u0430\u043B\u0435\u043D\u0442\u043D\u043E ${(amount / 100).toFixed(2)} ${currency} \u0432 \u043E\u0441\u043D\u043E\u0432\u043D\u044B\u0445 \u0435\u0434\u0438\u043D\u0438\u0446\u0430\u0445 \u0432\u0430\u043B\u044E\u0442\u044B)`);
      let processedAmount = amount;
      if (processedAmount < 50 && String(processedAmount).includes(".")) {
        console.log(`\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u0441\u0443\u043C\u043C\u0430, \u043A\u043E\u0442\u043E\u0440\u0430\u044F \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u0432 \u043E\u0441\u043D\u043E\u0432\u043D\u044B\u0445 \u0435\u0434\u0438\u043D\u0438\u0446\u0430\u0445 \u0432\u0430\u043B\u044E\u0442\u044B (${processedAmount}). \u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u0443\u0435\u043C \u0432 \u0446\u0435\u043D\u0442\u044B/\u043A\u043E\u043F\u0435\u0439\u043A\u0438.`);
        processedAmount = Math.round(processedAmount * 100);
        console.log(`\u0421\u043A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ${processedAmount} (\u0446\u0435\u043D\u0442\u044B/\u043A\u043E\u043F\u0435\u0439\u043A\u0438)`);
      }
      amount = processedAmount;
      const parsedQuantity = parseInt(quantity.toString(), 10);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      const unitPrice = Math.round(amount / parsedQuantity);
      console.log(`Calculated unit price: ${unitPrice} ${currency} per item (total amount: ${amount}, quantity: ${parsedQuantity})`);
      const currencyStr = String(currency);
      const lowerCurrency = currencyStr.toLowerCase();
      if (lowerCurrency !== "usd" && lowerCurrency !== "eur") {
        return res.status(400).json({ message: "Currency must be either 'usd' or 'eur'" });
      }
      const customerData = await storage.getUser(userId);
      if (!customerData) {
        return res.status(404).json({ message: "User not found" });
      }
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const queryCountry = req.query.country;
      const useForceCountry = force_country === true || req.query.force_country === "true";
      const country = useForceCountry ? requestCountry || queryCountry : customerData?.country || requestCountry || queryCountry || null;
      const metadata = {
        userId: userId.toString(),
        productId: productId.toString(),
        quantity: parsedQuantity.toString(),
        currency,
        country: country || "unknown"
      };
      metadata.country_source = useForceCountry ? "force_country" : customerData?.country ? "user_profile" : requestCountry ? "request_body" : queryCountry ? "query_param" : "unknown";
      if (couponCode) {
        metadata.couponCode = couponCode;
      }
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      console.log(`Creating PaymentIntent for amount: ${amount} ${currency}`);
      let taxAmount = 0;
      let taxRate = 0;
      let taxLabel = "";
      let nexusThresholdReached = false;
      if (country) {
        if (country === "US") {
          let state = "unknown";
          if (req.body.state) {
            state = req.body.state;
          }
          metadata.state = state;
          if (nexusThresholdReached) {
          } else {
            taxRate = 0;
            taxLabel = "No Sales Tax";
          }
        } else {
          switch (country) {
            case "AT":
              taxRate = 0.2;
              taxLabel = "MwSt. 20%";
              break;
            case "BE":
              taxRate = 0.21;
              taxLabel = "BTW 21%";
              break;
            case "BG":
              taxRate = 0.2;
              taxLabel = "\u0414\u0414\u0421 20%";
              break;
            case "HR":
              taxRate = 0.25;
              taxLabel = "PDV 25%";
              break;
            case "CY":
              taxRate = 0.19;
              taxLabel = "\u03A6\u03A0\u0391 19%";
              break;
            case "CZ":
              taxRate = 0.21;
              taxLabel = "DPH 21%";
              break;
            case "DK":
              taxRate = 0.25;
              taxLabel = "MOMS 25%";
              break;
            case "EE":
              taxRate = 0.22;
              taxLabel = "KM 22%";
              break;
            case "FI":
              taxRate = 0.255;
              taxLabel = "ALV 25.5%";
              break;
            case "FR":
              taxRate = 0.2;
              taxLabel = "TVA 20%";
              break;
            case "GE":
              taxRate = 0.18;
              taxLabel = "VAT 18%";
              break;
            case "DE":
              taxRate = 0.19;
              taxLabel = "MwSt. 19%";
              break;
            case "GR":
              taxRate = 0.24;
              taxLabel = "\u03A6\u03A0\u0391 24%";
              break;
            case "HU":
              taxRate = 0.27;
              taxLabel = "\xC1FA 27%";
              break;
            case "IS":
              taxRate = 0.24;
              taxLabel = "VSK 24%";
              break;
            case "IE":
              taxRate = 0.23;
              taxLabel = "VAT 23%";
              break;
            case "IT":
              taxRate = 0.22;
              taxLabel = "IVA 22%";
              break;
            case "LV":
              taxRate = 0.21;
              taxLabel = "PVN 21%";
              break;
            case "LT":
              taxRate = 0.21;
              taxLabel = "PVM 21%";
              break;
            case "LU":
              taxRate = 0.16;
              taxLabel = "TVA 16%";
              break;
            case "MT":
              taxRate = 0.18;
              taxLabel = "VAT 18%";
              break;
            case "MD":
              taxRate = 0.2;
              taxLabel = "TVA 20%";
              break;
            case "NL":
              taxRate = 0.21;
              taxLabel = "BTW 21%";
              break;
            case "NO":
              taxRate = 0.25;
              taxLabel = "MVA 25%";
              break;
            case "PL":
              taxRate = 0.23;
              taxLabel = "VAT 23%";
              break;
            case "PT":
              taxRate = 0.23;
              taxLabel = "IVA 23%";
              break;
            case "RO":
              taxRate = 0.19;
              taxLabel = "TVA 19%";
              break;
            case "SK":
              taxRate = 0.23;
              taxLabel = "DPH 23%";
              break;
            case "SI":
              taxRate = 0.22;
              taxLabel = "DDV 22%";
              break;
            case "ES":
              taxRate = 0.21;
              taxLabel = "IVA 21%";
              break;
            case "SE":
              taxRate = 0.25;
              taxLabel = "MOMS 25%";
              break;
            case "CH":
              taxRate = 0.081;
              taxLabel = "MWST 8.1%";
              break;
            case "TR":
              taxRate = 0.2;
              taxLabel = "KDV 20%";
              break;
            case "UA":
              taxRate = 0.2;
              taxLabel = "\u041F\u0414\u0412 20%";
              break;
            case "GB":
              taxRate = 0.2;
              taxLabel = "VAT 20%";
              break;
            default:
              taxRate = 0;
              taxLabel = "No VAT";
          }
        }
      }
      if (taxRate > 0) {
        taxAmount = Math.round(amount * taxRate);
        metadata.tax_rate = (taxRate * 100).toFixed(1) + "%";
        metadata.tax_amount = taxAmount.toString();
        metadata.tax_label = taxLabel;
        console.log(`\u041D\u0430\u043B\u043E\u0433 \u0434\u043B\u044F \u0441\u0442\u0440\u0430\u043D\u044B ${country}: ${taxLabel}, \u0441\u0442\u0430\u0432\u043A\u0430: ${taxRate * 100}%, \u0441\u0443\u043C\u043C\u0430: ${taxAmount}`);
      }
      let taxRateId = null;
      if (taxRate > 0) {
        try {
          const taxRates = await stripe2.taxRates.list({
            limit: 100,
            active: true
          });
          const existingRate = taxRates.data.find(
            (rate) => parseFloat(rate.percentage.toString()) === taxRate * 100 && rate.display_name === taxLabel
          );
          if (existingRate) {
            taxRateId = existingRate.id;
          } else {
            const fullCountryName = country ? getFullCountryName(country) : void 0;
            const newTaxRate = await stripe2.taxRates.create({
              display_name: taxLabel,
              description: `${taxLabel} for ${fullCountryName || country}`,
              percentage: Math.round(taxRate * 100),
              inclusive: false,
              // НДС начисляется сверх цены
              country: country || void 0,
              tax_type: "vat"
            });
            taxRateId = newTaxRate.id;
          }
        } catch (taxError) {
          console.error("Error creating/retrieving tax rate");
        }
      }
      const paymentMethodTypes = ["card"];
      if (lowerCurrency === "eur") {
        paymentMethodTypes.push("ideal", "sepa_debit");
      }
      const paymentIntentParams = {
        amount,
        // Изначально устанавливаем базовую сумму без налога
        currency: lowerCurrency,
        // Используем валюту в нижнем регистре
        payment_method_types: paymentMethodTypes,
        metadata: {
          ...metadata,
          base_amount: amount.toString(),
          tax_amount: taxAmount.toString(),
          tax_rate: (taxRate * 100).toFixed(1) + "%",
          // Унифицированный формат "19.0%"
          tax_label: taxLabel,
          country_code: country || "unknown",
          // Добавляем важную информацию о цене за единицу товара
          unitPrice: unitPrice.toString(),
          basePrice: unitPrice.toString(),
          // Для обратной совместимости 
          singleItemPrice: unitPrice.toString()
          // Еще один формат для ясности
        },
        description: taxRate > 0 ? `Order with ${taxLabel} (${taxAmount} ${currency})` : "Order without VAT"
        // Примечание: параметр 'tax' не поддерживается в текущей версии API Stripe
        // Налоговую информацию храним в метаданных и оформляем в description
      };
      if (country) {
        paymentIntentParams.metadata.country = country;
        if (country === "US" && metadata.state && metadata.state !== "unknown") {
          paymentIntentParams.metadata.state = metadata.state;
        }
      }
      if (country === "FR") {
        taxRate = 0.2;
        taxLabel = "TVA 20%";
        taxAmount = Math.round(amount * taxRate);
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = "20.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        paymentIntentParams.amount = amount + taxAmount;
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        console.log(`Applied French VAT: ${taxAmount} ${currency}`);
      } else if (country === "IT") {
        taxRate = 0.22;
        taxLabel = "IVA 22%";
        taxAmount = Math.round(amount * taxRate);
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = "22.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        paymentIntentParams.amount = amount + taxAmount;
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        console.log(`Applied Italian VAT: ${taxAmount} ${currency}`);
      } else if (country === "ES") {
        taxRate = 0.21;
        taxLabel = "IVA 21%";
        taxAmount = Math.round(amount * taxRate);
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = "21.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        paymentIntentParams.amount = amount + taxAmount;
        console.log(`New total amount with tax: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount})`);
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        console.log(`Applied Spanish VAT: ${taxAmount} ${currency}`);
      } else if (country === "unknown") {
        taxRate = 0;
        taxLabel = "No Tax (Unknown Location)";
        taxAmount = 0;
        paymentIntentParams.metadata.tax_amount = "0";
        paymentIntentParams.metadata.tax_rate = "0.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = "unknown";
        console.log(`No tax applied for unknown country`);
        paymentIntentParams.description = `Order without tax (unknown country)`;
      } else if (!country || country === "DE") {
        const defaultCountry = "DE";
        taxRate = 0.19;
        taxLabel = "MwSt. 19%";
        taxAmount = Math.round(amount * taxRate);
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = "19.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = defaultCountry;
        paymentIntentParams.amount = amount + taxAmount;
        paymentIntentParams.description = `Order with ${taxLabel}`;
        console.log(`Applied German VAT`);
      } else if (country === "US") {
        taxRate = 0;
        taxLabel = "No Sales Tax";
        taxAmount = 0;
        paymentIntentParams.metadata.tax_amount = "0";
        paymentIntentParams.metadata.tax_rate = "0.0%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        paymentIntentParams.description = "Order with no sales tax";
        console.log("No tax applied for US customer");
      } else {
        taxAmount = Math.round(amount * taxRate);
        paymentIntentParams.metadata.tax_amount = taxAmount.toString();
        paymentIntentParams.metadata.tax_rate = (taxRate * 100).toFixed(1) + "%";
        paymentIntentParams.metadata.tax_label = taxLabel;
        paymentIntentParams.metadata.country_code = country;
        paymentIntentParams.amount = amount + taxAmount;
        console.log(`New total amount with tax for ${country}: ${paymentIntentParams.amount} ${currency} (base: ${amount}, tax: ${taxAmount}, rate: ${taxRate * 100}%)`);
        paymentIntentParams.description = `Order with ${taxLabel} (${taxAmount} ${currency})`;
        console.log(`Applied ${country} tax (${taxLabel}): ${taxAmount} ${currency}`);
      }
      const fullCountryNameForLogs = country ? getFullCountryName(country) : "unknown";
      console.log(`Creating PaymentIntent for country: ${country || "unknown"}`);
      const paymentIntent = await stripe2.paymentIntents.create(paymentIntentParams);
      console.log(`Created PaymentIntent: ${paymentIntent.id}`);
      const order = await storage.createOrder({
        userId,
        productId,
        status: "pending",
        amount,
        currency,
        stripePaymentId: paymentIntent.id,
        couponCode: couponCode || void 0
      });
      await safeGoogleSheetsCall(saveOrder, order);
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
        amount,
        // Базовая сумма без налога
        taxAmount,
        // Сумма налога
        totalWithTax: paymentIntentParams.amount,
        // Общая сумма с налогом
        taxRate,
        // Ставка налога (как десятичное число)
        quantity: parsedQuantity,
        // Количество
        unitPrice,
        // Цена за единицу
        currency: currency.toLowerCase(),
        // Валюта
        tax: taxInfo
        // Информация о налоге в структурированном виде
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });
  app2.post("/api/update-payment-intent", async (req, res) => {
    try {
      console.log("\u{1F504} \u0412\u042B\u0417\u041E\u0412 API \u041E\u0411\u041D\u041E\u0412\u041B\u0415\u041D\u0418\u042F \u041F\u041B\u0410\u0422\u0415\u0416\u0410:", JSON.stringify(req.body, null, 2));
      const { paymentIntentId, quantity, userId, productId, newItems } = req.body;
      if (!paymentIntentId || !quantity || !userId) {
        return res.status(400).json({
          message: "Payment intent ID, quantity, and user ID are required"
        });
      }
      console.log(
        `Update request with ${newItems ? "items structure" : "direct quantity"}:`,
        newItems ? JSON.stringify(newItems) : `quantity: ${quantity}`
      );
      const parsedQuantity = parseInt(quantity.toString());
      if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10) {
        return res.status(400).json({ message: "Quantity must be between 1 and 10" });
      }
      const order = await storage.getOrderByStripePaymentId(paymentIntentId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (!order.productId) {
        return res.status(404).json({ message: "Product ID is missing in order" });
      }
      const product = await storage.getProduct(order.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      const currentPaymentIntent = await stripe2.paymentIntents.retrieve(paymentIntentId);
      const metadata = currentPaymentIntent.metadata || {};
      const productPrice = product.priceEUR || product.price;
      let basePrice = 0;
      if (metadata.basePrice) {
        basePrice = parseInt(metadata.basePrice, 10);
      } else if (metadata.base_amount && metadata.quantity) {
        const metaBaseAmount = parseInt(metadata.base_amount, 10);
        const metaQuantity = parseInt(metadata.quantity, 10);
        if (metaQuantity > 0) {
          basePrice = Math.round(metaBaseAmount / metaQuantity);
        }
      }
      if (!basePrice) {
        basePrice = order.currency === "eur" ? product.priceEUR : product.price;
      }
      console.log(`\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430 \u0437\u0430 \u0435\u0434\u0438\u043D\u0438\u0446\u0443 \u0442\u043E\u0432\u0430\u0440\u0430: ${basePrice} ${order.currency}`);
      const originalUnitPrice = basePrice > 0 ? basePrice : productPrice;
      const newBaseAmount = originalUnitPrice * parsedQuantity;
      console.log(`\u041D\u043E\u0432\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: ${parsedQuantity}, \u0431\u0430\u0437\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ${newBaseAmount} ${order.currency}`);
      const taxRateStr = metadata.tax_rate || "0%";
      const taxRatePercentage = parseFloat(taxRateStr.replace("%", ""));
      console.log(`\u0418\u0437\u0432\u043B\u0435\u0447\u0435\u043D\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0430\u043B\u043E\u0433\u0430: ${taxRatePercentage}% \u0438\u0437 \u0441\u0442\u0440\u043E\u043A\u0438 "${taxRateStr}"`);
      const taxRate = taxRatePercentage / 100;
      const newTaxAmount = Math.round(newBaseAmount * taxRate);
      console.log(`\u0412\u044B\u0447\u0438\u0441\u043B\u0435\u043D\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043D\u0430\u043B\u043E\u0433\u0430: ${newTaxAmount} (${taxRatePercentage}% \u043E\u0442 ${newBaseAmount})`);
      if (taxRatePercentage > 0 && newTaxAmount === 0) {
        console.log(`\u041F\u0420\u0415\u0414\u0423\u041F\u0420\u0415\u0416\u0414\u0415\u041D\u0418\u0415: \u041D\u0443\u043B\u0435\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043D\u0430\u043B\u043E\u0433\u0430 \u043F\u0440\u0438 \u043D\u0435\u043D\u0443\u043B\u0435\u0432\u043E\u0439 \u0441\u0442\u0430\u0432\u043A\u0435 ${taxRatePercentage}%`);
      }
      const newTotalAmount = newBaseAmount + newTaxAmount;
      console.log(`New total amount: ${newTotalAmount} (base: ${newBaseAmount}, tax: ${newTaxAmount})`);
      if (currentPaymentIntent.status === "requires_payment_method" || currentPaymentIntent.status === "requires_confirmation") {
        console.log(`\u041E\u0442\u043C\u0435\u043D\u044F\u0435\u043C \u0442\u0435\u043A\u0443\u0449\u0438\u0439 PaymentIntent ${paymentIntentId} \u043F\u0435\u0440\u0435\u0434 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C \u043D\u043E\u0432\u043E\u0433\u043E...`);
        try {
          let updatedMetadata = {
            ...metadata,
            quantity: parsedQuantity.toString(),
            base_amount: newBaseAmount.toString(),
            // Используем единый формат названий полей
            tax_amount: newTaxAmount.toString(),
            total_amount: newTotalAmount.toString(),
            // Обязательно сохраняем tax_rate, так как мы его используем при расчетах
            tax_rate: metadata.tax_rate || "0%"
          };
          if (newItems) {
            console.log("Updating line items in metadata:", JSON.stringify(newItems));
            updatedMetadata = {
              ...updatedMetadata,
              items: JSON.stringify(newItems)
            };
          } else if (metadata.items) {
            try {
              const existingItems = JSON.parse(metadata.items);
              const updatedItems = existingItems.map((item) => ({
                ...item,
                quantity: parsedQuantity
              }));
              updatedMetadata = {
                ...updatedMetadata,
                items: JSON.stringify(updatedItems)
              };
              console.log("Updated existing items in metadata with new quantity");
            } catch (e) {
              console.error("Error parsing items from metadata:", e);
            }
          }
          const updatedPaymentIntent = await stripe2.paymentIntents.update(paymentIntentId, {
            amount: newTotalAmount,
            metadata: updatedMetadata
          });
          console.log(`PaymentIntent \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D: ${paymentIntentId}, \u043D\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430: ${newTotalAmount} ${order.currency}`);
          res.json({
            id: updatedPaymentIntent.id,
            clientSecret: updatedPaymentIntent.client_secret,
            amount: newBaseAmount,
            taxAmount: newTaxAmount,
            totalAmount: newTotalAmount,
            quantity: parsedQuantity
          });
        } catch (updateError) {
          console.error("Error updating payment intent:", updateError);
          let updatedMetadata = {
            ...metadata,
            quantity: parsedQuantity.toString(),
            base_amount: newBaseAmount.toString(),
            tax_amount: newTaxAmount.toString(),
            total_amount: newTotalAmount.toString(),
            tax_rate: metadata.tax_rate || "0%",
            previousPaymentIntentId: paymentIntentId
          };
          if (newItems) {
            updatedMetadata = {
              ...updatedMetadata,
              items: JSON.stringify(newItems)
            };
          } else if (metadata.items) {
            try {
              const existingItems = JSON.parse(metadata.items);
              const updatedItems = existingItems.map((item) => ({
                ...item,
                quantity: parsedQuantity
              }));
              updatedMetadata = {
                ...updatedMetadata,
                items: JSON.stringify(updatedItems)
              };
            } catch (e) {
              console.error("Error parsing items from metadata:", e);
            }
          }
          const newPaymentIntentParams = {
            amount: newTotalAmount,
            currency: order.currency,
            metadata: updatedMetadata
          };
          const newPaymentIntent = await stripe2.paymentIntents.create(newPaymentIntentParams);
          await storage.updateOrderStripePaymentId(order.id, newPaymentIntent.id);
          res.json({
            id: newPaymentIntent.id,
            clientSecret: newPaymentIntent.client_secret,
            amount: newBaseAmount,
            taxAmount: newTaxAmount,
            totalAmount: newTotalAmount,
            quantity: parsedQuantity
          });
        }
      } else {
        let updatedMetadata = {
          ...metadata,
          quantity: parsedQuantity.toString(),
          base_amount: newBaseAmount.toString(),
          tax_amount: newTaxAmount.toString(),
          total_amount: newTotalAmount.toString(),
          tax_rate: metadata.tax_rate || "0%",
          previousPaymentIntentId: paymentIntentId
        };
        if (newItems) {
          updatedMetadata = {
            ...updatedMetadata,
            items: JSON.stringify(newItems)
          };
        } else if (metadata.items) {
          try {
            const existingItems = JSON.parse(metadata.items);
            const updatedItems = existingItems.map((item) => ({
              ...item,
              quantity: parsedQuantity
            }));
            updatedMetadata = {
              ...updatedMetadata,
              items: JSON.stringify(updatedItems)
            };
          } catch (e) {
            console.error("Error parsing items from metadata:", e);
          }
        }
        const newPaymentIntentParams = {
          amount: newTotalAmount,
          currency: order.currency,
          metadata: updatedMetadata
        };
        const newPaymentIntent = await stripe2.paymentIntents.create(newPaymentIntentParams);
        await storage.updateOrderStripePaymentId(order.id, newPaymentIntent.id);
        res.json({
          id: newPaymentIntent.id,
          clientSecret: newPaymentIntent.client_secret,
          amount: newBaseAmount,
          taxAmount: newTaxAmount,
          totalAmount: newTotalAmount,
          quantity: parsedQuantity
        });
      }
    } catch (error) {
      console.error("Error updating payment intent:", error);
      res.status(500).json({ message: "Error updating payment intent" });
    }
  });
  app2.use("/api/tax-debug", tax_debug_default);
  app2.get("/tax-test", (req, res) => {
    res.sendFile("public/tax-test.html", { root: process.cwd() });
  });
  app2.post("/api/get-or-create-subscription", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = req.user;
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      if (user.stripeSubscriptionId) {
        try {
          const subscription2 = await stripe2.subscriptions.retrieve(user.stripeSubscriptionId, {
            expand: ["latest_invoice.payment_intent"]
          });
          res.json({
            subscriptionId: subscription2.id,
            status: subscription2.status,
            clientSecret: subscription2.latest_invoice && typeof subscription2.latest_invoice !== "string" && subscription2.latest_invoice.payment_intent && typeof subscription2.latest_invoice.payment_intent !== "string" ? subscription2.latest_invoice.payment_intent.client_secret : void 0
          });
          return;
        } catch (error) {
          console.error("Error retrieving subscription:", error);
          await storage.updateUserStripeSubscriptionId(user.id, "");
        }
      }
      const { priceId, currency = "usd" } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      if (!user.stripeCustomerId) {
        const customer = await stripe2.customers.create({
          email: user.email,
          name: user.name || user.username,
          address: user.country ? {
            country: user.country
          } : void 0,
          metadata: {
            userId: user.id.toString(),
            country: user.country || "unknown"
          }
        });
        await storage.updateUserStripeCustomerId(user.id, customer.id);
        user.stripeCustomerId = customer.id;
      }
      const subscriptionParams = {
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        // Получаем платежное намерение для клиентской стороны
        metadata: {
          userId: user.id.toString(),
          country: user.country || "unknown",
          currency
          // Включаем информацию о валюте
        }
      };
      if (process.env.STRIPE_TAX_ENABLED === "true") {
        subscriptionParams.automatic_tax = { enabled: true };
        console.log("Enabling automatic tax calculation for subscription");
      }
      if (user.country) {
        console.log(`Using country ${user.country} for subscription tax calculation`);
      }
      const subscription = await stripe2.subscriptions.create(subscriptionParams);
      const latest_invoice = subscription.latest_invoice;
      let clientSecret = void 0;
      if (latest_invoice && typeof latest_invoice !== "string") {
        const payment_intent = latest_invoice.payment_intent;
        if (payment_intent && typeof payment_intent !== "string") {
          clientSecret = payment_intent.client_secret || void 0;
        }
      }
      await storage.updateUserStripeSubscriptionId(user.id, subscription.id);
      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        status: subscription.status
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Error creating subscription" });
    }
  });
  app2.post("/api/manage-subscription", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = req.user;
      const { action } = req.body;
      if (!action) {
        return res.status(400).json({ message: "Action is required" });
      }
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      let subscription;
      switch (action) {
        case "cancel":
          subscription = await stripe2.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true
          });
          break;
        case "reactivate":
          subscription = await stripe2.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: false
          });
          break;
        case "cancel_immediately":
          subscription = await stripe2.subscriptions.cancel(user.stripeSubscriptionId);
          if (subscription.status === "canceled") {
            await storage.updateUserStripeSubscriptionId(user.id, "");
          }
          break;
        default:
          return res.status(400).json({ message: "Invalid action" });
      }
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    } catch (error) {
      console.error("Error managing subscription:", error);
      res.status(500).json({
        message: "Error managing subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/orders/:id/update-status", async (req, res) => {
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
      await safeGoogleSheetsCall(updateOrderStatus, orderId, status);
      if ((sendNotification || sendEmail) && updatedOrder.userId) {
        const user = await storage.getUser(updatedOrder.userId);
        if (sendNotification) {
          try {
            await sendOrderStatusNotification(
              updatedOrder.userId,
              orderId,
              status
            );
            console.log(`Push notification sent for order ${orderId} status update to ${status}`);
          } catch (notificationError) {
            console.error(`Failed to send push notification for order ${orderId}:`, notificationError);
          }
        }
        if (sendEmail && user && user.email) {
          try {
            const language = user.language || "ru";
            await sendOrderStatusUpdate(updatedOrder, user.email, language);
            console.log(`Order status update email sent to ${user.email}`);
          } catch (emailError) {
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
  app2.post("/api/webhook/stripe", async (req, res) => {
    try {
      const Stripe2 = await import("stripe").then((module) => module.default);
      const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
        telemetry: false
      });
      let event;
      const isDevTest = req.headers["x-stripe-test"] === "true";
      const sig = req.headers["stripe-signature"];
      if (process.env.STRIPE_WEBHOOK_SECRET && !isDevTest) {
        if (!sig) {
          return res.status(400).json({ message: "Missing Stripe signature" });
        }
        try {
          event = stripe2.webhooks.constructEvent(
            req.body instanceof Buffer ? req.body : JSON.stringify(req.body),
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          console.error(`Webhook Error: ${err.message}`);
          return res.status(400).json({ message: `Webhook Error: ${err.message}` });
        }
      } else {
        console.log("Using webhook without signature verification (development mode)");
        event = req.body;
      }
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
          try {
            const order = await storage.getOrderByStripePaymentId(paymentIntent.id);
            if (order) {
              await storage.updateOrderStatus(order.id, "completed");
              await safeGoogleSheetsCall(updateOrderStatus, order.id, "completed");
              console.log(`Order ${order.id} marked as completed`);
              if (order.userId) {
                try {
                  await sendOrderStatusNotification(
                    order.userId,
                    order.id,
                    "completed"
                  );
                  console.log(`Payment success notification sent for order ${order.id}`);
                } catch (notificationError) {
                  console.error(`Failed to send payment notification for order ${order.id}:`, notificationError);
                }
              }
            }
          } catch (error) {
            console.error("Error updating order after payment success:", error);
          }
          break;
        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          console.log(`Payment failed for PaymentIntent ${failedPayment.id}`);
          try {
            const order = await storage.getOrderByStripePaymentId(failedPayment.id);
            if (order) {
              await storage.updateOrderStatus(order.id, "failed");
              await safeGoogleSheetsCall(updateOrderStatus, order.id, "failed");
              console.log(`Order ${order.id} marked as failed`);
              if (order.userId) {
                try {
                  await sendOrderStatusNotification(
                    order.userId,
                    order.id,
                    "failed"
                  );
                  console.log(`Payment failure notification sent for order ${order.id}`);
                } catch (notificationError) {
                  console.error(`Failed to send payment failure notification for order ${order.id}:`, notificationError);
                }
              }
            }
          } catch (error) {
            console.error("Error updating order after payment failure:", error);
          }
          break;
        case "checkout.session.completed":
          const session2 = event.data.object;
          console.log(`Checkout session ${session2.id} completed`);
          break;
        case "subscription_schedule.created":
        case "subscription_schedule.updated":
        case "subscription_schedule.released":
        case "subscription_schedule.canceled":
        case "subscription.created":
        case "subscription.updated":
        case "subscription.deleted":
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "customer.subscription.trial_will_end":
          console.log(`Subscription event: ${event.type}`);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Error processing webhook" });
    }
  });
  app2.post("/api/logs", saveClientLogs);
  app2.get("/api/logs/stats", getLogsStats);
  app2.get("/api/logs/:type", getRecentLogs);
  app2.post("/api/push/subscribe", registerPushSubscription);
  app2.post("/api/push/unsubscribe", unregisterPushSubscription);
  app2.post("/api/orders/:id/update-tracking", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const { trackingNumber, sendEmail = false } = req.body;
      if (!trackingNumber) {
        return res.status(400).json({ message: "Tracking number is required" });
      }
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (req.user?.id !== order.userId && req.user?.email !== "admin@example.com") {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      const updatedOrder = await storage.updateOrderTrackingNumber(orderId, trackingNumber);
      await safeGoogleSheetsCall(updateOrderTrackingNumber, orderId, trackingNumber);
      if (order.userId) {
        const user = await storage.getUser(order.userId);
        try {
          await sendOrderStatusNotification(
            order.userId,
            orderId,
            "Tracking number updated"
          );
        } catch (notificationError) {
          console.error(`Failed to send push notification for tracking update, order ${orderId}:`, notificationError);
        }
        if (sendEmail && user && user.email && updatedOrder) {
          try {
            await sendTrackingUpdate(updatedOrder, user.email, user.language || "en");
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
  app2.post("/api/orders/:id/update-status-notify", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, userId } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      await safeGoogleSheetsCall(updateOrderStatus, orderId, status);
      if (userId && typeof userId === "number") {
        await sendOrderStatusNotification(userId, orderId, status);
      }
      res.json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Error updating order status with notification:", error);
      res.status(500).json({ message: "Error updating order status" });
    }
  });
  app2.post("/api/push/send-test", async (req, res) => {
    try {
      const { userId, title, body, url } = req.body;
      if (!userId || !title || !body) {
        return res.status(400).json({ message: "userId, title, and body are required" });
      }
      await sendPushNotificationToUser(
        parseInt(userId),
        title,
        body,
        url || "/"
      );
      res.json({ success: true, message: "Test notification sent" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Error sending test notification" });
    }
  });
  app2.post("/api/email/send-test", async (req, res) => {
    try {
      const { emailAddress, type, language = "en", orderId } = req.body;
      if (!emailAddress || !type) {
        return res.status(400).json({ message: "emailAddress and type are required" });
      }
      if ((type === "order" || type === "tracking" || type === "status") && !orderId) {
        return res.status(400).json({ message: "orderId is required for order-related notifications" });
      }
      let success = false;
      let order;
      if (orderId) {
        order = await storage.getOrder(parseInt(orderId));
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
      }
      switch (type) {
        case "order":
          if (order) {
            success = await sendOrderConfirmation(order, emailAddress, language);
          }
          break;
        case "status":
          if (order) {
            success = await sendOrderStatusUpdate(order, emailAddress, language);
          }
          break;
        case "tracking":
          if (order) {
            if (!order.trackingNumber) {
              order = await storage.updateOrderTrackingNumber(order.id, "TEST123456789");
            }
            if (order) {
              success = await sendTrackingUpdate(order, emailAddress, language);
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import session from "express-session";
import MemoryStore from "memorystore";
import crypto2 from "crypto";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use(express3.static("."));
var sessionSecret = process.env.SESSION_SECRET || crypto2.randomBytes(32).toString("hex");
var SessionStore = MemoryStore(session);
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  // Изменено на true для сохранения всех сессий
  store: new SessionStore({
    checkPeriod: 864e5
    // Очистка просроченных сессий раз в 24 часа
  }),
  cookie: {
    secure: false,
    // Отключаем secure для работы без HTTPS
    httpOnly: true,
    // Защита от XSS - клиентский JavaScript не может получить доступ к cookie
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 дней
    sameSite: "lax",
    // Добавляем sameSite policy
    path: "/"
    // Явно указываем путь для куки
  }
}));
app.use((req, res, next) => {
  req.isAuthenticated = function() {
    return !!req.session.userId;
  };
  req.logout = function(done) {
    if (req.session) {
      delete req.session.userId;
      req.user = void 0;
      req.session.destroy((err) => {
        done(err);
      });
    } else {
      done(null);
    }
  };
  const loadUser = async () => {
    if (req.session.userId) {
      try {
        const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const user = await storage2.getUser(req.session.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        console.error("Error loading user from session:", error);
      }
    }
    next();
  };
  loadUser();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    console.log(`
----------------------------------------------
\u{1F680} \u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E!
\u{1F4F1} \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435: http://localhost:${port}
   \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 URL, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u0432 \u0432\u0435\u0440\u0445\u043D\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 Replit

\u{1F4DD} \u0415\u0441\u043B\u0438 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430 \u043D\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442, 
   \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0440\u044F\u043C\u043E\u0439 URL \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044E.
----------------------------------------------
    `);
  });
})();
