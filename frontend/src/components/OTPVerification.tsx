import { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, AlertCircle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  purpose: 'registration' | 'login';
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function OTPVerification({
  email,
  purpose,
  onVerify,
  onResend,
  isLoading = false,
  error = ''
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && !isLoading) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Auto-submit if complete
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpValue: string) => {
    await onVerify(otpValue);
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(600);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    await onResend();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#E85D04] to-[#2D6A4F] rounded-full mb-4">
          <Shield className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
        <p className="text-gray-300 text-sm">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-[#E85D04]">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3">
          <AlertCircle className="text-red-400" size={20} />
          <span className="text-red-200">{error}</span>
        </div>
      )}

      <div className="flex justify-center space-x-3" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-transparent transition-all"
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-gray-400 text-sm">
            {timer > 0 ? (
              <>Code expires in: <span className="font-semibold text-[#E85D04]">{formatTime(timer)}</span></>
            ) : (
              <span className="text-red-400">Code expired</span>
            )}
          </span>
        </div>

        <button
          onClick={handleResend}
          disabled={!canResend || isLoading}
          className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 text-sm text-gray-300 hover:text-[#E85D04] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} />
          <span>Resend OTP</span>
        </button>
      </div>

      {isLoading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85D04]"></div>
          <p className="text-gray-400 text-sm mt-2">Verifying...</p>
        </div>
      )}

      <p className="text-center text-gray-500 text-xs">
        Didn't receive the code? Check your spam folder or click resend.
      </p>
    </div>
  );
}
