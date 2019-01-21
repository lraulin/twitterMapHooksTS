import * as React from "react";

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
