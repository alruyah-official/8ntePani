import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-primary flex flex-col items-center justify-center p-6 font-body">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Something went wrong</h1>
              <p className="text-muted text-sm">
                An unexpected application error occurred. We've logged the issue.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-accent text-primary px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#bce628] hover:scale-105 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
