import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { User, Mail, Shield, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden"
      >
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-16 left-12 w-32 h-32 bg-white rounded-[2rem] shadow-xl p-2">
            <div className="w-full h-full bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-indigo-600">
              <User size={48} />
            </div>
          </div>
        </div>

        <div className="pt-20 pb-12 px-12 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight italic flex items-center gap-3">
              {user?.fullname}
              {user?.isAdmin && <BadgeCheck className="text-indigo-600" size={28} />}
            </h1>
            <p className="text-slate-500 font-medium">@{user?.username}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                <Mail size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</span>
                <span className="text-sm font-semibold text-slate-900">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                <Shield size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Type</span>
                <span className="text-sm font-semibold text-slate-900">{user?.isAdmin ? "Administrator" : "Standard User"}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
            <p className="text-indigo-700 text-sm font-medium leading-relaxed">
              Welcome to your account profile. Here you can see your registered information and management roles.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

