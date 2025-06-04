import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* lazy-loaded pages */
const MilkingDashboard = lazy(() => import("./modules/milking/pages/Dashboard.jsx"));
const MilkingHistory   = lazy(() => import("./modules/milking/pages/History.jsx"));
const WeightDashboard  = lazy(() => import("./modules/weight/pages/Dashboard.jsx"));
const NotesDashboard   = lazy(() => import("./modules/notes/pages/Dashboard.jsx"));
const HelpPage         = lazy(() => import("./modules/help/Help.jsx"));
const ConfigPage       = lazy(() => import("./modules/config/Config.jsx"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p style={{ padding: 20 }}>Loading…</p>}>
        <Routes>
          <Route path="/"            element={<Navigate to="/milking" />} />
          <Route path="/milking"     element={<MilkingDashboard />} />
          <Route path="/milking/all" element={<MilkingHistory />} />
          <Route path="/weight"      element={<WeightDashboard />} />
          <Route path="/notes"       element={<NotesDashboard />} />
          <Route path="/help"        element={<HelpPage />} />
          <Route path="/config"      element={<ConfigPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
