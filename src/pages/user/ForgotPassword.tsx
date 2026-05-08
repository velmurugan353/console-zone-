import { Link } from 'react-router-dom';
import { Gamepad2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="min-h-dvh bg-gaming-bg flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gaming-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gaming-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-gaming-card border border-gaming-border rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gaming-bg rounded-2xl mb-4 border border-gaming-border">
            <Gamepad2 className="h-8 w-8 text-gaming-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-gaming-muted">Enter your email to reset your password</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gaming-muted">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gaming-muted" />
              <input 
                type="email" 
                className="w-full bg-gaming-bg border border-gaming-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-gaming-accent transition-colors"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center group mt-4"
          >
            Send Reset Link
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gaming-muted">
          <Link to="/login" className="inline-flex items-center text-gaming-accent hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
