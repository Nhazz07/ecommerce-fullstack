import { createContext, useContext, useState } from "react";
import {
    login as loginUser,
    register as registerUser,
    logout as logoutUser,
    getToken,
} from "../Services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getToken());

    const login = async (loginData) => {
        const response = await loginUser(loginData);

        const accessToken = response.data?.accessToken;

        if (accessToken) {
            setToken(accessToken);
        }

        return response;
    };

    const register = async (registerData) => {
        return await registerUser(registerData);
    };

    const logout = () => {
        logoutUser();
        setToken(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
