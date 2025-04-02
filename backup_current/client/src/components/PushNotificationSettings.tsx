import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestFCMToken, isFirebaseMessagingSupported } from '@/lib/firebase';
import { useLocale } from '@/context/LocaleContext';
import { useAppContext } from '@/context/AppContext';

const PushNotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const { translations } = useLocale();
  const { user } = useAppContext();
  const [supported, setSupported] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Проверяем, поддерживаются ли push-уведомления и есть ли сохраненные настройки
  useEffect(() => {
    const checkPushStatus = async () => {
      // Проверяем поддержку push-уведомлений
      const isPushSupported = isFirebaseMessagingSupported();
      setSupported(isPushSupported);

      if (isPushSupported) {
        // Проверяем, есть ли сохраненная настройка уведомлений
        const notificationEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
        setEnabled(notificationEnabled);

        // Если уведомления включены, обновляем токен FCM
        if (notificationEnabled && user) {
          await updateFCMToken();
        }
      }
    };

    checkPushStatus();
  }, [user]);

  // Обработчик переключения статуса push-уведомлений
  const handleToggleNotifications = async (checked: boolean) => {
    if (!supported) {
      toast({
        title: translations.pushNotifications.unsupported,
        description: translations.pushNotifications.unsupportedDesc,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: translations.pushNotifications.loginRequired,
        description: translations.pushNotifications.loginRequiredDesc,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (checked) {
        // Включаем push-уведомления
        const success = await enablePushNotifications();
        if (success) {
          setEnabled(true);
          localStorage.setItem('pushNotificationsEnabled', 'true');
          toast({
            title: translations.pushNotifications.enabled,
            description: translations.pushNotifications.enabledDesc
          });
        }
      } else {
        // Выключаем push-уведомления
        await disablePushNotifications();
        setEnabled(false);
        localStorage.setItem('pushNotificationsEnabled', 'false');
        toast({
          title: translations.pushNotifications.disabled,
          description: translations.pushNotifications.disabledDesc
        });
      }
    } catch (error: any) {
      console.error('Failed to toggle push notifications:', error);
      toast({
        title: translations.pushNotifications.error,
        description: error.message || translations.pushNotifications.errorDesc,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Включение push-уведомлений
  const enablePushNotifications = async (): Promise<boolean> => {
    try {
      // Запрашиваем разрешение на push-уведомления
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error(translations.pushNotifications.permissionDenied);
      }
      
      // Получаем FCM токен
      await updateFCMToken();
      return true;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      throw error;
    }
  };

  // Отключение push-уведомлений
  const disablePushNotifications = async () => {
    try {
      // Получаем сохраненный endpoint
      const endpoint = localStorage.getItem('pushEndpoint');
      
      if (endpoint && user) {
        // Отправляем запрос на отмену подписки
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint,
            userId: user.id
          })
        });
        
        // Очищаем сохраненный endpoint
        localStorage.removeItem('pushEndpoint');
      }
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      throw error;
    }
  };

  // Обновление FCM токена
  const updateFCMToken = async () => {
    try {
      // Получаем FCM токен
      const token = await requestFCMToken();
      
      if (!token) {
        throw new Error(translations.pushNotifications.tokenFailed);
      }
      
      if (user) {
        // Регистрируем FCM токен на сервере
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription: {
              endpoint: token,
              keys: {
                p256dh: 'firebase-fcm',
                auth: 'firebase-fcm'
              }
            },
            userId: user.id
          })
        });
        
        if (!response.ok) {
          throw new Error(translations.pushNotifications.registrationFailed);
        }
        
        // Сохраняем endpoint для возможности отмены подписки
        localStorage.setItem('pushEndpoint', token);
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  };

  // Если push-уведомления не поддерживаются, не отображаем компонент
  // В production-режиме скрываем компонент, если уведомления не поддерживаются
  if (!supported && import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{translations.pushNotifications.title}</CardTitle>
        <CardDescription>
          {translations.pushNotifications.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="push-notifications"
            checked={enabled}
            onCheckedChange={handleToggleNotifications}
            disabled={loading || !supported || !user}
          />
          <Label htmlFor="push-notifications">
            {translations.pushNotifications.toggle}
          </Label>
        </div>
        {!supported && (
          <p className="text-sm text-destructive mt-2">
            {translations.pushNotifications.unsupportedBrowser}
          </p>
        )}
        {!user && (
          <p className="text-sm text-destructive mt-2">
            {translations.pushNotifications.loginRequiredShort}
          </p>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {translations.pushNotifications.info}
      </CardFooter>
    </Card>
  );
};

export default PushNotificationSettings;