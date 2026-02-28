import { useAuthStore } from "@/store/useAuthStore";
import {
  User, Mail, Shield, BadgeCheck,
  Lock, LogOut, Trash2, Camera, ChevronRight,
  MapPin, FileText, Activity, ShieldCheck,
  Bell, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useMessageStore } from "@/store/useMessageStore";
import { useJourneys } from "@/hooks/useJourneys";
import { useBillEntries } from "@/hooks/useLedgers";
import { formatDate } from "@/utils/formatDate";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";

const Profile = () => {
  const { user, authSuccess, logout: authLogout } = useAuthStore();
  const { addMessage } = useMessageStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Activity Data
  const { useJourneysQuery } = useJourneys();
  const { useBillEntriesQuery } = useBillEntries();
  const { data: journeys = [] } = useJourneysQuery();
  const { data: billEntries = [] } = useBillEntriesQuery();

  const recentActivity = useMemo(() => {
    const act: any[] = [
      ...journeys.map(j => ({ ...j, type: 'journey', sortDate: new Date(j.createdAt || 0) })),
      ...billEntries.map(b => ({ ...b, type: 'bill', sortDate: new Date(b.createdAt || 0) }))
    ];
    return act.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 5);
  }, [journeys, billEntries]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { data } = await api.patch("/auth/update-profile", profileData);
      authSuccess(data.data.user);
      addMessage({ type: "success", text: "Profile updated successfully" });
      setActiveTab('overview');
    } catch (error: any) {
      addMessage({ type: "error", text: error.response?.data?.message || "Update failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return addMessage({ type: "error", text: "New passwords do not match" });
    }
    setIsUpdating(true);
    try {
      await api.patch("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      addMessage({ type: "success", text: "Password changed successfully" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setActiveTab('overview');
    } catch (error: any) {
      addMessage({ type: "error", text: error.response?.data?.message || "Password change failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      authLogout();
      navigate("/login");
    } catch (error) {
      addMessage({ type: "error", text: "Logout failed" });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
    { id: 'edit', label: 'Edit Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} /> },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUpdating(true);
    try {
      const { data } = await api.patch("/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      authSuccess(data.data.user);
      setImgError(false);
      addMessage({ type: "success", text: "Profile picture updated" });
    } catch (error: any) {
      addMessage({ type: "error", text: error.response?.data?.message || "Upload failed" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-700">

      {/* Hero Profile Section */}
      <div className="relative group">
        <div className="h-64 rounded-[3rem] bg-gradient-to-r from-indigo-600 to-blue-700 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>

        <div className="absolute -bottom-16 left-12 flex items-end gap-8">
          <div className="relative group/avatar">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden">
              <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-indigo-600 border border-slate-100 overflow-hidden">
                {user?.avatar && !imgError ? (
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <User size={64} strokeWidth={1.5} />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl z-20 group-hover/avatar:scale-110 transition-transform hover:bg-slate-900 border-4 border-white"
            >
              <Camera size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-sm">
                {user?.fullname}
              </h1>
              {user?.isAdmin && (
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1.5 shadow-lg">
                  <BadgeCheck className="text-white" size={16} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Admin</span>
                </div>
              )}
            </div>
            <p className="text-indigo-100 font-bold tracking-widest uppercase text-xs opacity-80">@{user?.username} • Operational Manager</p>
          </div>
        </div>
      </div>

      <div className="mt-20 grid lg:grid-cols-12 gap-10">

        {/* Right Column: Navigation & Control */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="card-premium !p-4 flex flex-col gap-2 shadow-xl shadow-slate-100/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all group ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-2'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:translate-x-1'
                  }`}
              >
                <span className={`${activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>

          {/* Safety Center */}
          <div className="card-premium !p-8 bg-slate-900 border-slate-800 text-white flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-black italic tracking-tighter flex items-center gap-3">
                <ShieldCheck className="text-rose-500" /> Safety Center
              </h4>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">Manage your account security and session access.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleLogout}
                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 px-6 hover:bg-rose-500 hover:border-rose-500 transition-all group/btn"
              >
                <LogOut size={18} className="text-rose-500 group-hover/btn:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">Logout Session</span>
              </button>
              <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 px-6 hover:bg-slate-800 transition-all opacity-40 cursor-not-allowed">
                <Trash2 size={18} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Deactivate Account</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-8"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="card-premium !p-8 flex flex-col gap-6 hover:border-indigo-200 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <Mail size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Email Address</span>
                      <span className="text-xl font-bold text-slate-900 tracking-tight">{user?.email}</span>
                    </div>
                  </div>
                  <div className="card-premium !p-8 flex flex-col gap-6 hover:border-indigo-200 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <Shield size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Access Level</span>
                      <span className="text-xl font-bold text-slate-900 tracking-tight">{user?.isAdmin ? "Administrator" : "Standard User"}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-2xl font-black italic px-2">Your <span className="text-indigo-600">Interaction</span> Feed</h3>
                  <div className="card-premium !p-0 overflow-hidden divide-y divide-slate-50 shadow-2xl shadow-slate-100/30">
                    {recentActivity.length === 0 ? (
                      <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Activity size={48} className="text-slate-100" />
                        <p className="text-slate-400 font-bold italic">No recent system interactions found.</p>
                      </div>
                    ) : (
                      recentActivity.map((item, i) => (
                        <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-all group">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'journey' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {item.type === 'journey' ? <MapPin size={20} /> : <FileText size={20} />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-black text-slate-900 tracking-tight">
                              {item.type === 'journey' ? 'New Journey Logs Dispatched' : 'Invoice Record Generated'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {formatDate(new Date(item.createdAt))} • Created by You
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(item.type === 'journey' ? `/journey/journey-detail/${item._id}` : `/bill-entry/bill?bill_no=${item.bill_no}`)}
                            className="ml-auto p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <ChevronRight size={18} className="text-slate-400" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-premium !p-12 flex flex-col gap-10"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-black italic tracking-tighter">Update <span className="text-indigo-600">Info</span></h3>
                  <p className="text-sm text-slate-400 font-medium">Changed information will reflect across all system documents and reports.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormInput
                      type="text"
                      name="fullname"
                      label="Full Professional Name"
                      value={profileData.fullname}
                      icon={<User size={18} />}
                      onChange={(val) => setProfileData(p => ({ ...p, fullname: val }))}
                      placeholder="e.g. Vishal Kumar"
                    />
                    <FormInput
                      type="email"
                      name="email"
                      label="Official Email"
                      value={profileData.email}
                      icon={<Mail size={18} />}
                      onChange={(val) => setProfileData(p => ({ ...p, email: val }))}
                      placeholder="vishal@drl.com"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      isLoading={isUpdating}
                      className="!px-10 py-5 shadow-indigo-200"
                      icon={<ShieldCheck size={20} />}
                    >
                      Save Changes
                    </Button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="px-8 py-5 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-premium !p-12 flex flex-col gap-10"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-black italic tracking-tighter font-sans uppercase">Security <span className="text-rose-600 underline underline-offset-8 decoration-rose-100">Protocols</span></h3>
                  <p className="text-sm text-slate-400 font-medium tracking-tight">Ensure your password is strong and updated periodically.</p>
                </div>

                <form onSubmit={handleChangePassword} className="flex flex-col gap-8">
                  <FormInput
                    type="password"
                    name="currentPassword"
                    label="Current Secret Token"
                    value={passwordData.currentPassword}
                    icon={<Lock size={18} />}
                    onChange={(val) => setPasswordData(p => ({ ...p, currentPassword: val }))}
                    placeholder="••••••••"
                  />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormInput
                      type="password"
                      name="newPassword"
                      label="New Strong Password"
                      value={passwordData.newPassword}
                      icon={<Key size={18} />}
                      onChange={(val) => setPasswordData(p => ({ ...p, newPassword: val }))}
                      placeholder="••••••••"
                    />
                    <FormInput
                      type="password"
                      name="confirmPassword"
                      label="Confirm New Secret"
                      value={passwordData.confirmPassword}
                      icon={<ShieldCheck size={18} />}
                      onChange={(val) => setPasswordData(p => ({ ...p, confirmPassword: val }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      isLoading={isUpdating}
                      className="!px-10 py-5 !bg-slate-900 shadow-slate-200"
                      icon={<ChevronRight size={20} />}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>

                <div className="mt-6 p-6 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                  <Bell className="text-amber-600 mt-1" size={20} />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-black text-amber-900 uppercase">Pro Tip</p>
                    <p className="text-xs text-amber-700 font-medium">Use at least 8 characters with numbers and symbols for maximum security.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;
