import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

const useAuthCheck = () => {
    const [checking, setChecking] = useState(true);
    const { authStart, authSuccess, authEnd } = useAuthStore();

    useEffect(() => {
        const fetchUser = async () => {
            authStart();
            try {
                const res = await api.get("/auth/me");
                const obj = res.data;
                if (res.status === 200 && obj.data) {
                    authSuccess(obj.data);
                } else {
                    authEnd();
                }
            } catch (error: any) {
                authEnd();
            } finally {
                setChecking(false);
            }
        }
        fetchUser();
    }, [authStart, authSuccess, authEnd]);

    return checking;
}

export default useAuthCheck;