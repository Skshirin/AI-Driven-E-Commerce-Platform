import { useState, useEffect, use } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "../../store/slices/popupSlice";
import { register, login, forgotPassword, resetPassword } from "../../store/slices/authSlice";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    authUser,
    isSigningUp,
    isLoggingIn,
    isRequestingForToken,
  } = useSelector((state) => state.auth);

  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [mode, setMode] = useState("signin");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.pathname.startsWith("/password/reset")) {
      setMode("reset");
      dispatch(toggleAuthPopup(true));
    }
  }, [location, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);

    // SIGNUP
    if (mode === "signup") {
      data.append("name", formData.name);
      dispatch(register(data));
    }

    // FORGOT PASSWORD
    else if (mode === "forgot") {
      dispatch(forgotPassword({ email: formData.email })).then(() => {
        dispatch(toggleAuthPopup());
        setMode("signin");
      });
      return;
    }

    // RESET PASSWORD
    else if (mode === "reset") {
      const token = location.pathname.split("/").pop();

      dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      );
      return;
    }

    // SIGNIN
    else {
      dispatch(login(data));
    }

    // RESET FORM
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  // MODAL CLOSE CONDITIONS
  if (!isAuthPopupOpen || authUser) return null;

  // LOADING STATE
  const isLoading =
    isSigningUp || isLoggingIn || isRequestingForToken;
  return (
  <>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
  
  {/* OVERLAY */}
  <div className="absolute inset-0 backdrop-blur-md bg-[hsla(var(--glass-bg))]" />

  {/* MAIN PANEL */}
  <div className="relative z-10 glass-panel w-full max-w-md mx-4 animate-fade-in-up p-6">
    
    {/* HEADER */}
    <div className="flex items-center justify-between mb-6">
      
      <h2 className="text-2xl font-bold text-primary">
        {mode === "reset"
          ? "Reset Password"
          : mode === "signup"
          ? "Create Account"
          : mode === "forgot"
          ? "Forgot Password"
          : "Welcome Back"}
      </h2>

      <button
          onClick={() => dispatch(toggleAuthPopup())}
          className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth">
        <X className="w-5 h-5 text-primary" />
      </button>
    </div>

  </div>
</div>
  </>
);
};

export default LoginModal;
