import { useEffect } from "react";
import { userManager } from "../auth/oidc";

export default function OidcSilentRenew() {
  useEffect(() => { userManager.signinSilentCallback(); }, []);
  return <div>OK</div>;
}
