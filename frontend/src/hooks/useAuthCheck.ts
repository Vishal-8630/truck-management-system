import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { authEnd, authStart, authSuccess } from "../features/auth";

const useAuthCheck = () => {
    const [checking, setChecking] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            dispatch(authStart());
            try {
                const res = await api.get("/auth/me");
                const obj = res.data;
                if (res.status === 200 && obj.data) {
                    dispatch(authSuccess(obj.data));
                } else {
                    dispatch(authEnd());
                }
            } catch (error: any ) {
                dispatch(authEnd());
            } finally {
                setChecking(false);
            }
        }
        fetchUser();
    }, [dispatch]);

    return checking;
}

export default useAuthCheck;