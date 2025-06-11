import { useParams } from "react-router-dom"
import { get } from "../../utils/request";
import { useEffect, useRef, useState } from "react";
import "./BlogDetail.scss";

export default function BlogDetail() {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const loadDetailBlog = async () => {
        const data = await get(`api/blog/id/${blogId}`);
        if (data) {
            setBlog(data);
        }
    }

    useEffect(()=>{
        loadDetailBlog();
    },[])
    const contentRef = useRef(null);
    const [toc, setToc] = useState([]);

    useEffect(() => {
        if (contentRef.current) {
            const headings = Array.from(
                contentRef.current.querySelectorAll("h1, h2, h3")
            );
            // Gán id nếu chưa có và build mục lục
            const tocItems = headings.map((heading, idx) => {
                if (!heading.id) heading.id = `heading-${idx}`;
                return {
                    id: heading.id,
                    text: heading.innerText,
                    tag: heading.tagName,
                };
            });
            setToc(tocItems);
        }

    }, [blog?.detail]);

    const handleTocClick = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    if(!blog) return null;
    return (
        <div className="blog-detail-layout">
            <div className="blog-detail">
                <h1 className="blog-title">{blog.title}</h1>
                <div
                    className="blog-content"
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: blog.detail }}
                />
            </div>
            <div className="blog-toc">
                <div className="toc-title">Mục lục</div>
                <ul>
                    {toc.map(item => (
                        <li
                            key={item.id}
                            className={`toc-item toc-${item.tag.toLowerCase()}`}
                            onClick={() => handleTocClick(item.id)}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}