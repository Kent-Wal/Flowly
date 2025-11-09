/* eslint-disable react-refresh/only-export-components */
import React, { useContext, useState, useEffect, useCallback } from "react";
import { auth } from "../../authentication/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() { 
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const initializeUser = useCallback((user) => {
        if (user) {
            setCurrentUser(user);
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser, (error) => {
            console.error("Auth state change error:", error);
            setLoading(false);
        });
        return unsubscribe;
    }, [initializeUser]);

    // Optional: explicit sign out on tab close. Note many browsers throttle async work here.
    // With session persistence enabled, this is not strictly necessary.
    useEffect(() => {
        const onBeforeUnload = () => {
            // Fire-and-forget; best-effort sign out.
            try { void signOut(auth); } catch { /* noop */ }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, []);

    const value = { currentUser, userLoggedIn, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}