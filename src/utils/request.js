import { showErrorMessage } from "./alertHelper";

const API_DOMAIN = "http://localhost:8080/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getWithParams = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = API_DOMAIN + path + (query ? `?${query}` : "");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`${result.message}: ${result.data.detail}`);
    }
    return result.data;
  } catch (error) {
    showErrorMessage(error.message);
  }
};

// ============================Những api lấy giá trị thông thường===========================

export const get = async (path) => {
  try {
    const response = await fetch(API_DOMAIN + path, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (!response.ok) {
      // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
      throw new Error(`Lỗi: ${result.message}: ${result.data.detail}`);
    }
    return result.data;
  } catch (error) {
    showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
  }
};
export const getNoAuth = async (path) => {
  try {
    const response = await fetch(API_DOMAIN + path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const result = await response.json();
    if (!response.ok) {
      // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
      throw new Error(`Lỗi: ${result.message}: ${result.data.detail}`);
    }
    return result.data;
  } catch (error) {
    showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
  }
};
export const post = async (values, path, auth = false) => {
  try {
    const headers = {
      "Content-type": "application/json",
      Accept: "application/json",
    };
    if (auth) {
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(API_DOMAIN + path, {
      method: "POST",
      headers,
      body: JSON.stringify(values), //nơi chứa data để gửi lên server. Trước khi gửi phải chuyển nó qua dạng json
    });

    const result = await response.json();

    if (response.ok) {
      return result.data;
    } else {
      throw new Error(`${result.message}: ${result.data.detail}`);
    }
  } catch (error) {
    setTimeout(() => {
      showErrorMessage(error.message);
    }, 1000);
  }
};

export const del = async (path, auth = true) => {
  try {
    const headers = {
      "Content-type": "application/json",
      Accept: "application/json",
    };
    if (auth) {
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    console.log("API_DOMAIN + path:", API_DOMAIN + path);
    const response = await fetch(API_DOMAIN + path, {
      method: "DELETE",
      headers,
    });
    const result = await response.json();
    if (response.ok) {
      return true;
    } else {
      throw new Error(result.message + ": " + result.data.detail);
    }
  } catch (error) {
    showErrorMessage(error.message); // 🐞 Hiển thị lỗi
  }
};
export const patch = async (value, path, auth = true) => {
  try {
    const headers = {
      "Content-type": "application/json",
      Accept: "application/json",
    };
    if (auth) {
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(API_DOMAIN + path, {
      method: "PATCH",
      headers,
      body: JSON.stringify(value),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`${result.message}: ${result.data.detail}`);
    }
    return result.data;
  } catch (error) {
    alert(`Lỗi khi gọi API: ${error.message}`);
  }
};
export const put = async (values, path, auth = true) => {
  try {
    const headers = {
      "Content-type": "application/json",
      Accept: "application/json",
    };
    if (auth) {
      const token = localStorage.getItem("accessToken");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(API_DOMAIN + path, {
      method: "PUT",
      headers,
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (response.ok) {
      return true;
    } else {
      throw new Error(result.message + ": " + result.data.detail);
    }
  } catch (error) {
    setTimeout(() => {
      showErrorMessage(error.message);
    }, 2000);
  }
};

// =============================những api có gửi file (multipart/form-data)===========================

export const postFormData = async (path, formData) => {
  console.log("chạy vào postFormData với formData:", formData);
  try {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await fetch(API_DOMAIN + path, {
      method: "POST",
      headers, // KHÔNG set Content-Type — để fetch tự set multipart boundary
      body: formData,
    });

    const result = await response.json();
    console.log("postFormData result:", result);

    if (!response.ok) {
      throw new Error(result.message);
    }

    return result.data ?? true;
  } catch (error) {
    showErrorMessage(error.message);
  }
};
export const putFormData = async (path, formData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    const response = await fetch(API_DOMAIN + path, {
      method: "PUT",
      headers,
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message + ": " + result.data.detail);
    }
    return result.data ?? true;
  } catch (error) {
    showErrorMessage(error.message);
  }
};
