import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NewsPage from "./newsfetchingcomponents/NewsPage";
import LoginForm from "./signcomponents/Login";
import SignupForm from "./signcomponents/SignupForm";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <BrowserRouter>
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Routes>
            <Route path="/" element={<NewsPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
