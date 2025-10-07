export function registerSW() {
  if (typeof window === "undefined") return;
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
        // opcional: log
        // console.log("[PWA] Service Worker registrado");
      } catch (e) {
        console.warn("[PWA] SW registro falló", e);
      }
    });
  }
}
