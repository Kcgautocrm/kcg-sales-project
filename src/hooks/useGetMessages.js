import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useGetUserData from "./useGetUserData";
import { useEffect, useState } from "react";



const useGetNotifications = () =>{
  const {userData} = useGetUserData();
  const [notificationsData, setNotificationsData] = useState({
    count: 0,
    data: [], 
  })

  const getQueryString = () =>{
    if(userData?.staffCadre[0] === "admin"){
      return "staffCadre=admin"
    }else{
      return `employeeId=${userData?.id}`
    }
  }

  useEffect(()=>{
    if(userData.id){
      console.log(getQueryString())
      fetchNotifications();
    }
  }, [userData])

  const fetchNotifications = () =>{
    apiGet({ url: `/notification?${getQueryString()}` })
      .then(res => {
        console.log(res)
        setNotificationsData( prevState =>({
          ...prevState,
          count: res.data.length,
          data: res.data,
        }))
      })
      .catch(error => {
        console.log(error)
      })
  }
 

  return {...notificationsData, refetch: fetchNotifications}
}

export default useGetNotifications;