import React, { useState } from 'react';
import { gigsApi } from '../../api/gigs';

export default function ApiTest() {
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const testConnection = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      await gigsApi.fetchGigs({ limit: 1 });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Connection failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl max-w-md mx-auto my-12 shadow-2xl">
      <h3 className="text-xl font-bold mb-4 font-display text-text-primary">Developer Tools</h3>
      <button 
        onClick={testConnection} 
        disabled={status === 'loading'}
        className="px-6 py-3 bg-accent text-[#0A0A0A] font-bold rounded-lg hover:bg-[#bce628] transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'Testing...' : 'Test API connection'}
      </button>
      
      {status === 'success' && (
        <p className="mt-6 text-green-500 font-bold bg-green-500/10 px-6 py-3 rounded-lg border border-green-500/20">
          Connected!
        </p>
      )}
      
      {status === 'error' && (
        <p className="mt-6 text-red-500 font-medium text-sm bg-red-500/10 px-6 py-3 rounded-lg text-center break-words max-w-full border border-red-500/20">
          Error: {errorMsg}
        </p>
      )}
    </div>
  );
}
