import { Select } from 'antd';
import "./SelectField.scss";

export default function SelectField({ label, defaultValue, options, onChange, style }) {
    return (
        <div className='SelectField'>
            <h3>{label}</h3>
            <Select
                defaultValue={defaultValue}
                style={style || { width: 120 }}
                onChange={onChange}
                options={options}
                className='SelectField__select'
            />
        </div>
    );
}