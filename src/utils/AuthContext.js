import React, { createContext, useContext, useState, useEffect } from "react";
import { GetDetailUser } from "../services/User/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accountName = localStorage.getItem("accountName");
    if (accountName) {
      setUser({ accountName });
    }
  }, []);

  const login = async (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("renewalToken", data.renewalToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("accountName", data.accountName);
    localStorage.setItem("role", data.role);
    const result = await GetDetailUser(localStorage.getItem("userId"));
    localStorage.setItem("user", JSON.stringify(result));
    // console.log("user", localStorage.getItem("user"));
    setUser({ accountName: data.accountName });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
