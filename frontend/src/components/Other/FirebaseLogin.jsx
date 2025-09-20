import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { auth, googleProvider } from "../../../../backend/config/firebase";

export default function FirebaseLogin({ setToken, setPicture }) {
  const handleGoogleLogin = async () => {
    if (!auth) return console.error("Firebase auth not initialized");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await res.json();

      console.log(data);

      if (data.message == "Login successful") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("picture", data.picture);
        setToken(data.token);
        setPicture(data.picture);
        location.reload();
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-red-500 text-white p-2 rounded-lg"
    >
      Đăng nhập bằng Google
    </button>
  );
}
