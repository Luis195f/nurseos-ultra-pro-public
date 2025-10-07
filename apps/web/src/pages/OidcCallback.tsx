import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userManager } from "../auth/oidc";

export default function OidcCallback() {
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      try { await userManager.signinRedirectCallback(); }
      catch (e) { console.error("OIDC callback error", e); }
      nav("/", { replace: true });
    })();
  }, [nav]);
  return <div style={{padding:16}}>Autenticando…</div>;
}

