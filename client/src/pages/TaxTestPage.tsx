import React from 'react';

const TaxTestPage: React.FC = () => {
  console.log('Basic TaxTestPage rendering');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tax Test Page</h1>
      <p className="mb-4">This is a basic test page for tax calculation.</p>
      
      <div className="bg-blue-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Test Content</h2>
        <p>If you can see this content, the page is loading correctly.</p>
      </div>
    </div>
  );
};

export default TaxTestPage;