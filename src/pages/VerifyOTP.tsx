import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { identifier, isLogin, returnTo, userData, apiResponse } = location.state || {};

  useEffect(() => {
    if (!identifier) {
      navigate("/login");
    }
  }, [identifier, navigate]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const maskIdentifier = (id: string) => {
    if (!id) return "";
    if (id.includes("@")) {
      const [local, domain] = id.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return `+91 ${id.slice(0, 2)}XXXXX${id.slice(-3)}`;
  };

  const handleChange = (index: number, value: string) => {
    if (isBlocked) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (/\d/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      // Use API for verification
      const res = await apiClient.post("/auth/verify-otp", {
        otp: otpValue,
        mobile: identifier,
        userId: apiResponse?.userId || apiResponse?.user?.id || apiResponse?.data?.userId
      });

      const data = res.data;

      toast({
        title: "Verification Successful!",
        description: "Welcome to Parampare",
      });
      
      // Store user session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("parampare_user", JSON.stringify(data.user || userData)); // Prefer user data from API
      localStorage.setItem("token", data.token); // Store token if provided
      
      if (isLogin) {
        navigate("/");
        // Notify hooks to refresh
        window.dispatchEvent(new Event("loginSuccess"));
      } else {
        navigate(returnTo || "/");
        // Notify hooks to refresh
        window.dispatchEvent(new Event("loginSuccess"));
      }

    } catch (error: any) {
      const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsBlocked(true);
          setError("Too many attempts. Try again after 5 minutes.");
          setTimeout(() => {
            setIsBlocked(false);
            setAttempts(0);
          }, 300000); // 5 minutes
        } else {
          setError(error.message || "Invalid OTP. Please try again.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend || isBlocked) return;
    
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    setError("");
    toast({
      title: "OTP Sent",
      description: `A new OTP has been sent to ${maskIdentifier(identifier)}`,
    });
  };

  const handleChangeNumber = () => {
    navigate(isLogin ? "/login" : "/register");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 py-4 px-6">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="ml-4">
            <h1 className="text-2xl font-display font-semibold text-foreground">Parampare</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-semibold text-foreground mb-2">
                {isLogin ? "Welcome to Parampare" : "Verify your number"}
              </h2>
              <p className="text-muted-foreground">Authentic Ilkal Sarees</p>
            </div>

            {/* OTP Info */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Please enter the OTP sent to" : "Enter the 6-digit OTP sent to"}
              </p>
              <p className="font-medium text-foreground mt-1">
                {maskIdentifier(identifier)}
              </p>
              <button 
                onClick={handleChangeNumber}
                className="text-gold text-sm hover:underline mt-2"
              >
                Change {identifier?.includes("@") ? "email" : "number"}
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isBlocked}
                    className={`w-12 h-14 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold transition-all ${
                      error ? "border-destructive" : "border-border"
                    } ${isBlocked ? "bg-muted opacity-50" : "bg-background"}`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <Button 
                onClick={handleVerify}
                disabled={isBlocked || isLoading}
                className="w-full h-12 bg-gold hover:bg-gold/90 text-foreground font-medium disabled:opacity-50"
              >
                 {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    isLogin ? "Login" : "Verify & Continue"
                  )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Not received the code?{" "}
                  {canResend ? (
                    <button 
                      onClick={handleResend}
                      className="text-gold hover:underline font-medium"
                      disabled={isBlocked}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-gold font-medium">
                      Resend OTP {timer}s
                    </span>
                  )}
                </p>
              </div>

              {/* Terms */}
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to Parampare's{" "}
                <Link to="/terms-of-use" className="text-gold hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTP;
