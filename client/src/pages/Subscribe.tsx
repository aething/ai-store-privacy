import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  PaymentElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/use-subscription';

// Загружаем Stripe за пределами компонента
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

// Форма для оплаты подписки
function SubscriptionCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Подтверждаем платеж
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // После успешной оплаты перенаправляем на страницу подтверждения
        return_url: `${window.location.origin}/confirmation?type=subscription`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Ошибка при обработке платежа');
      setProcessing(false);
      
      toast({
        title: 'Ошибка оплаты',
        description: submitError.message || 'Произошла ошибка при обработке платежа',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || processing}
      >
        {processing ? 'Обработка...' : 'Подписаться'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>Нажимая кнопку выше, вы соглашаетесь с нашими Условиями подписки</p>
      </div>
    </form>
  );
}

// Основной компонент страницы подписки
export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { data, error, isLoading, refetch } = useSubscription();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Инициируем получение подписки при загрузке страницы
  useEffect(() => {
    const getSubscription = async () => {
      try {
        const result = await refetch();
        if (result.data && result.data.clientSecret) {
          setClientSecret(result.data.clientSecret);
        }
      } catch (err) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось получить данные для подписки',
          variant: 'destructive',
        });
      }
    };
    
    getSubscription();
  }, [refetch, toast]);
  
  // Обработка ошибок и состояния загрузки
  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Загрузка данных...</CardTitle>
            <CardDescription>
              Пожалуйста, подождите
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>
              Не удалось загрузить данные для подписки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {error instanceof Error ? error.message : 'Произошла неизвестная ошибка'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setLocation('/')}>
              Вернуться на главную
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Если нет секретного ключа для клиента, показываем сообщение
  if (!clientSecret) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Подготовка данных</CardTitle>
            <CardDescription>
              Пожалуйста, подождите, мы готовим данные для оформления подписки
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Если есть секретный ключ, показываем форму оплаты
  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Оформление подписки</CardTitle>
          <CardDescription>
            Для продолжения введите данные платежной карты
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscriptionCheckoutForm />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}