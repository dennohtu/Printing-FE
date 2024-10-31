import { ColorModeContext, useMode } from "./Theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Topbar from "./global/Topbar";
import Login from "./pages/auth/Login";
import Otp from "./pages/auth/OTP";
// import Sidebar from "./global/Sidebar";
// import Users from "./pages/Users"
// import Farms from "./pages/Farms"
// import Insitutions from "./pages/Institutions"
// import Marketplace from "./pages/Marketplace"
// import Payments from "./pages/Payments"
import Dashboard from "./pages/dashboard";
import { Route, Routes } from "react-router-dom";
import MySidebar from "./global/Sidebar";
import { QueryClient, QueryClientProvider } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { loadState } from "./utils/LocalStorage";
import { login, logout } from "./stores/UserSlice";
import UserList from "./pages/users/Userlist";
import InstitutionList from "./pages/Institutions/InstitutionList";
import FarmsList from "./pages/farms/FarmList";
import RoleList from "./pages/roles/RoleList";
import UserForm from "./pages/users/UserForm";
import FarmForm from "./pages/farms/FarmForm";
import InstitutionForm from "./pages/Institutions/InstitutionForm";
import RoleForm from "./pages/roles/RoleForm";
import EmployeeList from "./pages/employees/EmployeeList";
import UserItem from "./pages/users/UserItem";
import FarmItem from "./pages/farms/FarmItem";
import AnimalList from "./pages/data/AnimalList";
import axios from "axios";
import { Environment } from "./Environment";
import { useNavigate } from "react-router-dom";
import CropList from "./pages/data/CropList";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductItem";
import OrderList from "./pages/orders/OrderList";
import CategoryList from "./pages/categories/CategoryList";
import CategoryForm from "./pages/categories/CategoryForm";
import CropSegmentItem from "./pages/segment/CropSegment";
import AnimalSegmentItem from "./pages/segment/AnimalSegment";
import AnimalForm from "./pages/data/AnimalForm";
import AnimalBreedForm from "./pages/data/AnimalBreed";
import CropForm from "./pages/data/CropForm";
import CropCalendar from "./pages/data/CropCalendar";
import CropCalendarForm from "./pages/data/CropCalendarForm";
import InstitutionDashboard from "./pages/dashboard/Institution";
import CreditList from "./pages/credits/CreditList";
import VericompostItem from "./pages/vericompost/VermicompostItem";
import DisbursementItem from "./pages/disbursements/DisbursementItem";
import DisbursementList from "./pages/disbursements/DisbursementList";
import FarmerDisbursementList from "./pages/disbursements/FarmerDIsbursementList";
import UserWallet from "./pages/UserWallet";
import FarmSales from "./pages/sales/FarmSales";
import MarketplaceSales from "./pages/sales/MarketplaceSales";
import EmployeeForm from "./pages/employee/EmployeeForm";
import Employees from "./pages/employee/Employees";
import FarmSubscriptionList from "./pages/farmsubscriptions/FarmSubscriptionList";
import CarbonList from "./pages/carbonCredits/CarbonList";
import BannerList from "./pages/banners/BannerList";
import BannerForm from "./pages/banners/BannerForm";
import WriteupList from "./pages/writeups/WriteupList";
import WriteupForm from "./pages/writeups/WriteupForm";
import PestDiseaseList from "./pages/pestsdiseases/PestDiseaseList";
import PestDiseaseForm from "./pages/pestsdiseases/PestDiseaseForm";

