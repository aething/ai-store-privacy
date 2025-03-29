import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { useLocation } from 'wouter';

// Убедитесь, что ключ Stripe загружен
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

// Загружаем Stripe вне компонента для оптимизации
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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
  const { user } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на главную
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Для оформления подписки необходимо войти в аккаунт',
        variant: 'destructive',
      });
      setLocation('/');
      return;
    }

    // PRICE_ID должен быть создан в панели управления Stripe и привязан к продукту
    // В реальном проекте его нужно получать из конфигурации или из API
    const PRICE_ID = 'price_test123'; // Замените на реальный price_id из Stripe

    // Создаем или получаем существующую подписку для пользователя
    apiRequest('POST', '/api/get-or-create-subscription', { priceId: PRICE_ID })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create subscription');
        return res.json();
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          // Если нет clientSecret, значит подписка уже активна
          toast({
            title: 'Подписка активна',
            description: 'У вас уже есть активная подписка',
          });
          setLocation('/account');
        }
      })
      .catch((error) => {
        console.error('Error creating subscription:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать подписку. Попробуйте позже.',
          variant: 'destructive',
        });
      });
  }, [user, toast, setLocation]);

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