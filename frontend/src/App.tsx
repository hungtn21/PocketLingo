import "./App.css";
import Homepage from "./pages/User/Homepage/Homepage";
import Snowfall from "./component/ChristmasTheme/Snowfall";

function App() {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Snowfall enabled={true} intensity="medium" />
      <Homepage />
    </div>
  );
}

export default App;
