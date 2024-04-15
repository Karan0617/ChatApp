import { useState } from "react"
import toast from "react-hot-toast"

const useLogin = () => {
    const [loading, setLoading] = useState(false)

const login = async(email,password)=>{
    const success=handleInputErrors(email,password)
    if(!success) return

    setLoading(true)
    try {
        const res=await fetch("http://localhost:2000/api/login",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({email,password})
        })

        const data=await res.json()
        if(data.error){
            throw new Error(data.error)
        }
        localStorage.setItem('user:token',JSON.stringify(data))

    } catch (error) {
        toast.error('User Invaild')
    } finally{
        setLoading(false)
    }
}
return(loading,login)
}

export default useLogin


function handleInputErrors(email, password) {
    if (!username || !password) {
      toast.error("Please fill all the required fields")
      return false;
    }
  
    return true;
  }