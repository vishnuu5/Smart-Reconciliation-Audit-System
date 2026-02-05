import React from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
