import React, { createContext, useContext, useState, useEffect } from "react";
import { GetDetailUser, RenewalTokenAPI } from "../services/User/userService";
import { get } from "./request";

const AuthContext = createContext();

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload || {};
  } catch {
    return {};
  }
}
function isExpired(token, skewSec = 60) {
  const { exp } = parseJwt(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= (exp - skewSec);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /** Silent renew: không hỏi người dùng. Trả về true nếu gia hạn thành công */
  const silentRenew = async () => {
    const rt = localStorage.getItem("renewalToken");
    if (!rt) return false;
    try {
      const res = await RenewalTokenAPI(rt);
      if (!res?.token) return false;
      localStorage.setItem("accessToken", res.token);
      return true;
    } catch {
      return false;
    }
  };

  /** Fetch user — interactive quyết định có hỏi "Gia hạn phiên?" hay không */
  const fetchUser = async (interactive = false) => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    if (!userId || !accessToken) return;

    // Nếu token đã hết hạn trên client => thử silent renew luôn
    if (isExpired(accessToken)) {
      const ok = await silentRenew();
      if (!ok) {
        // Hết hạn thật, chỉ hỏi khi user đang tương tác
        if (interactive) {
          const doRenew = window.confirm(
            "Phiên đăng nhập đã hết hạn. Bạn có muốn gia hạn phiên không?"
          );
          if (doRenew) {
            const ok2 = await silentRenew();
            if (!ok2) {
              alert("Không thể gia hạn phiên đăng nhập. Vui lòng đăng nhập lại.");
              return logout();
            }
          } else {
            return logout();
          }
        } else {
          // lúc khởi động im lặng: không hỏi, chuyển về anonymous
          return logout({ keepNonSensitive: true });
        }
      }
    }

    try {
      const data = await get(`api/user/getUserByFilter?userID=${userId}`, true);
      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      // Trường hợp server trả 401 mà client chưa kịp silent renew trong request wrapper
      // thì coi như hết hạn -> interactive mới hỏi
      if (interactive) {
        const doRenew = window.confirm(
          "Phiên đăng nhập đã hết hạn. Bạn có muốn gia hạn phiên không?"
        );
        if (doRenew) {
          const ok = await silentRenew();
          if (ok) return fetchUser(true);
        }
      }
      alert("Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.");
      logout({ keepNonSensitive: true });
    }
  };

  /** Khởi động ứng dụng: im lặng, không pop-up */
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetchUser(false);
    }
    // else: anonymous -> không làm gì
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

  /** logout: có tùy chọn giữ lại dữ liệu không nhạy cảm nếu bạn muốn */
  const logout = ({ keepNonSensitive = false } = {}) => {
    if (keepNonSensitive) {
      const theme = localStorage.getItem("theme"); // ví dụ
      localStorage.clear();
      if (theme) localStorage.setItem("theme", theme);
    } else {
      localStorage.clear();
    }
    setUser(null);
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    await fetchUser(true);
  };

  /** Tiện ích: gọi trước các hành động cần đăng nhập
   *  - Nếu anonymous: chuyển hướng/hiện modal login
   *  - Nếu token sắp hết hạn: silent renew
   *  - Trả true nếu đã sẵn sàng (đăng nhập hợp lệ) */
  const ensureAuthenticated = async () => {
    const at = localStorage.getItem("accessToken");
    if (!at) return false;
    if (isExpired(at)) {
      const ok = await silentRenew();
      if (!ok) return false;
    }
    if (!user) await fetchUser(true);
    return !!localStorage.getItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, fetchUser, updateUser, ensureAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
