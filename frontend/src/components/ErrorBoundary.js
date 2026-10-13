import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error(err); }
  reset = () => {
    try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    window.location.hash = "#/";
    window.location.reload();
  };
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="auth" style={{ textAlign: "center", marginTop: 80 }}>
        <h1>Something went wrong</h1>
        <p className="sub">Try again — if it keeps happening, sign out and back in.</p>
        <button className="btn btn-primary" onClick={this.reset}>Reload Exora</button>
      </div>
    );
  }
}
