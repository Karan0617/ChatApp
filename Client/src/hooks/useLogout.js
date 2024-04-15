import { useNavigate } from "react-router-dom"

const useLogout = () => {
    const navigate = useNavigate()

    const logout = async () => {
        const res = await fetch("http://localhost:2000/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (data.error) {
            throw new Error(data.error)
        }
        localStorage.removeItem("user:token")
        navigate('/users/sign_in')
    }

    return logout;
}

export default useLogout