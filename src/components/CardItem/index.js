
import "./CardItem.scss"
import CardItem1 from "../../assets/images/CardItem1.png"
export default function CardItem() {
    return (
        <div className='CardItem'>
            <div className='CardItem__Img'>
                <img src={CardItem1} alt="img_item" />
            </div>
            <div className='CardItem__Content'>
                <h3 className="CardItem__Quantity">50</h3>
                <p className="CardItem__Title">Feedbacks</p>
            </div>
        </div>
    )
}