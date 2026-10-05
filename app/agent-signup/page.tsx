"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Briefcase } from "lucide-react";

export default function AgentSignupPage() {
  const [fullName, setFullName] = useState("");
  const [nrc, setNrc] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Full name is required"); return; }
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowser();

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (!authData.user) { setError("Account creation failed. Please try again."); setLoading(false); return; }

    const { error: agentError } = await supabase.from("sales_agents").insert({
      user_id: authData.user.id,
      full_name: fullName.trim(),
      nrc_number: nrc.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      email: email.trim(),
      contract_signed_at: new Date().toISOString(),
    });

    if (agentError) {
      setError(`Account created but profile failed: ${agentError.message}`);
      setLoading(false);
      return;
    }

    router.push("/agent");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl border shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-100 p-3 rounded-xl mb-3">
            <Briefcase className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Agent Sign Up</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Create your ElevateAI sales agent account to start earning
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Your full legal name" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NRC Number</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="123456/78/9" value={nrc} onChange={e => setNrc(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="+260971234567" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Lusaka, Zambia" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? "Creating account…" : "Create Agent Account"}
          </button>

          <p className="text-xs text-center text-slate-400">
            By signing up you agree to the terms of the Independent Sales Agent Agreement provided by ElevateAI.
          </p>
          <p className="text-sm text-center text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="text-purple-600 font-medium hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
