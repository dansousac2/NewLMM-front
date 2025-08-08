import React from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthConsumer } from './SessionProvider';

import ReviewCurriculum from "../screens/ReviewCurriculum/ReviewCurriculum";
import ReceiptAnalysis from "../screens/ReviewCurriculum/ReceiptAnalysis";
import ExportPdf from "../screens/Export/ExportPdf";
import Login from '../views/Login';
import Register from '../views/Register';
import Home from '../views/Home';
import UpdateVersions from '../views/UpdateVersions';

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
export default () => (
    <AuthConsumer>
        {(context) => (
            <AppRoutes isAuthenticated={context.isAuthenticated} />
        )}
    </AuthConsumer>
);