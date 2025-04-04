import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { useLocation } from "wouter";
import MaterialInput from "@/components/MaterialInput";
import { Card } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import OrdersList from "@/components/OrdersList";
import { useLocale } from "@/context/LocaleContext";
import { ChevronRight, Trash2, RefreshCw, Settings, ShoppingBag, Mail, Lock, LogIn, LogOut } from "lucide-react";
import { useProductsSync } from "@/hooks/use-products-sync";
import CountrySelect from "@/components/CountrySelect";
import { updateCountryAndReload } from "@/utils/userCountryUtils";

const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  house: z.string().optional(),
  apartment: z.string().optional(),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

// Схема для логина
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

// Схема для регистрации
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  country: z.string().min(1, "Country is required to determine currency"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Account() {
  const { user, setUser, login, logout } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true); // true = login, false = register
  const { t } = useLocale();
  const [emailChanged, setEmailChanged] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const originalEmailRef = useRef(user?.email || "");
  
  // Обрабатываем хэш в URL при монтировании и обновлении
  useEffect(() => {
    // Создаем обработчик для хэша в URL
    const handleHashChange = () => {
      if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const element = document.getElementById(sectionId);
        
        if (element) {
          // Небольшая задержка для уверенности, что компонент полностью отрендерен
          setTimeout(() => {
            // Скролл к элементу (с учетом высоты шапки)
            const yOffset = -20; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'instant'});
          }, 10);
        }
      }
    };
    
    // Вызываем обработчик один раз при монтировании
    handleHashChange();
    
    // Подписываемся на изменения хэша
    window.addEventListener('hashchange', handleHashChange);
    
    // Отписываемся при размонтировании
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Сохраняем оригинальный email при монтировании компонента
  useEffect(() => {
    if (user?.email) {
      originalEmailRef.current = user.email;
      setEmailChanged(false);
    }
  }, [user?.email]);
  
  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      country: user?.country || "",
      street: user?.street || "",
      house: user?.house || "",
      apartment: user?.apartment || "",
    },
  });
  
  // Отслеживаем значения формы для определения изменений
  const formValues = watch();
  
  // Эффект для обновления состояния изменения формы
  useEffect(() => {
    if (user) {
      const hasChanged = 
        formValues.name !== (user.name || "") ||
        formValues.phone !== (user.phone || "") ||
        formValues.country !== (user.country || "") ||
        formValues.street !== (user.street || "") ||
        formValues.house !== (user.house || "") ||
        formValues.apartment !== (user.apartment || "");
      
      setFormChanged(hasChanged);
    }
  }, [formValues, user]);
  
  const handleVerifyEmail = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to verify your email",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/users/send-verification", {
        email: user.email,
      });
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Verification email sent. Please check your inbox.",
      });
      
      // For demo purposes only: auto-verify the user
      if (data.token) {
        const verifyResponse = await apiRequest("GET", `/api/users/${user.id}/verify?token=${data.token}`);
        setUser({ ...user, isVerified: true });
        
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: UpdateUserForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to update your information",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Добавляем проверку country перед отправкой
      const submitData = {
        ...data,
        // Убедимся, что country всегда является строкой и не null/undefined
        country: data.country || ""
      };
      
      const response = await apiRequest("PUT", `/api/users/${user.id}`, submitData);
      const updatedUser = await response.json();
      
      // Обновляем пользователя в контексте
      setUser({ ...user, ...updatedUser });
      
      // Проверяем, изменилась ли страна пользователя
      const countryChanged = user.country !== updatedUser.country;
      
      toast({
        title: "Success",
        description: countryChanged 
          ? "Your country has been updated. Page will reload to apply changes." 
          : "Your information has been updated.",
      });
      
      // Если изменилась страна, используем утилиту для согласованного обновления
      if (countryChanged) {
        // Выводим предупреждение пользователю
        toast({
          title: "Updating country",
          description: "Your country has been changed. Page will reload to apply changes...",
        });
        
        // Используем нашу утилиту для согласованного обновления с очисткой кэша
        try {
          await updateCountryAndReload(user.id, updatedUser.country, user, 1500);
        } catch (error) {
          // Если утилита не сработала, используем старый подход
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update your information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseAccount = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to close your account",
        variant: "destructive",
      });
      return;
    }
    
    // Показываем диалог подтверждения перед удалением
    if (!window.confirm(t("confirmCloseAccount") || "Are you sure you want to close your account? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await apiRequest("DELETE", `/api/users/${user.id}`);
      
      // Выходим из системы и очищаем данные пользователя
      setUser(null);
      setLocation("/");
      
      toast({
        title: "Account Closed",
        description: "Your account has been closed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Навигация к политике - упрощенная версия без сохранения позиции скролла
  const navigateToPolicy = (policyId: string) => {
    // Прямой переход на страницу политики
    setLocation(`/policy/${policyId}`);
  };
  
  // Получаем доступ к объекту переводов
  const { translations } = useLocale();
  
  // Определение политик с проверкой наличия ключей в локализации
  // Если ключ не найден, используем fallback на английский
  const policies = [
    { id: "delivery-policy", title: translations.deliveryPolicy || "Delivery Policy" },
    { id: "return-policy", title: translations.returnPolicy || "Return & Exchange Policy" },
    { id: "contact-info", title: translations.contactInfo || "Contact Information" },
    { id: "privacy-policy", title: translations.privacy || "Privacy Policy" },
    { id: "payment-terms", title: translations.payment || "Payment Terms" },
    { id: "warranty", title: translations.warranty || "Warranty & Liability" },
    { id: "terms", title: translations.terms || "Terms of Service" },
    { id: "gdpr", title: translations.gdpr || "GDPR" },
    { id: "ftc", title: translations.ftc || "FTC Rules" },
    { id: "data-safety", title: translations.dataSafety || "Data Safety for Google Play" },
  ];
  
  // Hook для синхронизации продуктов со Stripe
  const { syncProducts, isSyncing } = useProductsSync();

  // Формы для логина и регистрации
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    control: signupControl
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  // Функция для обработки входа
  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    
    try {
      // Удаляем лишние пробелы в начале и конце
      const cleanUsername = data.username.trim();
      const cleanPassword = data.password.trim();
      
      const response = await apiRequest("POST", "/api/users/login", {
        username: cleanUsername,
        password: cleanPassword
      });
      
      const userData = await response.json();
      
      // Используем контекст для сохранения данных о пользователе
      login(userData);
      
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to log in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для обработки регистрации
  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/users/register", data);
      const userData = await response.json();
      
      // Используем контекст для сохранения данных о пользователе
      login(userData);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create an account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для выхода из системы
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Сначала выполняем локальный выход
      logout();
      
      // Затем пытаемся выполнить выход на сервере (но это не критично для пользовательского опыта)
      try {
        await apiRequest("POST", "/api/users/logout");
      } catch (e) {
        // Игнорируем ошибки сервера при выходе, так как локальный выход уже выполнен
      }
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      // Перенаправляем на главную страницу
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка, является ли пользователь администратором (для демо используем email admin@example.com)
  const isAdmin = user?.email === 'admin@example.com';
  
  // Если пользователь не авторизован, показываем формы логина/регистрации
  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">{showLoginForm ? "Login" : "Create Account"}</h1>
        
        <Card className="p-6 mb-4">
          {showLoginForm ? (
            <form 
              id="login-form" 
              name="login-form"
              onSubmit={handleLoginSubmit(handleLogin)}
              autoComplete="on"
            >
              <div className="space-y-4">
                <div>
                  <div className="relative">
                    <MaterialInput
                      id="username"
                      name="username"
                      label="Username"
                      autoComplete="username"
                      register={registerLogin("username")}
                      error={loginErrors.username?.message}
                    />
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <MaterialInput
                      id="password"
                      name="password"
                      type="password"
                      label="Password"
                      autoComplete="current-password"
                      register={registerLogin("password")}
                      error={loginErrors.password?.message}
                    />
                    <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white w-full py-2 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <LogIn className="mr-2" size={18} />
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          ) : (
            <form 
              id="signup-form"
              name="signup-form"
              onSubmit={handleSignupSubmit(handleRegister)}
              autoComplete="on"
            >
              <div className="space-y-4">
                <div>
                  <MaterialInput
                    id="signup-username"
                    name="username"
                    label="Username"
                    autoComplete="username"
                    register={registerSignup("username")}
                    error={signupErrors.username?.message}
                  />
                </div>
                
                <div>
                  <MaterialInput
                    id="signup-email"
                    name="email"
                    type="email"
                    label="Email"
                    autoComplete="email"
                    register={registerSignup("email")}
                    error={signupErrors.email?.message}
                  />
                </div>
                
                <div>
                  <MaterialInput
                    id="signup-password"
                    name="password"
                    type="password"
                    label="Password"
                    autoComplete="new-password"
                    register={registerSignup("password")}
                    error={signupErrors.password?.message}
                  />
                </div>
                
                <div>
                  <MaterialInput
                    id="signup-name"
                    label="Full Name (optional)"
                    register={registerSignup("name")}
                    error={signupErrors.name?.message}
                  />
                </div>
                
                <div>
                  <Controller
                    name="country"
                    control={signupControl}
                    render={({ field }) => (
                      <CountrySelect
                        id="signup-country"
                        label="Country"
                        value={field.value || ''}
                        onChange={(value) => {
                          // Сохраняем значение в форме
                          field.onChange(value);
                          
                          // Добавляем индикатор выбранной страны на странице
                          if (value) {
                            // Устанавливаем это значение в localStorage, чтобы его можно было использовать
                            // при создании нового пользователя
                            localStorage.setItem('signup_country', value);
                          }
                        }}
                        error={signupErrors.country?.message}
                        required={true}
                      />
                    )}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white w-full py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowLoginForm(!showLoginForm)}
              className="text-blue-600 hover:underline"
            >
              {showLoginForm ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Если пользователь авторизован, показываем его профиль
  const currentUser = user;
  
  return (
    <div>
      {/* Account Verification */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">{t("account")}</h2>
          </div>
          <div className="flex items-center">
            <span 
              className={`h-3 w-3 rounded-full ${currentUser.isVerified ? "bg-green-500" : "bg-red-500"} mr-2`}
            ></span>
            <span className={`text-sm ${currentUser.isVerified ? "text-green-600" : "text-red-600"} font-medium`}>
              {currentUser.isVerified ? t("emailVerified") : t("notVerified")}
            </span>
          </div>
        </div>
        
        <Card className="p-4 rounded-lg mb-6">
          <MaterialInput
            id="email"
            type="email"
            label={`${t("emailAddress")} *`}
            defaultValue={currentUser.email}
            onChange={(e) => {
              if (e.target.value !== originalEmailRef.current && e.target.value.trim() !== "") {
                setEmailChanged(true);
              } else {
                setEmailChanged(false);
              }
            }}
          />
          <div className="flex items-center gap-3 mt-3">
            <button 
              className={`${!emailChanged && !currentUser.isVerified ? 'bg-blue-400' : 'bg-blue-600'} text-white flex-grow py-2 rounded-full hover:bg-blue-700 disabled:opacity-50`}
              onClick={handleVerifyEmail}
              disabled={isLoading || currentUser.isVerified || !emailChanged}
            >
              {isLoading ? t("submit") + "..." : t("verifyEmail")}
            </button>
            <button
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-full hover:bg-gray-300 flex items-center"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-2" size={18} />
              {t("logout") || "Logout"}
            </button>
          </div>
        </Card>
      </div>
      
      {/* Language Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{t("language")}</h2>
        </div>
        <Card className="p-4 rounded-lg mb-6">
          <LanguageSelector />
        </Card>
      </div>
      
      {/* Personal Information */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">{t("personalInformation")}</h2>
        <Card className="p-4 rounded-lg">
          <form 
            id="profile-form"
            name="profile-form"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="on"
          >
            <MaterialInput
              id="name"
              name="name"
              label={t("name") || "Full Name"}
              autoComplete="name"
              register={register("name")}
              error={errors.name?.message}
            />
            <MaterialInput
              id="phone"
              name="phone"
              label={t("phone") || "Phone Number"}
              autoComplete="tel"
              register={register("phone")}
              error={errors.phone?.message}
            />
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <CountrySelect
                  id="country"
                  label={`${t("country") || "Country"} *`}
                  value={field.value || ''}
                  onChange={(value) => {
                    // Вызываем оригинальный обработчик
                    field.onChange(value);
                    
                    // Если пользователь авторизован и страна изменилась, сразу применяем изменения
                    if (user && user.country !== value) {
                      // Только если страна действительно изменилась, предлагаем обновление
                      if (window.confirm(t("confirmCountryChange") || `Do you want to update your country to ${value}? Page will reload to apply changes.`)) {
                        setIsLoading(true);
                        updateCountryAndReload(user.id, value, user)
                          .catch(error => {
                            setIsLoading(false);
                            toast({
                              title: "Error",
                              description: "Failed to update country. Please try again.",
                              variant: "destructive",
                            });
                          });
                      }
                    }
                  }}
                  error={errors.country?.message}
                />
              )}
            />
            <MaterialInput
              id="street"
              label={t("street") || "Street"}
              register={register("street")}
              error={errors.street?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <MaterialInput
                id="house"
                label={t("house") || "House/Building"}
                register={register("house")}
                error={errors.house?.message}
              />
              <MaterialInput
                id="apartment"
                label={t("apartment") || "Apartment"}
                register={register("apartment")}
                error={errors.apartment?.message}
              />
            </div>
            <button 
              type="submit"
              className={`${!formChanged ? 'bg-blue-400' : 'bg-blue-600'} text-white w-full py-2 rounded-full mt-4 hover:bg-blue-700 disabled:opacity-50`}
              disabled={isLoading || !formChanged}
            >
              {isLoading ? t("saving") + "..." : t("save") + " " + t("personalInformation")}
            </button>
          </form>
        </Card>
      </div>
      
      {/* Subscription */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">{t("subscription") || "Subscription"}</h2>
        <Card className="p-4 rounded-lg">
          <div className="flex flex-col items-center justify-center py-4">
            <p className="mb-4">
              {user?.stripeSubscriptionId 
                ? t("activeSubscription") || "You have an active subscription" 
                : t("noSubscription") || "No Subscription"}
            </p>
            <button
              onClick={() => setLocation('/subscribe')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || !user || !user?.stripeSubscriptionId}
            >
              {user?.stripeSubscriptionId 
                ? t("manageSubscription") || "Manage Subscription" 
                : t("subscribe") || "Subscribe Now"}
            </button>
          </div>
        </Card>
      </div>
      
      {/* Orders */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">{t("orders") || "My Orders"}</h2>
        {/* Для демо-режима используем параметр showDemoOrders */}
        <OrdersList showDemoOrders={process.env.NODE_ENV !== 'production'} />
      </div>
      
      {/* Панель администратора (отображается только для админов) */}
      {isAdmin && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Settings className="mr-2" size={20} />
            Administrator Panel
          </h2>
          <Card className="p-4 rounded-lg">
            <div className="space-y-4">
              <h3 className="font-medium">Product Management</h3>
              <p className="text-sm text-gray-600">
                Synchronize products with Stripe to automatically add new products or update existing ones.
                Any products created in Stripe will be automatically added to your catalog.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={syncProducts}
                  disabled={isSyncing}
                  className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  <RefreshCw className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} size={18} />
                  {isSyncing ? "Syncing..." : "Sync with Stripe"}
                </button>
                <button
                  onClick={() => setLocation('/stripe-catalog')}
                  className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 flex items-center justify-center"
                >
                  <ShoppingBag className="mr-2" size={18} />
                  Stripe Catalog Manager
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Policies */}
      <div id="policies-section" className="mb-8">
        <h2 className="text-lg font-medium mb-4">{t("policies")}</h2>
        <Card className="rounded-lg divide-y">
          {policies.map((policy, index) => (
            <a
              key={index}
              href={`/policy/${policy.id}`}
              onClick={(e) => {
                e.preventDefault(); // Prevent default to allow our custom navigation
                navigateToPolicy(policy.id);
                return false;
              }}
              className="flex items-center justify-between p-4 w-full text-left"
            >
              <span>{policy.title}</span>
              <ChevronRight className="text-gray-500" size={20} />
            </a>
          ))}
        </Card>
      </div>
      
      {/* Google Play Market */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Google Play Market</h2>
        <Card className="p-4 rounded-lg">
          <p className="text-gray-600 mb-4">
            {t("viewAppOnPlayStore") || "View our app on Google Play with detailed information about features, data safety, and more."}
          </p>
          <button
            onClick={() => setLocation('/playmarket')}
            className="bg-green-600 text-white w-full py-3 rounded-full hover:bg-green-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="mr-2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Google Play Market
          </button>
        </Card>
      </div>

      {/* Close Account Button */}
      <div className="mb-10 mt-10">
        <div className="border-t pt-6">
          <button 
            onClick={handleCloseAccount}
            className="bg-red-600 text-white w-full py-3 rounded-full hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
            disabled={isLoading || !user}
          >
            <Trash2 className="mr-2" size={20} />
            {t("closeAccount") || "Close Account"}
          </button>
          <p className="text-gray-500 text-xs text-center mt-2">
            {t("closeAccountWarning") || "This action permanently deletes your account and all associated data."}
          </p>
        </div>
      </div>
    </div>
  );
}
