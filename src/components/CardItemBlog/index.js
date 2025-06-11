import { useNavigate } from "react-router-dom";
import "./CardItemBlog.scss";
export default function CardItemBlog(props) {
    const { item } = props;
    const navigate = useNavigate();
    function handleNavigate(){
        navigate(`/Blogs/BlogDetail/${item.id}`);
    }
    return (
        <>
            <div className="card-Blog" onClick={()=> handleNavigate()}>
                <img className="card-Blog__img" src={item.image} />
                <h1 className="card-Blog__title">
                    {item.title}
                </h1>
                <p className="card-Blog__description">
                    {item.shortDetail}
                </p>
            </div>
        </>
    )
}