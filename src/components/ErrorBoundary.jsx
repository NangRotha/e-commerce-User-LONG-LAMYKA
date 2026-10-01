import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: "48px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎀</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "8px", color: "#e11d48" }}>
            សូមអភ័យទោស មានបញ្ហាបន្តិចបន្តួច
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
            Something went wrong while loading this section.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              backgroundColor: "#a855f7",
              color: "#ffffff",
              border: "none",
              borderRadius: "16px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
            }}
          >
            Refresh ទំព័រឡើងវិញ 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
