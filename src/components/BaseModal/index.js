import { Button, Modal } from "antd";
import "./BaseModal.scss"

export default function BaseModal(props) {
    const { open, onOk, onCancel, confirmLoading, children, title } = props;
    return (
        <>
            <Modal
                title={title}
                open={open}
                onCancel={onCancel}
                footer={[
                    <Button key="ok" type="primary" onClick={onOk} loading={confirmLoading}>
                        OK
                    </Button>,
                ]}
            >
                {children}
            </Modal>
        </>
    )
}