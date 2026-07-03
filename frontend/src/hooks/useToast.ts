import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useToast(key: string = "registroExitoso") {
    const location = useLocation();
    const navigate = useNavigate();
    const [showToast, setShowToast] = useState(false);
    useEffect(() => {
        if (location.state && typeof location.state === "object" && key in location.state) {
            const stateObj = location.state as Record<string, unknown>;
            if (stateObj[key]) {
                setTimeout(() => {
                    setShowToast(true);
                    navigate(location.pathname, { replace: true, state: {} });
                }, 0);
            }
        }
    }, [location, navigate, key]);
  return { showToast, setShowToast };
}