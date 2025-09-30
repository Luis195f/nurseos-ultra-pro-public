import { useEffect } from "react";
import { userManager } from "../auth/oidc";

export default function LoginPage() {
  useEffect(() => { userManager.signinRedirect(); }, []);
  return <div>Redirigiendo a login…</div>;
}
