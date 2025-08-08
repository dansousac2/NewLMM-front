import React, { useEffect, useState, useCallback, useMemo } from "react";
import AuthService from "../services/AuthenticationApiService";
import LoadingComp from "../components/Extra/LoadingComp";

export const AuthContext = React.createContext();

export default function SessionProvider({ children }) {

    const [loggedUser, setLoggedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    
    const isAuthenticated = loggedUser != null;

    const start = useCallback(() => {
        const user = AuthService.getLoggedUser();
        setLoggedUser(user);
    }, []);

    const login = useCallback(async (email, password) => {
        const user = await AuthService.login(email, password);
        if (user) {
            start();
            return user;
        }
        return null;
    }, [start]);

    const end = useCallback(() => {
        AuthService.logout();
        setLoggedUser(null);
    }, []);

    // Check inicial de autenticação
    useEffect(() => {
        async function checkAuth() {
            const auth = await AuthService.isAuthenticated();
            if (auth) {
                start();
            }
            setLoading(false);
        }
        checkAuth();
    }, [start]);

    // Memoriza o contexto para evitar re-renderizações
    const contextValue = useMemo(() => ({
        loggedUser,
        isAuthenticated,
        login,
        end,
        start,
    }), [loggedUser, isAuthenticated, login, end, start]);

    if (loading) {
        return <LoadingComp render={true} />;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
