
import './App.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
function App() {
   return <SystemProvider>
            <AuthProvider>
               <RouterProvider router={router} />
            </AuthProvider>
      </SystemProvider>;

}

export default App
