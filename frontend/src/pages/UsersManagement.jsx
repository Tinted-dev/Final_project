import React from 'react';

const UsersManagement = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Users Management (Admin Only)</h1>
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <p className="text-gray-700 text-lg">
          This page will allow administrators to view, create, edit, and delete user accounts.
        </p>
        <p className="text-gray-500 mt-4">
          (Full implementation for user CRUD is a planned future enhancement.)
        </p>
      </div>
    </div>
  );
};

export default UsersManagement;
