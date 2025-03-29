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
        await apiRequest("GET", `/api/users/${user.id}/verify?token=${data.token}`);
        
        setUser({ ...user, isVerified: true });
        
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
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
              className={`h-3 w-3 rounded-full ${currentUser.isVerified ? "bg-verified" : "bg-error"} mr-2`}
            ></span>
            <span className="text-sm text-text-secondary">
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
            className="bg-primary text-white w-full py-2 rounded"
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
              className="bg-primary text-white w-full py-2 rounded mt-4"
              disabled={isLoading}
            >
              {isLoading ? t("saving") + "..." : t("save") + " " + t("personalInformation")}
            </button>
          </form>
        </Card>
      </div>
      
      {/* Policies */}
      <div>
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
    </div>
  );
}
