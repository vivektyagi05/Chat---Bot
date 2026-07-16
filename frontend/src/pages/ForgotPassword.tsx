import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthService } from "../services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
    } finally {
      setSent(true);
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
        <h1 className="mb-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100">Reset your password</h1>
        <p className="mb-6 text-sm text-neutral-400">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm text-green-600">
            If that email exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-400">
          <Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
