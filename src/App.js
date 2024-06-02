import Picker from "./Picker";

const options = Array.from({ length: 20 }, (_, i) => i);

export default function App() {
  return <Picker options={options} />;
}
