import { UserManager, WebStorageStateStore, Log } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const client_id = import.meta.env.VITE_OIDC_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_OIDC_REDIRECT_URI;
const silent_redirect_uri = import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI;

Log.setLogger(console);
Log.setLevel(Log.INFO);

export const userManager = new UserManager({
  authority, client_id, redirect_uri,
  response_type: "code",
  scope: "openid profile email offline_access",
  automaticSilentRenew: true,
  silent_redirect_uri,
  monitorSession: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export async function login() { await userManager.signinRedirect(); }
export async function logout() { await userManager.signoutRedirect(); }
export async function completeLogin() { return await userManager.signinRedirectCallback(); }
export async function getUser() { return await userManager.getUser(); }
export async function getAccessToken(): Promise<string|null> {
  const u = await userManager.getUser();
  if (!u || u.expired) {
    try { const refreshed = await userManager.signinSilent(); return refreshed?.access_token ?? null; }
    catch { return null; }
  }
  return u.access_token;
}
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
