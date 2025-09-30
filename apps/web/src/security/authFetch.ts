import { userManager } from "../auth/oidc";

function parseWwwAuth(header?: string) {
  if (!header) return {};
  const m = header.match(/ticket="([^"]+)"/);
  const as = header.match(/as_uri="([^"]+)"/);
  return { ticket: m?.[1], as_uri: as?.[1] };
}

async function getAccessToken() {
  const u = await userManager.getUser();
  return u?.access_token || "";
}

async function exchangeUmaRPT(ticket: string) {
  const tokenUrl = import.meta.env.VITE_OIDC_TOKEN_URL as string;
  if (!tokenUrl) throw new Error("UMA token endpoint not configured");
  const u = await userManager.getUser();
  const form = new URLSearchParams();
  form.set("grant_type", "urn:ietf:params:oauth:grant-type:uma-ticket");
  form.set("client_id", import.meta.env.VITE_OIDC_CLIENT_ID as string);
  form.set("ticket", ticket);
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${u?.access_token || ""}` },
    body: form.toString(),
  });
  if (!res.ok) throw new Error("UMA exchange failed");
  const json = await res.json();
  return json.access_token as string; // RPT
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}, opt?: { patientId?: string; purposeOfUse?: string; justification?: string }) {
  const baseHeaders: Record<string, string> = {
    Accept: "application/fhir+json",
    ...(init.headers as Record<string, string>),
  };
  if (opt?.patientId) baseHeaders["X-Patient-Id"] = opt.patientId;
  if (opt?.purposeOfUse) baseHeaders["X-Purpose-Of-Use"] = opt.purposeOfUse;
  if (opt?.justification) baseHeaders["X-Justification"] = opt.justification;

  let at = await getAccessToken();
  let res = await fetch(input, { ...init, headers: { ...baseHeaders, Authorization: `Bearer ${at}` } });

  if (res.status === 403) {
    const { ticket } = parseWwwAuth(res.headers.get("WWW-Authenticate") || undefined);
    if (ticket) {
      try {
        const rpt = await exchangeUmaRPT(ticket);
        res = await fetch(input, { ...init, headers: { ...baseHeaders, Authorization: `Bearer ${rpt}` } });
      } catch { /* deja 403 si falla UMA */ }
    }
  }
  return res;
}
