import { showErrorMessage } from "./alertHelper";
import { RenewalTokenAPI } from "../services/User/userService";

const API_DOMAIN = "http://localhost:8080/";

const ACCEPT_ONLY = { Accept: "application/json" };

function buildHeaders(method, requireAuth, body) {
  const headers = { ...ACCEPT_ONLY };

  const token = localStorage.getItem("accessToken");
  if (requireAuth && token) headers.Authorization = `Bearer ${token}`;

  // Chỉ set Content-Type khi thực sự có JSON body và không phải GET/HEAD
  const hasJsonBody = body && !(body instanceof FormData);
  if (hasJsonBody && method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

async function silentRenew() {
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
}

/** fetch wrapper:
 *  - requireAuth: nếu 401 thì thử silent refresh 1 lần rồi retry
 */
async function apiFetch(path, options = {}, requireAuth = false) {
  const method = (options.method || "GET").toUpperCase();
  const url = API_DOMAIN + path;

  const headers = options.headers || buildHeaders(method, requireAuth, options.body);

  // Nếu dùng cookie phiên, bật credentials: 'include'
  const fetchOpts = { ...options, method, headers };

  let res = await fetch(url, fetchOpts);

  // 401 → thử renew 1 lần rồi retry
  if (requireAuth && res.status === 401) {
    const ok = await silentRenew();
    if (ok) {
      const retryHeaders = options.headers || buildHeaders(method, requireAuth, options.body);
      if (retryHeaders.Authorization) {
        retryHeaders.Authorization = `Bearer ${localStorage.getItem("accessToken")}`;
      }
      res = await fetch(url, { ...fetchOpts, headers: retryHeaders });
    }
  }

  // Đọc body an toàn: thử JSON, fallback text
  let bodyText = "";
  let json = null;
  try {
    bodyText = await res.text();
    json = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    // body không phải JSON
  }

  if (!res.ok) {
    const msg =
      (json?.message && json?.data?.detail && `${json.message}: ${json.data.detail}`) ||
      json?.message ||
      bodyText ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.url = url;
    err.body = bodyText;
    throw err;
  }

  // ✅ Backend luôn trả object có field data
  if (!json) return null;   // nếu 204 No Content thì trả null (tuỳ bạn muốn true hay null)
  return json.data;
}

// ============================Những api lấy giá trị thông thường===========================

export const getWithParams = async (path, params = {}, requireAuth = false) => {
  const query = new URLSearchParams(params).toString();
  const fullPath = path + (query ? `?${query}` : "");
  try {
    return await apiFetch(fullPath, { method: "GET" }, requireAuth);
  } catch (error) {
    showErrorMessage(error.message);
  }
};

export const get = async (path, requireAuth = true) => {
  try {
    return await apiFetch(path, { method: "GET" }, requireAuth);
  } catch (error) {
    showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
  }
};

export const getNoAuth = async (path) => {
  try {
    return await apiFetch(path, { method: "GET" }, false);
  } catch (error) {
    showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
  }
};

export const post = async (values, path, auth = false) => {
  try {
    // headers sẽ do apiFetch tự build
    const data = await apiFetch(
      path,
      { method: "POST", body: JSON.stringify(values) },
      auth
    );
    return data;
  } catch (error) {
    setTimeout(() => showErrorMessage(error.message), 1000);
  }
};

export const del = async (path, auth = true) => {
  try {
    await apiFetch(path, { method: "DELETE" }, auth);
    return true;
  } catch (error) {
    showErrorMessage(error.message);
  }
};

export const patch = async (value, path, auth = true) => {
  try {
    return await apiFetch(
      path,
      { method: "PATCH", body: JSON.stringify(value) },
      auth
    );
  } catch (error) {
    showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
  }
};

export const put = async (values, path, auth = true) => {
  try {
    await apiFetch(
      path,
      { method: "PUT", body: JSON.stringify(values) },
      auth
    );
    return true;
  } catch (error) {
    setTimeout(() => showErrorMessage(error.message), 2000);
  }
};

// =============================những api có gửi file (multipart/form-data)===========================

export const postFormData = async (path, formData, auth = true) => {
  try {
    // KHÔNG set Content-Type để fetch tự gắn boundary
    return await apiFetch(path, { method: "POST", body: formData }, auth);
  } catch (error) {
    showErrorMessage(error.message);
  }
};

export const putFormData = async (path, formData, auth = true) => {
  try {
    return await apiFetch(path, { method: "PUT", body: formData }, auth);
  } catch (error) {
    showErrorMessage(error.message);
  }
};
