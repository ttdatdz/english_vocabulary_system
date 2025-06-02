import { message } from "antd";
import { showErrorMessage } from "./alertHelper";

const API_DOMAIN = "http://143.198.83.161/"

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

}
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

export const post = async (values, path, auth = false) => {
    try {
        const headers = {
            "Content-type": "application/json",
            Accept: "application/json",
        }
        if (auth) {
            const token = localStorage.getItem("accessToken");
            if (token) headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(API_DOMAIN + path, {
            method: 'POST',
            headers,
            body: JSON.stringify(values) //nơi chứa data để gửi lên server. Trước khi gửi phải chuyển nó qua dạng json
        });

        if (response.ok) {
            return;
        }
        else {
            const result = await response.json();
            // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
            throw new Error(`${result.detail}`);
        }
    }
    catch (error) {
        showErrorMessage(error.message); // 🐞 Hiển thị lỗi
    }
}

export const postFormData = async (path, formData) => {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(API_DOMAIN + path, {
            method: "POST",
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : undefined,
            body: formData
        });
        if (response.ok)
            return;
        else {
            const result = await response.json();
            throw new Error(result.detail);
        }
    } catch (error) {
        showErrorMessage(error.message);
    }
}
export const del = async (path, auth = false) => {
    try {
        const headers = {
            "Content-type": "application/json",
            Accept: "application/json",
        }
        if (auth) {
            const token = localStorage.getItem("accessToken");
            if (token) headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(API_DOMAIN + path, {
            method: 'DELETE',
            headers,
        });
        if(response.ok) return;
        else{
            const result=await response.json();
            throw new Error(result.detail);
        }
    }
    catch (error) {
        alert(error.message); // 🐞 Hiển thị lỗi
    }
}
export const patch = async (value, path) => {
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: 'PATCH',
            headers: { //Xác định kiểu dữ liệu gửi và mong muốn nhận
                'Content-type': 'application/json', // cái kiểu data gửi cho server sẽ là dạng json
                Accept: 'application/json' //cho server biết cái data mình mong muốn mà server trả về có định dạng json
            },
            body: JSON.stringify(value)
        });
        if (!response.ok) {
            // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
            throw new Error(`Lỗi: ${response.status}`);
        }
        const result = await response.json(); // nhận response và chuyển nó lại qua dạng js để dùng
        return result;
    }
    catch (error) {
        alert(`Lỗi khi gọi API: ${error.message}`); // 🐞 Hiển thị lỗi
    }
}
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
            method: 'PUT',
            headers,
            body: JSON.stringify(values),
        });

        if (response.ok) {
            return;
        }
        else {
            const result=await response.json();
            throw new Error(result.detail);
        }
    } catch (error) {
        showErrorMessage(error.message);
    }
};
