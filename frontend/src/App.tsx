// src/App.tsx
import MapComponent from "./components/Map";
import Header from "./components/Header";
import "./styles/app.css";

function App() {
  return (
    <div className="app-container">
      <Header />
      <MapComponent />
    </div>
  );
}

export default App;
