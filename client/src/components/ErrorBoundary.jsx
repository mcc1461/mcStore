import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // When an error is thrown in a child component, set 'hasError' to true
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Here you can log error info to an error reporting service if desired
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  // If 'hasError' is true, render fallback UI. Otherwise, render children.
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 my-4 text-red-700 bg-red-100 border border-red-400 rounded">
          <h2 className="font-bold">Something went wrong.</h2>
          <p>We’re sorry for the inconvenience. Please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

// This component is a class component that acts as an error boundary. It catches JavaScript errors anywhere in the child component tree and logs those errors. It also renders a fallback UI if an error occurs. The fallback UI can be customized to display an error message or any other content.
