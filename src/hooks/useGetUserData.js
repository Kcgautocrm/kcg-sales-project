"use client"
import * as jwt from 'jsonwebtoken';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiService';
import {prohibitedRoutes, viewOnlyRoutes} from "@/utils/consts";


const useGetUserData = () => {
    const router = useRouter();
    const pathName = usePathname();
    const [userData, setUserData] = useState({
        id: "",
        email: "",
        staffCadre: [],
        firstName: "",
        lastName: "",
        accountType: "",
    })
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const [tokenUpdated, setTokenUpdated] = useState("");

    const logout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("accountType");
        setTokenUpdated(new Date().getTime())
    }

    const switchAccountType = (accountType) => {
        localStorage.setItem("accountType", accountType);
        setTokenUpdated(new Date().getTime())
    }

    const setToken = (token)=>{
        localStorage.setItem("token", token);
        setTokenUpdated(new Date().getTime())
    }

    useEffect(() => {
        let token = localStorage.getItem('token')
        let data = jwt.decode(token)
        let accountType = localStorage.getItem("accountType");
        if (data?.staffCadre?.length && pathName === "/login") {
            return router.push("/")
        }
        if (!data?.staffCadre?.length && pathName !== ("/login" || "/forgotPassword" || "/resetPassword")) {
            return router.push("/login")
        }
        if (data?.staffCadre?.length) {
            let restrictedRoutes = prohibitedRoutes()[data?.staffCadre[0]]
            let viewOnly = viewOnlyRoutes()[data?.staffCadre[0]]
            if (restrictedRoutes) {
                for (let i = 0; i < restrictedRoutes.length; i++) {
                    if (pathName.includes(restrictedRoutes[i])) {
                        setIsAllowed(false);
                        return router.push("/")
                    }
                    if (i === restrictedRoutes.length - 1) {
                        setIsAllowed(true)
                    }
                }
            }
            if (viewOnly) {
                for (let i = 0; i < viewOnly.length; i++) {
                    if (pathName.includes(viewOnly[i]) && (pathName.includes("add") || pathName.includes("edit"))) {
                        setIsAllowed(false);
                        return router.push("/")
                    }
                    if (i === viewOnly.length - 1) {
                        setIsAllowed(true)
                    }
                }
            } 
            setUserData(prevState =>({
                ...prevState,
                ...data,
            }))
        }
        if(accountType){
            setUserData(prevState =>({
                ...prevState,
                accountType: accountType
            }))
        }
               
    }, [tokenUpdated])

    return { isAllowed, userData, setTokenUpdated, logout, setToken, switchAccountType }
}

export default useGetUserData;