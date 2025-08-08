import React, { useEffect, useState, useCallback } from "react";
import AuthenticationApiService from "../services/AuthenticationApiService";
import LoadingComp from "../components/Extra/LoadingComp";

export const AuthContext = React.createContext();
export const AuthConsumer = AuthContext.Consumer;

export default function SessionProvider({ children }) {
    const [loggedUser, setLoggedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const service = AuthenticationApiService();

    const start = useCallback(() => {
        const user = service.getLoggedUser();
        const token = service.getToken();
        setLoggedUser(user);
        service.registerToken(token);
    }, [service]);

    const login = useCallback(async (email, password) => {
        const user = await service.login(email, password);
        if (user) {
            start();
            return user;
        } else {
            return null;
        }
    }, [service, start]);

    const end = useCallback(() => {
        console.log("A sessão está sendo encerrada!");
        setLoggedUser(null);
        service.logout();
    }, [service]);

    const isAuthenticated = loggedUser != null;

    useEffect(() => {
        async function checkAuth() {
            const auth = await service.isAuthenticated();
            if (auth) {
                start();
            }
            setLoading(false);
        }
        checkAuth();
    }, [service, start]);

    if (loading) {
        return <LoadingComp render={true} />
    }

    const context = {
        loggedUser,
        isAuthenticated,
        login,
        end,
        start
    };

    return (
        <AuthContext.Provider value={context}>
            {children}
        </AuthContext.Provider>
    );
}
