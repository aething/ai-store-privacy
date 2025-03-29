import React from 'react';

const IconTest: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Icon Test Page</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">arrow_back</span>
          <p className="mt-2">arrow_back</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">arrow_forward</span>
          <p className="mt-2">arrow_forward</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">close</span>
          <p className="mt-2">close</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">edit</span>
          <p className="mt-2">edit</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">delete</span>
          <p className="mt-2">delete</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">check</span>
          <p className="mt-2">check</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">warning</span>
          <p className="mt-2">warning</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">info</span>
          <p className="mt-2">info</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">menu</span>
          <p className="mt-2">menu</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">share</span>
          <p className="mt-2">share</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">person</span>
          <p className="mt-2">person (user)</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">search</span>
          <p className="mt-2">search</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">shopping_cart</span>
          <p className="mt-2">shopping_cart</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <span className="material-icons text-3xl">help_outline</span>
          <p className="mt-2">help_outline (fallback)</p>
        </div>
      </div>
    </div>
  );
};

export default IconTest;