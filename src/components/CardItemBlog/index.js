import "./CardItemBlog.scss";
export default function CardItemBlog(props) {
    const { item } = props;
    return (
        <>
            <div className="card-Blog">
                <img className="card-Blog__img" src={item.image} />
                <h1 className="card-Blog__title">
                    {item.title}
                </h1>
                <p className="card-Blog__description">
                    {item.description}
                </p>
            </div>
        </>
    )
}