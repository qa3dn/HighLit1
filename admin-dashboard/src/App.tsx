import './App.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { UserProvider } from './context/UserContext';

function App() {
   return (
      <SystemProvider>
         <UserProvider>
            <AuthProvider>
               <RouterProvider router={router} />
            </AuthProvider>
         </UserProvider>
      </SystemProvider>
   );
}

export default App
