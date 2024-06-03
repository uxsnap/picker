import { useState } from "react";
import Picker from "./Picker";

const options = Array.from({ length: 100 }, (_, i) => i);

export default function App() {
  const [value, setValue] = useState(0);

  return <Picker options={options} defaultValue={options[5]} onChange={setValue} />;
}
