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
import Signup from "./Signup";
import Login from "./Login";
import Home from "./Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
