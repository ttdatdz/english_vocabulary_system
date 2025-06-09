import "./CardItem.scss";
export default function CardItem(props) {
  const { title, quantity, image } = props;
  return (
    <div className="CardItem">
      <div className="CardItem__Img">
        <img src={image} alt="img_item" />
      </div>
      <div className="CardItem__Content">
        <h3 className="CardItem__Quantity">{quantity}</h3>
        <p className="CardItem__Title">{title}</p>
      </div>
    </div>
  );
}
