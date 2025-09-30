import AIPanel from "./pages/AIPanel";
import CodeBlue from "./pages/CodeBlue";
import Deceased from "./pages/Deceased";
// src/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "./layouts/MainLayout";

const Home       = lazy(() => import("./pages/App"));
const Scales     = lazy(() => import("./pages/Scales"));
const Registry   = lazy(() => import("./pages/Registry"));
const Education  = lazy(() => import("./pages/Education"));
const Management = lazy(() => import("./pages/Management"));
const Research   = lazy(() => import("./pages/Research"));
const Handover   = lazy(() => import("./pages/Handover"));
const ADT        = lazy(() => import("./pages/ADT"));
const BCMAHospital = lazy(() => import("./pages/BCMAHospital"));
const Audit = lazy(() => import("./pages/Audit"));
const BCMAPro = lazy(() => import("./pages/BCMAPro"));

function NotFound(){ return <div style={{ padding:16 }}>404 — Página no encontrada</div>; }

export default function AppRouter(){
  return (
    <Suspense fallback={<div style={{ padding:16 }}>Cargando…</div>}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="scales" element={<Scales />} />
          <Route path="registry" element={<Registry />} />
          <Route path="education" element={<Education />} />
          <Route path="management" element={<Management />} />
          <Route path="research" element={<Research />} />
          <Route path="handover" element={<Handover />} />
          <Route path="adt" element={<ADT />} />
          <Route path="adt/code-blue" element={<CodeBlue />} />
          <Route path="ai" element={<AIPanel />} />
          <Route path="bcma-hg" element={<BCMAHospital />} />
          <Route path="audit" element={<Audit />} />
          <Route path="bcma-pro" element={<BCMAPro />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/" element={<Navigate to="/registry" replace />} />
        <Route path="code-blue" element={<CodeBlue />} />`r`n  <Route path="deceased" element={<Deceased />} />`r`n</Routes>
    </Suspense>
  );
}





