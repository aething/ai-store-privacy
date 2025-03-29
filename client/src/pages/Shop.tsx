import { useQuery } from "@tanstack/react-query";
import ProductSlider from "@/components/ProductSlider";
import { Product } from "@/types";
import { Card } from "@/components/ui/card";

export default function Shop() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Categories for the grid
  const categories = [
    { name: "Smart Home", icon: "home" },
    { name: "Health & Fitness", icon: "fitness_center" },
    { name: "Education", icon: "school" },
    { name: "Productivity", icon: "work" },
  ];

  // Get featured product (last in the list)
  const featuredProduct = products && products.length > 0 
    ? products[products.length - 1] 
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-none w-64 h-80 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-error">Error loading products</div>;
  }

  return (
    <div>
      {/* Product Slider */}
      {products && products.length > 0 && (
        <ProductSlider 
          title="Featured Products" 
          products={products.slice(0, 3)} 
        />
      )}

      {/* Featured Section */}
      {featuredProduct && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">New Arrivals</h2>
          <Card className="overflow-hidden">
            <div className="h-56 bg-surface">
              <img 
                src={featuredProduct.imageUrl} 
                alt={featuredProduct.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-medium text-xl mb-2">{featuredProduct.title}</h3>
              <p className="text-text-secondary mb-4">{featuredProduct.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">${(featuredProduct.price / 100).toFixed(2)}</span>
                <button 
                  className="bg-primary text-white px-6 py-2 rounded-full font-medium"
                  onClick={() => window.location.href = `/product/${featuredProduct.id}`}
                >
                  Learn More
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Popular Categories */}
      <div>
        <h2 className="text-lg font-medium mb-4">Popular Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <button key={index} className="card flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-md">
              <span className="material-icons text-primary text-3xl mb-2">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
