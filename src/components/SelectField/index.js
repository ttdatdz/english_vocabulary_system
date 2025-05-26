import { Select } from "antd";
import "./SelectField.scss";

export default function SelectField({
  label,
  defaultValue,
  options,
  onChange,
  style,
  width,
}) {
  return (
    <div className="SelectField">
      {label && <h3>{label}</h3>}
      <Select
        defaultValue={defaultValue}
        style={style || { width: width }}
        onChange={onChange}
        options={options}
        className="SelectField__select"
      />
    </div>
  );
}
