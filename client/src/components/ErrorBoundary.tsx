import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component that captures React errors,
 * particularly focusing on hooks-related errors
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging purposes
    const componentName = this.props.componentName || 'unknown';
    console.error(`[ErrorBoundary] Error in ${componentName}:`, error);
    console.error(`[ErrorBoundary] Component stack:`, errorInfo.componentStack);
    
    // Check if it's a hook-related error
    if (error.message.includes('Invalid hook call') || 
        error.message.includes('Cannot read properties of null') ||
        error.message.includes('useState') ||
        error.message.includes('useEffect') ||
        error.message.includes('hooks')) {
      console.error(`[ErrorBoundary] React Hooks error detected in ${componentName}`);
    }
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    
    if (hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise, use the default error UI
      return (
        <div 
          style={{
            padding: '20px',
            margin: '20px 0',
            backgroundColor: '#fff8f8',
            border: '1px solid #ffcdd2',
            borderRadius: '4px',
            color: '#d32f2f'
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Component Error{this.props.componentName ? ` in ${this.props.componentName}` : ''}
          </h3>
          
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
            <summary>See error details</summary>
            <p>{error?.toString()}</p>
            <p style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {errorInfo?.componentStack}
            </p>
          </details>
          
          <div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                marginRight: '10px',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/force-update/'}
              style={{
                backgroundColor: '#198754',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Cache
            </button>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;