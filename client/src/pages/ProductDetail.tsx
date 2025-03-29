import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAppContext();
  
  const productId = match ? parseInt(params.id) : null;
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
        
        <div className="rounded-lg overflow-hidden bg-gray-200 h-72 mb-6"></div>
        
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="flex justify-between">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="material-icons mr-2"
            onClick={() => setLocation("/")}
          >
            arrow_back
          </button>
          <h2 className="text-lg font-medium">Product Details</h2>
        </div>
        <Card className="p-4">
          <p className="text-error">Error loading product details</p>
        </Card>
      </div>
    );
  }
  
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Account Required",
        description: "Please create an account or log in to make a purchase.",
        variant: "destructive",
      });
      return;
    }
    
    setLocation(`/checkout/${product.id}`);
  };
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          className="material-icons mr-2"
          onClick={() => setLocation("/")}
        >
          arrow_back
        </button>
        <h2 className="text-lg font-medium">Product Details</h2>
      </div>
      
      <Card className="rounded-lg overflow-hidden mb-6">
        <div className="h-72 bg-surface">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <h3 className="font-medium text-xl mb-2">{product.title}</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">${(product.price / 100).toFixed(2)}</span>
            <div className="flex items-center">
              <span className="material-icons text-yellow-500">star</span>
              <span className="material-icons text-yellow-500">star</span>
              <span className="material-icons text-yellow-500">star</span>
              <span className="material-icons text-yellow-500">star</span>
              <span className="material-icons text-yellow-500">star_half</span>
              <span className="ml-1 text-sm">(4.5)</span>
            </div>
          </div>
          
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-text-secondary mb-4">{product.description}</p>
          
          <h4 className="font-medium mb-2">Features</h4>
          <ul className="list-disc list-inside text-text-secondary mb-6">
            {product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          <button 
            className="bg-primary text-white w-full py-3 rounded-full font-medium"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        </div>
      </Card>
      
      <Card className="rounded-lg p-4 bg-white mb-6">
        <h4 className="font-medium mb-3">Specifications</h4>
        <div className="grid grid-cols-2 gap-y-2">
          {product.specifications.map((spec, index) => {
            const [label, value] = spec.split(": ");
            return (
              <React.Fragment key={index}>
                <div className="text-text-secondary">{label}</div>
                <div>{value}</div>
              </React.Fragment>
            );
          })}
        </div>
      </Card>
      
      <Card className="rounded-lg p-4 bg-white">
        <h4 className="font-medium mb-3">Customer Reviews</h4>
        <div className="mb-4 pb-4 border-b">
          <div className="flex justify-between mb-1">
            <div className="font-medium">Jane D.</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className="material-icons text-yellow-500 text-sm">star</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Absolutely love this assistant! It's intuitive and the voice recognition works perfectly even in noisy environments.
          </p>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <div className="font-medium">Mark T.</div>
            <div className="flex">
              {[1, 2, 3, 4].map(i => (
                <span key={i} className="material-icons text-yellow-500 text-sm">star</span>
              ))}
              <span className="material-icons text-text-secondary text-sm">star</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            Great device that's improved my productivity. The only downside is that it occasionally struggles with complex commands.
          </p>
        </div>
      </Card>
    </div>
  );
}
