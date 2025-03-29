import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { useLocation } from "wouter";
import MaterialInput from "@/components/MaterialInput";
import { Card } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import { useLocale } from "@/context/LocaleContext";

const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  street: z.string().optional(),
  house: z.string().optional(),
  apartment: z.string().optional(),
});

type UpdateUserForm = z.infer<typeof updateUserSchema>;

export default function Account() {
  const { user, setUser } = useAppContext();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();
  
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateUserForm>({
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error sending verification email");
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Verification email sent. Please check your inbox.",
      });
      
      // For demo purposes only: auto-verify the user
      if (data.token) {
        const verifyResponse = await apiRequest("GET", `/api/users/${user.id}/verify?token=${data.token}`);
        
        if (!verifyResponse.ok) {
          throw new Error("Failed to verify email");
        }
        
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
      const response = await apiRequest("PUT", `/api/users/${user.id}`, data);
      const updatedUser = await response.json();
      
      setUser({ ...user, ...updatedUser });
      
      toast({
        title: "Success",
        description: "Your information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your information",
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
      const response = await apiRequest("DELETE", `/api/users/${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to close account");
      }
      
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
  
  const navigateToPolicy = (policyId: string) => {
    setLocation(`/policy/${policyId}`);
  };
  
  const policies = [
    { id: "delivery-policy", title: "Delivery Policy" },
    { id: "return-policy", title: "Return & Exchange Policy" },
    { id: "contact-info", title: "Contact Information" },
    { id: "privacy-policy", title: "Privacy Policy" },
    { id: "payment-terms", title: "Payment Terms" },
    { id: "warranty", title: "Warranty & Liability" },
    { id: "terms", title: "Terms of Service" },
    { id: "gdpr", title: "GDPR" },
    { id: "ftc", title: "FTC Rules" },
  ];
  
  // Mock user if not logged in (for demo)
  const mockUser = {
    email: "user@example.com",
    isVerified: false,
  };
  
  const currentUser = user || mockUser;
  
  return (
    <div>
      {/* Account Verification */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{t("account")}</h2>
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
            label={t("emailAddress")}
            defaultValue={currentUser.email}
            readOnly
          />
          <button 
            className="bg-blue-600 text-white w-full py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            onClick={handleVerifyEmail}
            disabled={isLoading || currentUser.isVerified}
          >
            {isLoading ? t("submit") + "..." : t("verifyEmail")}
          </button>
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <MaterialInput
              id="name"
              label={t("name") || "Full Name"}
              register={register("name")}
              error={errors.name?.message}
            />
            <MaterialInput
              id="phone"
              label={t("phone") || "Phone Number"}
              register={register("phone")}
              error={errors.phone?.message}
            />
            <MaterialInput
              id="country"
              label={t("country") || "Country"}
              register={register("country")}
              error={errors.country?.message}
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
              className="bg-blue-600 text-white w-full py-2 rounded-full mt-4 hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
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
                : t("noSubscription") || "You don't have an active subscription"}
            </p>
            
            {user?.stripeSubscriptionId ? (
              <div className="flex flex-col space-y-3 w-full max-w-xs">
                <button
                  onClick={() => {
                    if (confirm(t("cancelSubscriptionConfirm") || "Are you sure you want to cancel your subscription at the end of the billing period?")) {
                      // Вызываем API для отмены подписки
                      fetch('/api/manage-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'cancel' })
                      })
                      .then(response => {
                        if (response.ok) {
                          toast({
                            title: t("success") || "Success",
                            description: t("subscriptionCancelled") || "Your subscription will be cancelled at the end of the billing period",
                          });
                        } else {
                          throw new Error(t("errorCancellingSubscription") || "Error cancelling subscription");
                        }
                      })
                      .catch(error => {
                        toast({
                          title: t("error") || "Error",
                          description: error.message || t("errorCancellingSubscription") || "Error cancelling subscription",
                          variant: "destructive",
                        });
                      });
                    }
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                  disabled={isLoading || !user}
                >
                  {t("cancelSubscription") || "Cancel Subscription"}
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(t("cancelImmediatelyConfirm") || "Are you sure you want to cancel your subscription immediately? This cannot be undone.")) {
                      // Вызываем API для немедленной отмены подписки
                      fetch('/api/manage-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'cancel_immediately' })
                      })
                      .then(response => {
                        if (response.ok) {
                          toast({
                            title: t("success") || "Success",
                            description: t("subscriptionCancelledImmediately") || "Your subscription has been cancelled immediately",
                          });
                          // Обновляем данные пользователя
                          // Перезагружаем страницу, чтобы получить обновленные данные
                          window.location.reload();
                        } else {
                          throw new Error(t("errorCancellingSubscription") || "Error cancelling subscription");
                        }
                      })
                      .catch(error => {
                        toast({
                          title: t("error") || "Error",
                          description: error.message || t("errorCancellingSubscription") || "Error cancelling subscription",
                          variant: "destructive",
                        });
                      });
                    }
                  }}
                  className="text-red-500 underline text-sm px-6 py-2"
                  disabled={isLoading || !user}
                >
                  {t("cancelImmediately") || "Cancel Immediately"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLocation('/subscribe')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading || !user}
              >
                {t("subscribe") || "Subscribe Now"}
              </button>
            )}
          </div>
        </Card>
      </div>
      
      {/* Policies */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">{t("policies")}</h2>
        <Card className="rounded-lg divide-y">
          {policies.map((policy, index) => (
            <button
              key={index}
              className="flex items-center justify-between p-4 w-full text-left"
              onClick={() => navigateToPolicy(policy.id)}
            >
              <span>{policy.title}</span>
              <span className="material-icons text-text-secondary">chevron_right</span>
            </button>
          ))}
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
            <span className="material-icons mr-2">delete_forever</span>
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
