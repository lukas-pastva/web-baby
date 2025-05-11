import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* lazy-load first module; more modules just add lines here */
const MilkingDashboard = lazy(() =>
  import("./modules/milking/pages/Dashboard.jsx")
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Loading…</p>}>
        <Routes>
          <Route path="/"          element={<Navigate to="/milking" />} />
          <Route path="/milking/*" element={<MilkingDashboard />} />
          {/* <Route path="/sleep/*" element={<SleepDashboard />} /> */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
