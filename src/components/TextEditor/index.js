import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function TextEditor({
  value,
  onChange,
  height = 500,
  disabled,
}) {
  const editorRef = useRef(null);

  return (
    <Editor
      apiKey="wn99n1krsuyn1l9t6cx1ko409ac7mzaaurf5bc2cj9jzrrfz" // hoặc bỏ qua nếu dùng bản community
      value={value}
      onEditorChange={onChange}
      disabled={disabled}
      init={{
        height,
        menubar: false,
        plugins: ["image", "link", "lists", "code"],
        toolbar:
          "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | image | code",
        image_advtab: true,
        automatic_uploads: true,
        file_picker_types: "image",
        images_upload_handler: async (blobInfo) => {
          // Chuyển ảnh thành base64, không cần API
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blobInfo.blob());
          });
        },
        file_picker_callback: (callback, value, meta) => {
          if (meta.filetype === "image") {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.onchange = () => {
              const file = input.files[0];
              const reader = new FileReader();
              reader.onload = (e) => {
                callback(e.target.result, { alt: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        },
        language: "vi",
        language_url: "https://cdn.jsdelivr.net/npm/tinymce-i18n/langs/vi.js", // CDN tiếng Việt
      }}
    />
  );
}
