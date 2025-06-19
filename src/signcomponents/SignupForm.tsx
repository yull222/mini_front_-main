import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signupHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // 기본 유효성 검사
    if (!username.trim() || !password.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      alert("비밀번호 글자수 오류.");
      return;
    }

    try {
      const res = await fetch("http://10.125.121.190:8080/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        alert("회원가입 성공! 로그인 해주세요.");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.message || "회원가입 실패: 중복된 아이디일 수 있습니다.");
      }
    } catch (err) {
      console.error("회원가입 중 오류 발생:", err);
      alert("서버 오류로 인해 회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={signupHandler}
        className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">회원가입</h2>

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          가입하기
        </button>

        <p className="text-sm mt-4 text-center">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            로그인
          </a>
        </p>
      </form>
    </div>
  );
}
