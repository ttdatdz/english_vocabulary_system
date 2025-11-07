import React, { createContext, useContext, useState, useEffect } from "react";
import { GetDetailUser, RenewalTokenAPI } from "../services/User/userService";
import { useNavigate } from "react-router-dom";
import { get } from "./request";

const AuthContext = createContext();

function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])) || {}; } catch { return {}; }
}
function isExpired(token, skewSec = 60) {
  const { exp } = parseJwt(token) || {};
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= (exp - skewSec);
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();                // ✅ Hook ở top-level
  const [user, setUser] = useState(null);

  const silentRenew = async () => {
    const rt = localStorage.getItem("renewalToken");
    if (!rt) return false;
    try {
      const res = await RenewalTokenAPI(rt);
      if (!res?.token) return false;
      localStorage.setItem("accessToken", res.token);
      return true;
    } catch { return false; }
  };

  // redirectHome = true nếu muốn quay về Home khi fetch OK
  const fetchUser = async (interactive = false, redirectHome = false) => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    if (!userId || !accessToken) return;

    if (isExpired(accessToken)) {
      const ok = await silentRenew();
      if (!ok) {
        if (interactive) {
          const doRenew = window.confirm("Phiên đăng nhập đã hết hạn. Bạn có muốn gia hạn phiên không?");
          if (doRenew) {
            const ok2 = await silentRenew();
            if (!ok2) { alert("Không thể gia hạn. Vui lòng đăng nhập lại."); return logout(); }
          } else { return logout(); }
        } else {
          return logout({ keepNonSensitive: true });
        }
      }
    }

    try {
      // ✅ dùng đường dẫn tuyệt đối để tránh lỗi ở route sâu
      const data = await get(`/api/user/getUserByFilter?userID=${userId}`, true);
      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        if (redirectHome) navigate("/", { replace: true });  // ✅ điều hướng tại đây
      }
    } catch {
      if (interactive) {
        const doRenew = window.confirm("Phiên đăng nhập đã hết hạn. Bạn có muốn gia hạn phiên không?");
        if (doRenew && await silentRenew()) return fetchUser(true, redirectHome);
      }
      alert("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.");
      logout({ keepNonSensitive: true });
    }
  };

  useEffect(() => {
    const at = localStorage.getItem("accessToken");
    if (at) {
      // Khởi động im lặng; nếu muốn auto về Home khi hợp lệ thì đặt redirectHome = true
      fetchUser(false, false);
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
    if(data.role == "USER")
    navigate("/", { replace: true });  
  else if(data.role == "ADMIN")
    navigate("/admin", { replace: true });  

              // ✅ điều hướng sau login
  };

  const logout = ({ keepNonSensitive = false } = {}) => {
    if (keepNonSensitive) {
      const theme = localStorage.getItem("theme");
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);
    } else {
      localStorage.clear();
    }
    setUser(null);
    navigate("/login", { replace: true });       // (tùy chọn)
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    await fetchUser(true);
  };

  const ensureAuthenticated = async () => {
    const at = localStorage.getItem("accessToken");
    if (!at) return false;
    if (isExpired(at) && !(await silentRenew())) return false;
    if (!user) await fetchUser(true);
    return !!localStorage.getItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUser, updateUser, ensureAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
