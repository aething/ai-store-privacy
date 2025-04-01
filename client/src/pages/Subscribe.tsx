import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';
import stripePromise from '@/lib/stripe';
import { createPrice, getOrCreateSubscription, manageSubscription } from '@/lib/stripe';
import { useLocale } from '@/context/LocaleContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js еще не загружен
      return;
    }

    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
      });

      if (result.error) {
        // Показываем ошибку пользователю
        toast({
          title: 'Ошибка оплаты',
          description: result.error.message || 'Произошла ошибка при обработке платежа',
          variant: 'destructive',
        });
      } else {
        // Успешная оплата будет обработана на странице перенаправления (return_url)
        toast({
          title: 'Подписка активирована',
          description: 'Спасибо за оформление подписки!',
        });

        // Перенаправляем на страницу подтверждения
        setLocation('/confirmation');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла неизвестная ошибка',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Оформление подписки</h2>
        <p className="text-gray-600">
          Введите данные карты для оформления подписки на наши услуги
        </p>
      </div>

      <div className="mb-6">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md transition 
          ${(!stripe || loading) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Обработка...
          </span>
        ) : (
          'Оформить подписку'
        )}
      </button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoadError, setStripeLoadError] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(false);
  const [isCreatingPrice, setIsCreatingPrice] = useState(false);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'payment'>('select');
  const [subscription, setSubscription] = useState<any>(null);
  
  const { user } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useLocale();

  // Проверка загрузки Stripe
  useEffect(() => {
    // Если Stripe не загрузится за 5 секунд, показываем запасной вариант
    const stripeLoadTimeout = setTimeout(() => {
      if (!stripePromise) {
        setStripeLoadError(true);
        toast({
          title: t("paymentSystemUnavailable") || "Платежная система недоступна",
          description: t("tryAgainLater") || "Платежная система временно недоступна. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
      }
    }, 5000);

    return () => clearTimeout(stripeLoadTimeout);
  }, [toast, t]);

  // Если пользователь авторизован и у него есть подписка, проверяем ее статус
  useEffect(() => {
    if (user?.stripeSubscriptionId) {
      // Получаем информацию о текущей подписке
      apiRequest('POST', '/api/get-or-create-subscription', {})
        .then(res => res.json())
        .then(data => {
          setSubscription(data);
        })
        .catch(error => {
          console.error('Error fetching subscription data:', error);
        });
    }
  }, [user]);

  // Функция для создания цены в Stripe
  const handleCreatePrice = async (productId: number, amount: number) => {
    setIsCreatingPrice(true);
    setSelectedPlan(productId);
    
    try {
      // Создаем recurring цену для подписки
      const result = await createPrice(productId, amount, 'usd', true);
      
      if (result.success && result.price) {
        setPriceId(result.price.id);
        toast({
          title: t("priceCreated") || "Цена создана",
          description: t("proceedToSubscription") || "Теперь вы можете оформить подписку",
        });
        
        // После создания цены переходим к оформлению подписки
        handleStartSubscription(result.price.id);
      }
    } catch (error) {
      console.error('Error creating price:', error);
      toast({
        title: t("error") || "Ошибка",
        description: t("failedToCreatePrice") || "Не удалось создать цену. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPrice(false);
    }
  };

  // Функция для начала процесса подписки
  const handleStartSubscription = async (priceId: string) => {
    // Если пользователь не авторизован, перенаправляем на главную
    if (!user) {
      toast({
        title: t("authRequired") || 'Требуется авторизация',
        description: t("loginRequired") || 'Для оформления подписки необходимо войти в аккаунт',
        variant: 'destructive',
      });
      setLocation('/');
      return;
    }

    setIsProcessing(true);

    try {
      // Создаем или получаем существующую подписку для пользователя
      const data = await getOrCreateSubscription(priceId);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSubscriptionError(false);
        setCurrentStep('payment');
      } else {
        // Если нет clientSecret, значит подписка уже активна
        setSubscription(data);
        toast({
          title: t("subscriptionActive") || 'Подписка активна',
          description: t("alreadySubscribed") || 'У вас уже есть активная подписка',
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setSubscriptionError(true);
      toast({
        title: t("error") || 'Ошибка',
        description: t("failedToCreateSubscription") || 'Не удалось создать подписку. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Показываем запасной вариант при ошибке загрузки Stripe или создания подписки
  if (stripeLoadError || subscriptionError) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Сервис временно недоступен</h2>
            
            <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-lg">
              <h4 className="font-semibold mb-2">Система оплаты временно недоступна</h4>
              <p className="mb-3">В настоящее время мы испытываем технические проблемы с нашей платежной системой. Пожалуйста, попробуйте позже.</p>
            </div>
            
            <div className="space-y-3">
              <button 
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md transition hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </button>
              
              <button 
                className="w-full py-3 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md transition hover:bg-gray-300"
                onClick={() => setLocation('/')}
              >
                Вернуться на главную
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-gray-500">Если проблема повторяется, свяжитесь с нашей службой поддержки:</p>
              <p className="text-sm font-medium mt-1">support@yourdomain.com</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!clientSecret) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p>Подготовка подписки...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <SubscribeForm />
        </Elements>
      </div>
    </Layout>
  );
}