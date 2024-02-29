"use client"

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useSelector } from "react-redux";
import { getDecodedToken } from "@/services/localStorageService";
import useGetUserData from "@/hooks/useGetUserData";
import formatMonth from '@/services/formatMonth';
import { useEffect, useState } from "react";


const DataListItem = ({title, value}) => {
  return (
    <div className="row mb-3 d-flex align-items-center">
      <div className="col-12 col-md-4">
        <h6 className="m-0">{title}</h6>
      </div>
      <div className="col-12 col-md-8">
        <span>{value}</span>
      </div>
    </div>
  )
}

const LoadingFallBack = () =>{
  return (
    <div>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )"}} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )"}} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )"}} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )"}} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )"}} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )"}} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )"}} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )"}} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )"}} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )"}} width="60%" animation="wave" />
      </article>
    </div>
    
  );
}

const MonthlyTargetDetails = () => {
  const params = useParams();
  const {id} = params;
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();
  const tokenData = getDecodedToken()
  const [employeeId, setEmployeeId] = useState("")
  const [totalTargetForYear, setTotalTargetForYear] = useState(null)
 
  const {data, isFetching} = useQuery({
    queryKey: ["allTargets", id],
    queryFn: () => apiGet({ url: `/monthlyTarget/${id}`})
    .then(res =>{
      console.log(res.data)
      setEmployeeId(res?.data?.employeeId)
      return res.data
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      return {}
    }),
    staleTime: Infinity,
    retry: 3
  }) 

  const getAchievementForTheMonth = (month, invoiceRequestForms) =>{
    let achievement = 0
    invoiceRequestForms.forEach( item =>{
      let invoiceMonth = new Date(item.createdAt).getMonth();
      let targetMonth = new Date(month).getMonth();
      console.log(invoiceMonth, targetMonth)
      if(invoiceMonth === targetMonth){
        achievement += parseInt(item.quantity);
      }
    })
    return achievement;
  }

  const {data: allMonthlyTargetsForEmployee, isFetching: isFetchingMonthlyTargets, refetch: refetchMonthlyTargets} = useQuery({
    queryKey: ["allMonthlyTargets" ],
    queryFn: ()=>apiGet({ url: `/monthlyTarget?&employeeId=${employeeId}`})
    .then(res => {
      console.log(res)
      getTotalTargetForTheYear(res.data.data)
      return res.data
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return {}
    }),
    enabled: false
  })

  useEffect(()=>{
    if(employeeId){
      refetchMonthlyTargets()
    }
  }, [employeeId])

  const getAchievementForTheYear = (invoiceRequestForms) =>{
    let achievement = 0
    invoiceRequestForms.forEach( item =>{
      let invoiceYear = new Date(item.createdAt).getFullYear();
      let currentYear = new Date().getFullYear();
      console.log(item)
      if(invoiceYear === currentYear){
        achievement += parseInt(item.quantity);
      }
    })
    return achievement;
  }

  const getTotalTargetForTheYear = (monthlyTargets) =>{
    console.log(monthlyTargets)
    let totalTargetForYear = 0
    monthlyTargets.forEach( item =>{
      let monthlyTargetYear = new Date(item.month).getFullYear();
      let currentYear = new Date().getFullYear();
      if(monthlyTargetYear === currentYear){
        totalTargetForYear += parseInt(item.target);
      }
    })
    setTotalTargetForYear(totalTargetForYear)
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Monthly Targets</h4>
        <span className="breadcrumb-item ms-3"><a href="/targetAchievements"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        {tokenData?.staffCadre?.includes("admin") &&<a className="btn btn-link text-primary ms-auto" href={`/targetAchievements/${id}/edit`}>Edit</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Monthly Target Details</h5>
              {data ?
                <>
                  {userData?.id !== data?.employee?.id && <DataListItem title="Employee" value={`${data?.employee?.firstName} ${data?.employee?.lastName}`} />}
                  <DataListItem title="Month" value={`${formatMonth(new Date(data.month).getMonth())} ${new Date(data.month).getFullYear()}`} />
                  <DataListItem title={`${formatMonth(new Date(data.month).getMonth())} ${new Date(data.month).getFullYear()} Target`} value={data.target} />
                  <DataListItem title={`${formatMonth(new Date(data.month).getMonth())} ${new Date(data.month).getFullYear()} Achievement`} value={getAchievementForTheMonth(data?.month, data.employee?.invoiceRequestForms)} />
                  <hr />
                  <DataListItem title={`Total Target for ${new Date(data.month).getFullYear()}`} value={totalTargetForYear} />
                  <DataListItem title={`Total Achievement for ${new Date(data.month).getFullYear()}`} value={getAchievementForTheYear(data.employee?.invoiceRequestForms)} />
                </> :
                <LoadingFallBack />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyTargetDetails