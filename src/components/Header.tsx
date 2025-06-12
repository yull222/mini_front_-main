import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  return (
    <header className="relative bg-red-200 text-gray-800 py-8 shadow-md">
      <h1 className="text-3xl font-bold text-center tracking-wider">
        📰 News Pocket
      </h1>

      <div className="absolute right-4 bottom-2 flex gap-3">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              로그인
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </header>
  );
}
