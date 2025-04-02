import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";

// Расширяем типы для express-session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("."));

// Создаем безопасный секретный ключ для сессий (это гораздо безопаснее, чем хардкодирование)
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Настройка сессий с использованием memorystore
const SessionStore = MemoryStore(session);
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({
    checkPeriod: 86400000 // Очистка просроченных сессий раз в 24 часа
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // В production используем только HTTPS
    httpOnly: true, // Защита от XSS - клиентский JavaScript не может получить доступ к cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Middleware для аутентификации
app.use((req: Request, res: Response, next: NextFunction) => {
  // Реализация метода isAuthenticated
  req.isAuthenticated = function() {
    // Необходимо использовать принудительное приведение типов из-за особенностей типизации express-session
    return !!((req.session as any).userId);
  };
  
  // Реализация метода logout
  req.logout = function(done: (err: any) => void) {
    if (req.session) {
      // Удаляем userId из сессии
      delete (req.session as any).userId;
      // Обнуляем пользователя
      req.user = undefined;
      // Уничтожаем сессию
      req.session.destroy((err) => {
        done(err);
      });
    } else {
      done(null);
    }
  };
  
  // Загрузка пользователя из сессии
  const loadUser = async () => {
    if ((req.session as any).userId) {
      try {
        const { storage } = await import('./storage');
        const user = await storage.getUser((req.session as any).userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        console.error('Error loading user from session:', error);
      }
    }
    next();
  };
  
  loadUser();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Роутеры регистрируются в registerRoutes
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    console.log(`
----------------------------------------------
🚀 Приложение запущено!
📱 Откройте в браузере: http://localhost:${port}
   или используйте URL, который отображается в верхней части Replit

📝 Если инструмент скриншота не работает, 
   используйте прямой URL для доступа к приложению.
----------------------------------------------
    `);
  });
})();
