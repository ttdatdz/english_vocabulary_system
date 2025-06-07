import React, { createContext, useContext, useState, useEffect } from "react";
import { GetDetailUser, RenewalTokenAPI } from "../services/User/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Hàm fetch lại thông tin user theo token hiện tại
  const fetchUser = async () => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    if (!userId || !accessToken) return;

    try {
      const userDetail = await GetDetailUser(userId, accessToken);
      setUser(userDetail);
      localStorage.setItem("user", JSON.stringify(userDetail));
    } catch (error) {
      // Nếu hết hạn token
      if (error.response && [401, 403].includes(error.response.status)) {
        const doRenew = window.confirm("Phiên đăng nhập đã hết hạn. Bạn có muốn gia hạn phiên không?");
        if (doRenew) {
          try {
            const renewalToken = localStorage.getItem("renewalToken");
            const result = await RenewalTokenAPI(renewalToken);
            localStorage.setItem("accessToken", result.token);
            // Gọi lại fetchUser với token mới
            return await fetchUser();
          } catch (err) {
            alert("Không thể gia hạn phiên đăng nhập. Vui lòng đăng nhập lại.");
            logout();
          }
        } else {
          logout();
        }
      } else {
        alert("Lỗi khi lấy thông tin người dùng. Vui lòng thử lại.");
        logout();
      }
    }
  };


  useEffect(() => {
    const accountName = localStorage.getItem("accountName");
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetchUser();
    }
  }, []);

  const login = async (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("renewalToken", data.renewalToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("accountName", data.accountName);
    localStorage.setItem("role", data.role);
    const result = await GetDetailUser(data.userId, data.accessToken);
    localStorage.setItem("user", JSON.stringify(result));
    setUser(result);
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
