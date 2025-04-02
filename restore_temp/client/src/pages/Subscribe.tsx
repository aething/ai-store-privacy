import { useState } from "react";
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Subscribe() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Подписки временно недоступны</h1>
        
        <Card className="p-6 mb-6">
          <div className="text-center">
            <p className="mb-4">
              В настоящее время мы работаем над синхронизацией каталога продуктов с Stripe. 
              Функция подписок будет доступна позже.
            </p>
            
            <Button
              onClick={() => setLocation('/account')}
              className="w-full sm:w-auto"
            >
              Вернуться в аккаунт
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}