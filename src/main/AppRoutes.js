import { useContext } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import ExportPdf from "../screens/Export/ExportPdf";
import Home from '../screens/Home/Home';
import VersionListing from '../screens/Versions/VersionListing';
import Login from '../screens/Login/Login';
import Register from '../screens/Register/Register';
import ReceiptAnalysis from "../screens/ReviewCurriculum/ReceiptAnalysis";
import ReviewCurriculum from "../screens/ReviewCurriculum/ReviewCurriculum";
import UpdateVersions from '../screens/Versions/UpdateVersions';

import { AuthContext } from './SessionProvider';

// 🔐 Rota protegida em React Router v6
function RestrictedRoute({ children, isAuthenticated }) {
    
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}

function AppRoutes({ isAuthenticated }) {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/home"
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <Home />
                    </RestrictedRoute>
                }
            />

            <Route
                path='/versionlisting'
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <VersionListing/>
                    </RestrictedRoute>
                }
            />

            <Route
                path="/updateversions/:id"
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <UpdateVersions />
                    </RestrictedRoute>
                }
            />

            <Route
                path="/exportpdf"
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <ExportPdf/>
                    </RestrictedRoute>
                }
            />

            <Route
                path="/reviewcurriculum"
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <ReviewCurriculum/>
                    </RestrictedRoute>
                }
            />
            
            <Route
                path="/receiptanalysis/:id/:version/:solicitationId"
                element={
                    <RestrictedRoute isAuthenticated={isAuthenticated}>
                        <ReceiptAnalysis/>
                    </RestrictedRoute>
                }
            />

        </Routes>
    );
}

// Wrapper com contexto de autenticação
export default function AppRoutesWrapper() {
  const context = useContext(AuthContext);
  return <AppRoutes isAuthenticated={context.isAuthenticated} />;
}