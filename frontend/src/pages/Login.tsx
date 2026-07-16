import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AxiosError } from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = (err as AxiosError<{ message?: string }>).response?.data?.message ?? "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700" />
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Welcome back</h1>
          <p className="text-sm text-neutral-400">Sign in to continue to Nova AI</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <LogIn size={16} /> {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Don't have an account? <Link to="/register" className="text-brand-600 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
