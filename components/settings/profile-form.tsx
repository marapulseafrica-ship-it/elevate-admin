"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

interface Props {
  initialName: string;
  email: string;
  createdAt: string;
  userId: string;
}

type Status = { type: "success" | "error"; message: string } | null;

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;
  const isSuccess = status.type === "success";
  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      {isSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {status.message}
    </div>
  );
}

export function ProfileForm({ initialName, email, createdAt, userId }: Props) {
  const supabase = createSupabaseBrowser();

  // Profile state
  const [name, setName] = useState(initialName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<Status>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<Status>(null);

  async function handleSaveProfile() {
    if (!name.trim()) return;
    setSavingProfile(true);
    setProfileStatus(null);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSavingProfile(false);
    setProfileStatus(error
      ? { type: "error", message: error.message }
      : { type: "success", message: "Display name updated successfully." }
    );
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }
    setSavingPassword(true);
    setPasswordStatus(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordStatus({ type: "error", message: error.message });
    } else {
      setPasswordStatus({ type: "success", message: "Password changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleChangeEmail() {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setEmailStatus({ type: "error", message: "Enter a valid email address." });
      return;
    }
    setSavingEmail(true);
    setEmailStatus(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSavingEmail(false);
    if (error) {
      setEmailStatus({ type: "error", message: error.message });
    } else {
      setEmailStatus({ type: "success", message: "Confirmation sent to both your current and new email. Click the link in each to confirm the change." });
      setNewEmail("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Account info banner */}
      <Card className="p-5 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">
              {(initialName || email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{initialName || "Admin"}</p>
            <p className="text-sm text-slate-500">{email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Account ID: {userId.slice(0, 8)}…  ·  Member since {new Date(createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </Card>

      {/* Display name */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Display Name</h3>
            <p className="text-xs text-slate-500">Shown in the admin interface</p>
          </div>
        </div>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className={labelCls}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
          </div>
          <StatusMessage status={profileStatus} />
          <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim()} size="sm">
            {savingProfile && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Save name
          </Button>
        </div>
      </Card>

      {/* Change email */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Email Address</h3>
            <p className="text-xs text-slate-500">Current: <span className="font-medium text-slate-700">{email}</span></p>
          </div>
        </div>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className={labelCls}>New email address</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" className={inputCls} />
          </div>
          <p className="text-xs text-slate-400">A confirmation link will be sent to both your current and new email. Both must be clicked to confirm the change.</p>
          <StatusMessage status={emailStatus} />
          <Button onClick={handleChangeEmail} disabled={savingEmail || !newEmail.trim()} size="sm" variant="outline">
            {savingEmail && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Change email
          </Button>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Password</h3>
            <p className="text-xs text-slate-500">Set a new login password</p>
          </div>
        </div>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className={labelCls}>New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className={inputCls} />
          </div>
          <StatusMessage status={passwordStatus} />
          <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword || !confirmPassword} size="sm" variant="outline">
            {savingPassword && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Change password
          </Button>
        </div>
      </Card>
    </div>
  );
}
