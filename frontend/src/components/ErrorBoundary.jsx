import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 max-w-4xl mx-auto mt-20 bg-red-900 border-4 border-red-500 text-white rounded-2xl overflow-auto">
          <h1 className="text-3xl font-black mb-4">CRITICAL REACT CRASH</h1>
          <p className="text-lg mb-4">The component threw an exception during render.</p>
          <pre className="bg-black/50 p-6 rounded font-mono text-xs text-red-200">
            {this.state.error?.toString()}
          </pre>
          <pre className="bg-black/50 p-6 rounded font-mono text-xs mt-4 text-slate-300">
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
