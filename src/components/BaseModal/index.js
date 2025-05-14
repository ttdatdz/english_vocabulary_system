import { Button, Modal } from "antd";
import "./BaseModal.scss"

export default function BaseModal(props) {
    const { open, onCancel, children, title } = props;
    return (
        <>
            <Modal
                title={title}
                open={open}
                onCancel={onCancel}
                footer={[
                    null
                ]}
                centered
                width={800}
            >
                {children}
            </Modal>
        </>
    )
}