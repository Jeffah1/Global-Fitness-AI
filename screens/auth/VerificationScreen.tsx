import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useGlobalContext } from '../../context/GlobalContext';

export const VerificationScreen: React.FC = () => {
  const { user, verifyEmail, logout } = useGlobalContext();
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    await verifyEmail();
    setVerifying(false);
  };

  const handleResend = () => {
      setResent(true);
      setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto animate-fade-in text-center">
      <div className="w-24 h-24 bg-[#00FF9C]/10 rounded-full flex items-center justify-center mb-8 text-[#00FF9C]">
        <Mail size={48} />
      </div>

      <h1 className="text-2xl font-bold text-white mb-4">Verify your email</h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        We’ve sent a verification link to <br/>
        <span className="text-white font-medium">{user?.email}</span>. <br/>
        Verify your email to continue.
      </p>

      <div className="w-full space-y-4">
        <Button onClick={handleVerify} isLoading={verifying} icon={<CheckCircle size={20} />}>
          I Verified My Email
        </Button>
        
        <Button variant="outline" onClick={handleResend} disabled={resent}>
           {resent ? 'Sent!' : 'Resend Email'}
        </Button>

        <button onClick={logout} className="text-sm text-slate-500 hover:text-white mt-4">
            Back to Login
        </button>
      </div>
    </div>
  );
};