function App() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [theme, colorMode] = useMode();
  const queryClient = new QueryClient();
  const navigate = useNavigate();
  //check if user is logged in. redirect to dash
  useEffect(() => {
    const user = loadState("auth");
    if (user) {
      axios
        .get(`${Environment.BaseURL}/api/user/verifyToken`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.token,
          },
        })
        .then((res) => {
          if (res.status === 204) dispatch(login(user));
          else {
            dispatch(logout());
            navigate("/");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer />
          <div className="app">
            {user.loggedIn && <MySidebar />}
            <main className="content">
              {user.loggedIn && <Topbar />}
              <Routes>
                <Route
                  path="/"
                  element={
                    !user.loggedIn ? (
                      <Login />
                    ) : user.role === "admin" ? (
                      <Dashboard />
                    ) : (
                      <InstitutionDashboard />
                    )
                  }
                />
                {!user.loggedIn && <Route path="/otp" element={<Otp />} />}

                <Route path="/users" element={<UserList />} />
                {/* <Route path="/payments" element={<Payments />} /> */}
                <Route path="/products" element={<ProductList />} />
                <Route path="products/add" element={<ProductForm />} />
                <Route path="/institutions" element={<InstitutionList />} />
                <Route path="/farms" element={<FarmsList />} />
                <Route path="/roles" element={<RoleList />} />
                <Route path="/users/add" element={<UserForm />} />
                <Route path="farms/add" element={<FarmForm />} />
                <Route path="/institutions/add" element={<InstitutionForm />} />
                <Route path="/roles/add" element={<RoleForm />} />
                <Route path="/members" element={<EmployeeList />} />
                <Route path="/users/view" element={<UserItem />} />
                <Route path="/farms/view" element={<FarmItem />} />
                <Route path="animals/view" element={<AnimalList />} />
                <Route path="crops/view" element={<CropList />} />
                <Route path="/orders/view" element={<OrderList />} />
                <Route path="/categories/view" element={<CategoryList />} />
                <Route path="/categories/add" element={<CategoryForm />} />
                <Route
                  path="/segment/view/crop"
                  element={<CropSegmentItem />}
                />
                <Route
                  path="/segment/view/animal"
                  element={<AnimalSegmentItem />}
                />
                <Route path="/typeOfAnimal/Edit" element={<AnimalForm />} />
                <Route path="/animalBreed/Edit" element={<AnimalBreedForm />} />
                <Route path="/crops/add" element={<CropForm />} />
                <Route path="/cropCalendar/view" element={<CropCalendar />} />
                <Route
                  path="/cropCalendar/edit"
                  element={<CropCalendarForm />}
                />
                <Route path="/institutionCredits" element={<CreditList />} />
                <Route path="/vermicompost" element={<VericompostItem />} />
                <Route
                  path="/institutions/disbursement/view"
                  element={<DisbursementList />}
                />
                <Route
                  path="/institutions/disbursement/item"
                  element={<DisbursementItem />}
                />
                <Route
                  path="/institutions/disbursement/farmers"
                  element={<FarmerDisbursementList />}
                />
                <Route path="/wallet" element={<UserWallet />} />
                <Route path="/payments">
                  <Route path="/payments/farm" element={<FarmSales />} />
                  <Route
                    path="/payments/farmsubscriptions"
                    element={<FarmSubscriptionList />}
                  />
                  <Route
                    path="/payments/marketplace"
                    element={<MarketplaceSales />}
                  />
                </Route>
                <Route path="/employees">
                  <Route path="/employees/view" element={<Employees />} />
                  <Route path="/employees/add" element={<EmployeeForm />} />
                </Route>
                <Route path="/carbonList" element={<CarbonList />} />
                <Route path="banners">
                  <Route path="/banners/view" element={<BannerList />} />
                  <Route path="/banners/add" element={<BannerForm />} />
                </Route>
                <Route path="/writeups">
                  <Route path="/writeups/view" element={<WriteupList />} />
                  <Route path="/writeups/add" element={<WriteupForm />} />
                </Route>
                <Route path="/pestdisease">
                  <Route
                    path="/pestdisease/view"
                    element={<PestDiseaseList />}
                  />
                  <Route
                    path="/pestdisease/add"
                    element={<PestDiseaseForm />}
                  />
                </Route>
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
