"use client";

import { useState, useEffect } from "react";

export default function DatabaseInspector() {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      const response = await fetch('/api/inspect-db');
      const data = await response.json();
      
      if (data.success) {
        setDbData(data);
      } else {
        setError(data.error || 'Failed to fetch database info');
      }
    } catch (err) {
      setError('Error connecting to database');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inspecting database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Database Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Inspector</h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database: shoi</h2>
          <p className="text-gray-600">Tables found: {dbData?.tables?.length || 0}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {dbData?.tables?.map((table: string) => (
              <span 
                key={table}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {table}
              </span>
            ))}
          </div>
        </div>

        {dbData?.tableStructures && Object.entries(dbData.tableStructures).map(([tableName, columns]: [string, any]) => (
          <div key={tableName} className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{tableName}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Null</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columns.map((column: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{column.Field}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.Type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.Null}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.Key}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.Default || 'NULL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}