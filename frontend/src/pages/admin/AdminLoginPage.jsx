import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import logo from "../../assets/logo.jpg";
import { login, forgotPassword, verifyOtp, resetPassword } from "../../services/authService";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/admin");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setShowOtpSection(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Could not send OTP. Check the email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyOtp({ otp, email });
      setShowResetPassword(true);
    } catch (err) {
      alert(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ email, newPassword });
      alert("Password updated successfully! Please log in.");
      setShowForgotPassword(false);
      setShowOtpSection(false);
      setShowResetPassword(false);
      setEmail("");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err?.response?.data?.message || "Could not update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl border border-white bg-white p-8 shadow-2xl">
        <div className="flex justify-center mb-5">
          <img
            src={logo}
            alt="SpaceECE Logo"
            className="h-20 w-20 rounded-full object-cover shadow-md"
          />
        </div>
        <h1 className="text-4xl font-bold text-center text-brand-dark mb-2">
          Admin Login
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Secure access for SpaceECE administrators
        </p>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="admin@spaceece.org"
                value={email}
                 disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          {!showForgotPassword && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-brand-orange hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <Button type="button" className="w-full" onClick={handleLogin} disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </>
          )}
          {showForgotPassword && !showOtpSection && (
            <>
              <h2 className="text-2xl font-semibold text-center">
                Password Recovery
              </h2>
              <p className="text-center text-sm text-gray-500">
                We'll send a secure 6-digit verification code to your registered email.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={handleSendOtp}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-brand-orange hover:underline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowOtpSection(false);
                  setShowResetPassword(false);
                }}
              >
                Back to Login
              </button>
            </>
          )}
          {showForgotPassword &&
            showOtpSection &&
            !showResetPassword && (
              <>
                <h2 className="text-2xl font-semibold text-center">
                  Verify OTP
                </h2>
                <p className="text-center text-sm text-gray-500">
                  Enter the 6-digit verification code sent to your email.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="123456"
                  className="w-full rounded-xl border border-gray-300 py-3 text-center text-2xl tracking-[0.5em] outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-brand-orange hover:underline"
                    onClick={handleSendOtp}
                  >
                    Resend OTP
                  </button>
                  <span className="text-gray-400">
                    OTP valid for 5 min
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-brand-orange hover:underline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setShowOtpSection(false);
                    setShowResetPassword(false);
                    setOtp("");
                  }}
                >
                  Back to Login
                </button>
              </>
            )}
          {showForgotPassword && showResetPassword && (
            <>
              <h2 className="text-2xl font-semibold text-center">
                Create New Password
              </h2>
              <p className="text-center text-sm text-gray-500">
                Your new password should be at least 8 characters long.
              </p>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={handleUpdatePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-brand-orange hover:underline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowOtpSection(false);
                  setShowResetPassword(false);
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Back to Login
              </button>
            </>
          )}
        </form>
        <p className="mt-8 text-center text-xs text-gray-400">
          (c) 2026 SpaceECE India Foundation
        </p>
      </Card>
    </div>
  );
}
