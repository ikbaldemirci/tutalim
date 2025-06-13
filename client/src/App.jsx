// import "bootstrap/dist/css/bootstrap.min.css";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./Signup";
// import Login from "./Login";
// import OwnerHome from "./OwnerHome";
// import RealtorHome from "./RealtorHome";
// // import UserHome from "./UserHome";
// import ProtectedRoute from "./ProtectedRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/owner"
//           element={
//             <ProtectedRoute role="ev sahibi">
//               <OwnerHome />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/realtor"
//           element={
//             <ProtectedRoute role="emlakçı">
//               <RealtorHome />
//             </ProtectedRoute>
//           }
//         />
//         {/* <Route
//           path="/user"
//           element={
//             <ProtectedRoute role="kullanıcı">
//               <UserHome />
//             </ProtectedRoute>
//           }
//         /> */}
//       </Routes>
//     </BrowserRouter>
//   );
// }
// export default App;

import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OwnerHome from "./pages/OwnerHome";
import RealtorHome from "./pages/RealtorHome";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <OwnerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/realtor"
          element={
            <ProtectedRoute role="realtor">
              <RealtorHome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
