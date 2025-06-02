import MainRoutes from "./routes";
import { AuthProvider } from "./utils/AuthContext"; // đường dẫn tùy bạn
import { BrowserRouter } from "react-router-dom";
import './styles/styles.scss';
function App() {
  return (
    <AuthProvider>
        <MainRoutes />
    </AuthProvider>
  );
}
export default App;
