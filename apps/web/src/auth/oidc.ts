import { UserManager, WebStorageStateStore, Log, type UserManagerSettings } from "oidc-client-ts";

const origin = window.location.origin;

const settings: UserManagerSettings = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY!,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID!,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI ?? `${origin}/oidc/callback`,
  silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI ?? `${origin}/oidc/silent-renew`,
  post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? origin,
  response_type: "code",
  scope: "openid profile email",
  loadUserInfo: false,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

Log.setLogger(console);
Log.setLevel(Log.INFO);

export const userManager = new UserManager(settings);

export async function getUserSafe() {
  try { return await userManager.getUser(); } catch { return null; }
}
export async function signIn()  { await userManager.signinRedirect(); }
export async function signOut() { await userManager.signoutRedirect(); }

