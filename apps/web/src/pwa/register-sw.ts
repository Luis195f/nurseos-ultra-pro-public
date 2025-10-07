export function registerSW() {
  if (typeof window === "undefined") return;
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (e) {
        console.warn("[PWA] SW registro falló", e);
      }
    });
  }
}
