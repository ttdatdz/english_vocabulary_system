const API_DOMAIN = "http://143.198.83.161/"

export const get = async (path) => {
    try {
        const response = await fetch(API_DOMAIN + path);
        if (!response.ok) {
            // throw có tác dụng ném lỗi ra cho catch, và dừng thực thi trong try
            throw new Error(`Lỗi: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        alert(`Lỗi khi gọi API: ${error.message}`);
    }

}

export const post = async (values, path) => {
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: 'POST',
            headers: { //Xác định kiểu dữ liệu gửi và mong muốn nhận
                'Content-type': 'application/json', // cái kiểu data gửi cho server sẽ là dạng json
                Accept: 'application/json' //cho server biết cái data mình mong muốn mà server trả về có định dạng json
            },
            body: JSON.stringify(values) //nơi chứa data để gửi lên server. Trước khi gửi phải chuyển nó qua dạng json
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
export const del = async (path) => {
    try {
        const response = await fetch(API_DOMAIN + path, {
            method: 'DELETE',
            headers: { //Xác định kiểu dữ liệu gửi và mong muốn nhận
                'Content-type': 'application/json', // cái kiểu data gửi cho server sẽ là dạng json
                Accept: 'application/json' //cho server biết cái data mình mong muốn mà server trả về có định dạng json
            },
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