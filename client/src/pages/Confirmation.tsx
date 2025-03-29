import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";

export default function Confirmation() {
  const [, setLocation] = useLocation();
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-medium">Order Confirmation</h2>
      </div>
      
      <Card className="p-6 flex flex-col items-center text-center">
        <span className="material-icons text-verified text-5xl mb-4">check_circle</span>
        <h3 className="text-xl font-medium mb-2">Thank You for Your Order!</h3>
        <p className="text-text-secondary mb-6">
          Your payment has been processed successfully. We'll send you an email with your order details.
        </p>
        <button 
          className="bg-primary text-white px-6 py-2 rounded-full font-medium mb-4"
          onClick={() => setLocation("/")}
        >
          Continue Shopping
        </button>
        <button 
          className="text-primary"
          onClick={() => setLocation("/account")}
        >
          View Your Account
        </button>
      </Card>
    </div>
  );
}
