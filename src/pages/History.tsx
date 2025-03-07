
import React from 'react';
import Layout from '@/components/Layout/Layout';
import SessionHistory from '@/components/History/SessionHistory';

const History = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Focus History</h1>
        <p className="text-muted-foreground">
          Track your productivity and focus sessions over time
        </p>
      </div>
      
      <SessionHistory />
    </Layout>
  );
};

export default History;
