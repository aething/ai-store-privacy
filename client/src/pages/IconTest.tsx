import React from 'react';
import Icon from '@/components/Icon';

const IconTest: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Icon Test Page</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="arrow_back" size="large" />
          <p className="mt-2">arrow_back</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="arrow_forward" size="large" />
          <p className="mt-2">arrow_forward</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="close" size="large" />
          <p className="mt-2">close</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="edit" size="large" />
          <p className="mt-2">edit</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="delete" size="large" />
          <p className="mt-2">delete</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="check" size="large" />
          <p className="mt-2">check</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="warning" size="large" />
          <p className="mt-2">warning</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="info" size="large" />
          <p className="mt-2">info</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="menu" size="large" />
          <p className="mt-2">menu</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="share" size="large" />
          <p className="mt-2">share</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="user" size="large" />
          <p className="mt-2">user</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="search" size="large" />
          <p className="mt-2">search</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="shopping_cart" size="large" />
          <p className="mt-2">shopping_cart</p>
        </div>
        
        <div className="p-4 border rounded flex flex-col items-center">
          <Icon name="missing_icon" size="large" />
          <p className="mt-2">missing_icon (fallback)</p>
        </div>
      </div>
    </div>
  );
};

export default IconTest;