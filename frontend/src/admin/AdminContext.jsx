
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { adminApi, adminError } from "./api";

const USER_KEY = "anteiku_admin_user";
const TOKEN_KEY = "anteiku_admin_token";

// Create the admin context in this file.
// This avoids importing AdminContext from a missing file.
export const AdminContext = createContext(null);

// Read the saved admin profile safely.
function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(readStoredUser);

  const [checking, setChecking] = useState(
      () => Boolean(localStorage.getItem(TOKEN_KEY))
  );

  // Clear the session when the user signs out or access is denied.
  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setAdmin(null);
    setChecking(false);
  }, []);

  // Verify that the current token has administrator access.
  // The backend must enforce the ADMIN role for this endpoint.
  const verify = useCallback(async () => {
    return adminApi.users();
  }, []);

  // Authenticate the user and verify administrator access.
  const signIn = useCallback(
      async (credentials) => {
        const account = await adminApi.login(credentials);

        if (!account?.accessToken) {
          throw new Error(
              "Login response did not include an access token."
          );
        }

        // Store the token before calling the protected endpoint.
        localStorage.setItem(TOKEN_KEY, account.accessToken);

        try {
          await verify();
        } catch (error) {
          // Do not keep a token that failed authorization.
          localStorage.removeItem(TOKEN_KEY);

          const message =
              error.response?.status === 403
                  ? "This account does not have administrator access."
                  : adminError(error);

          throw new Error(message, { cause: error });
        }

        // Store only the profile fields needed by the frontend.
        const profile = {
          id: account.id,
          username: account.username,
          email: account.email,
        };

        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setAdmin(profile);

        return profile;
      },
      [verify]
  );

  // Sign out when the API reports that admin access was denied.
  useEffect(() => {
    const handleAdminDenied = () => {
      signOut();
    };

    window.addEventListener(
        "anteiku:admin-denied",
        handleAdminDenied
    );

    return () => {
      window.removeEventListener(
          "anteiku:admin-denied",
          handleAdminDenied
      );
    };
  }, [signOut]);

  // Verify an existing session when the application starts.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setChecking(false);
      return undefined;
    }

    let active = true;

    async function checkSession() {
      try {
        await verify();
      } catch {
        if (active) {
          signOut();
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [verify, signOut]);

  const value = useMemo(
      () => ({
        admin,
        checking,
        signIn,
        signOut,
      }),
      [admin, checking, signIn, signOut]
  );

  return (
      <AdminContext.Provider value={value}>
        {children}
      </AdminContext.Provider>
  );
}

// Convenient hook for components that need admin authentication.
export function useAdmin() {
  const context = useContext(AdminContext);

  if (context === null) {
    throw new Error(
        "useAdmin must be used inside an AdminProvider."
    );
  }

  return context;
}
