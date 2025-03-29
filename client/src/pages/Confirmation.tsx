import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/confirmation");
  const { t } = useLocale();
  const [confirmationType, setConfirmationType] = useState<'order' | 'subscription'>('order');
  
  // Получаем тип подтверждения из URL параметров
  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get('type');
    
    if (type === 'subscription') {
      setConfirmationType('subscription');
    } else {
      setConfirmationType('order');
    }
  }, []);
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-medium">
          {confirmationType === 'subscription' 
            ? t('subscriptionConfirmation') || 'Subscription Confirmation' 
            : t('orderConfirmation') || 'Order Confirmation'}
        </h2>
      </div>
      
      <Card className="p-6 flex flex-col items-center text-center">
        <span className="material-icons text-verified text-5xl mb-4">check_circle</span>
        
        {confirmationType === 'subscription' ? (
          <>
            <h3 className="text-xl font-medium mb-2">
              {t('thankYouForSubscription') || 'Thank You for Your Subscription!'}
            </h3>
            <p className="text-text-secondary mb-6">
              {t('subscriptionProcessed') || 'Your subscription has been successfully activated. You now have access to all premium features.'}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-2">
              {t('thankYouForOrder') || 'Thank You for Your Order!'}
            </h3>
            <p className="text-text-secondary mb-6">
              {t('orderProcessed') || 'Your payment has been processed successfully. We\'ll send you an email with your order details.'}
            </p>
          </>
        )}
        
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium mb-4 hover:bg-blue-700"
          onClick={() => setLocation("/")}
        >
          {confirmationType === 'subscription'
            ? t('explorePremiumFeatures') || 'Explore Premium Features'
            : t('continueShopping') || 'Continue Shopping'}
        </button>
        
        <button 
          className="text-blue-600 hover:text-blue-800"
          onClick={() => setLocation("/account")}
        >
          {t('viewYourAccount') || 'View Your Account'}
        </button>
      </Card>
    </div>
  );
}
