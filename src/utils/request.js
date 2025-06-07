import { showErrorMessage } from "./alertHelper";

const API_DOMAIN = "http://143.198.83.161/";

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

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`${result.detail}`);
    }
    return await response.json();
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
    if (!response.ok) {
      // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
      throw new Error(`Lỗi: ${response.status}`);
    }
    const result = await response.json();
    return result;
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

    if (response.ok) {
      if (path === "api/user/login" || path === "api/exam/create")
        return await response.json(); // nếu là đăng nhập thì trả về dữ liệu người dùng
      return true;
    } else {
      const result = await response.text();
      // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
      throw new Error(`${result}`);
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
    // const result = await response.text(); // Lấy kết quả trả về dưới dạng text
    // console.log("result:", result);
    if (response.ok) {
      return true;
    } else {
      const result = await response.json(); // Lấy kết quả trả về dưới dạng text
      throw new Error(result.detail);
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
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status}`);
    }
    const result = await response.json();
    return result;
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
    // const isJson = response.headers
    //   .get("content-type")
    //   ?.includes("application/json");
    // const result = isJson ? await response.json() : await response.text();

    // Lấy kết quả trả về dưới dạng json  console.log(">>>>>>>>>>>>>result11", result);
    if (response.ok) {
      return true;
    } else {
      const result = await response.text();
      const test = JSON.parse(result);
      throw new Error(test.detail);
    }
  } catch (error) {
    setTimeout(() => {
      showErrorMessage(error.message);
    }, 2000);
  }
};

// =============================những api có gửi file (multipart/form-data)===========================

export const postFormData = async (path, formData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await fetch(API_DOMAIN + path, {
      method: "POST",
      headers, // KHÔNG set Content-Type — để fetch tự set multipart boundary
      body: formData,
    });

    // const isJson = response.headers
    //   .get("content-type")
    //   ?.includes("application/json");
    // const result = isJson ? await response.json() : await response.text();
    // console.log(">>>>>>>>>>>>>result11", result);
    if (!response.ok) {
      const result = await response.text();
      const test = JSON.parse(result);
      throw new Error(test.detail || "Lỗi không xác định");
    } else {
      return true;
    }
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
      headers, // KHÔNG đặt Content-Type thủ công
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.detail || "Lỗi khi cập nhật dữ liệu");
    } else {
      return true;
    }
  } catch (error) {
    showErrorMessage(error.message);
  }
};
