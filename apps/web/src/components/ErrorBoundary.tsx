import React from "react";
type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error("UI ErrorBoundary:", error, info); }
  render() {
    return this.state.hasError ? (
      <div style={{ padding: 16 }}>
        <h2>Ocurrió un error en la interfaz</h2>
        <p>Intenta recargar o vuelve al inicio.</p>
      </div>
    ) : this.props.children;
  }
}
