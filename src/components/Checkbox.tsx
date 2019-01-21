import { useState } from "react";
import PropTypes from "prop-types";

type Props = {
  name: string;
  checked: boolean;
  toggleCheckBox: (name: string) => void;
};

const Checkbox = ({ name, checked, toggleCheckBox }: Props) => {
  return (
    <input
      type={"checkbox"}
      name={name}
      checked={checked}
      onChange={() => toggleCheckBox(name)}
      key={"input_" + name}
    />
  );
};

export default Checkbox;
