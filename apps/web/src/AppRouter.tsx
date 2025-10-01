// apps/web/src/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "./layouts/MainLayout";

// Secciones existentes (lazy)
const App           = lazy(() => import("./pages/App"));
const Registry      = lazy(() => import("./pages/Registry"));
const Education     = lazy(() => import("./pages/Education"));
const Management    = lazy(() => import("./pages/Management"));
const Research      = lazy(() => import("./pages/Research"));
const Handover      = lazy(() => import("./pages/Handover"));
const ADT           = lazy(() => import("./pages/ADT"));
const BCMAHospital  = lazy(() => import("./pages/BCMAHospital"));
const Audit         = lazy(() => import("./pages/Audit"));
const BCMAPro       = lazy(() => import("./pages/BCMAPro"));

// Nuevas/confirmadas
const AIPanel       = lazy(() => import("./pages/AIPanel"));
const Scales        = lazy(() => import("./pages/Scales"));
const CodeBlue      = lazy(() => import("./pages/CodeBlue"));
const Deceased      = lazy(() => import("./pages/Deceased"));
const PatientRecord = lazy(() => import("./pages/PatientRecord"));


export default function AppRouter() {
  return (
    <Suspense fallback={<div className="p-8">Cargando…</div>}>
      <Routes>
        {/* Todo lo que usa el layout principal */}
        <Route element={<MainLayout />}>
          {/* Página por defecto del layout */}
          <Route index element={<App />} />

          {/* Módulos base */}
          <Route path="registry" element={<Registry />} />
          <Route path="education" element={<Education />} />
          <Route path="management" element={<Management />} />
          <Route path="research" element={<Research />} />
          <Route path="handover" element={<Handover />} />
          <Route path="adt" element={<ADT />} />
          <Route path="bcma-hg" element={<BCMAHospital />} />
          <Route path="audit" element={<Audit />} />
          <Route path="bcma-pro" element={<BCMAPro />} />

          {/* Nuevos */}
          <Route path="ai" element={<AIPanel />} />
          <Route path="scales" element={<Scales />} />
          <Route path="adt/code-blue" element={<CodeBlue />} />
          <Route path="deceased" element={<Deceased />} />

          {/* Detalle de paciente (temporalmente apunta a Registry) */}
          <Route path="patients/:id" element={<PatientRecord />} />
        </Route>

        {/* Root → redirección al área principal que prefieras */}
        <Route path="/" element={<Navigate to="/registry" replace />} />

        {/* Rutas fuera del layout (si alguna no debe usar MainLayout) */}
        <Route path="code-blue" element={<CodeBlue />} />

        {/* 404 */}
        <Route
          path="*"
          element={<div className="p-8">404 — Página no encontrada</div>}
        />
      </Routes>
    </Suspense>
  );
}







