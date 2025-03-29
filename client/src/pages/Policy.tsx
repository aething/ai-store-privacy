import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { getPolicyById } from "@/constants/policies";

export default function Policy() {
  const [match, params] = useRoute("/policy/:id");
  const [, setLocation] = useLocation();
  
  const policyId = match ? params.id : null;
  
  const policy = useMemo(() => {
    if (!policyId) return null;
    return getPolicyById(policyId);
  }, [policyId]);
  
  if (!policy) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            className="material-icons mr-2"
            onClick={() => setLocation("/account")}
          >
            arrow_back
          </button>
          <h2 className="text-lg font-medium">Policy Not Found</h2>
        </div>
        <Card className="p-4">
          <p>The requested policy could not be found.</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-4">
        <button 
          className="material-icons mr-2"
          onClick={() => setLocation("/account")}
        >
          arrow_back
        </button>
        <h2 className="text-lg font-medium">{policy.title}</h2>
      </div>
      
      <Card className="p-4 rounded-lg">
        <div dangerouslySetInnerHTML={{ __html: policy.content }} />
      </Card>
    </div>
  );
}
