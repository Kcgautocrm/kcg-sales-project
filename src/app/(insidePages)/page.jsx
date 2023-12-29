"use client"

import Image from 'next/image'
import styles from './page.module.css'
import { useState, useEffect } from 'react'
import AppPieChart from "@/components/pieChart";
import moment from 'moment';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiService';
import useDispatchMessage from '@/hooks/useDispatchMessage';
import useGetUserData from '@/hooks/useGetUserData';
import { CircularProgress } from '@mui/material';
import { convertMsToHM, formatAMPM } from '@/services/formatTime';



const CustomerVisitItem = ({companyName, contactPerson, visitDate}) =>{
  const [countDown, setCountDown] = useState(0);

  useEffect(()=>{
    let interval;
    let currentTime = new Date().getTime();
    let visitTime = new Date(visitDate).getTime();
    interval = setInterval(() => setCountDown( visitTime - currentTime), 1000);
    return () =>{
      clearInterval(interval)
    }
  })
  return <li className='border-bottom mb-2 py-1'>
      <div className='fw-bold d-flex'>
        <span>{contactPerson}</span>
        <span className={`ms-auto ${countDown < 0 ? "text-danger" : "text-success"}`}>{ countDown > 0 ? convertMsToHM(countDown) : "Time Elapsed"}</span>
      </div>
      <div className='d-flex'>
        <span className='small'>{companyName}</span>
        <span className='ms-auto small'>{new Date(visitDate).toLocaleDateString()} {formatAMPM(visitDate)}</span>
      </div>
  </li>
}

export default function Home() {
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();

  const [customerVisitDate, setCustomerVisitDate] = useState("");
  const [achievementMonth, setAchievementMonth] = useState("");
  const [pfiRequestMonth, setPfiRequestMonth] = useState("");
  const [invoiceRequestMonth, setInvoiceRequestMonth] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  const pfiRequestQuery = useMutation({
    mutationFn: (params) => apiGet({ url: `/dashboard/pfiRequest?${params}`})
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  const invoiceRequestQuery = useMutation({
    mutationFn: (params) => apiGet({ url: `/dashboard/invoiceRequest?${params}`})
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  const achievementQuery = useMutation({
    mutationFn: (params) => apiGet({ url: `/dashboard/achievement?${params}`})
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  const customerVisitQuery = useMutation({
    mutationFn: (params) => apiGet({ url: `/dashboard/customerVisit?${params}`})
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  const employeeQuery = useQuery({
    queryKey: ["allEmployees"],
    queryFn: () => apiGet({ url: `/employee?isActive=true` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3,
      enabled: false
  })

  const subordinateQuery = useQuery({
    queryKey: ["allSubordinates"],
    queryFn: () => apiGet({ url: `/employee/subordinates/${userData?.id}` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3,
      enabled: false,
  })

  const listEmployeeOptions = () => {
    let data = [];
    if(userData?.staffCadre[0] === "admin"){
      data = employeeQuery?.data
    }else if( userData?.staffCadre[0] === "supervisor" && userData?.accountType === "Supervisor"){
      data = subordinateQuery?.data
    }
    if (data?.length) {
      return data.map(employee =>
        <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>
      )
    }
  }

  useEffect(()=>{
    let currentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    let currentMonth = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    if(userData?.staffCadre.includes("salesPerson") && userData?.accountType !== "Supervisor"){
      setEmployeeId(userData?.id)
    }else{
      setEmployeeId("")
    }
    if(userData?.staffCadre[0] === "admin"){
      employeeQuery.refetch()
    }
    if(userData?.accountType === "Supervisor"){
      subordinateQuery.refetch()
    }
    setCustomerVisitDate(currentDate);
    setAchievementMonth(currentMonth);
    setPfiRequestMonth(currentMonth);
    setInvoiceRequestMonth(currentMonth);
  },[userData])

  const fetchPfiRequests = ()=>{
    let startDate = new Date(moment(pfiRequestMonth).startOf("month")).toISOString();
    let endDate = new Date(moment(pfiRequestMonth).endOf("month")).toISOString();
    let searchParams = `employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
    pfiRequestQuery.mutate(searchParams);
  }

  const fetchinvoiceRequests = ()=>{
    let startDate = new Date(moment(invoiceRequestMonth).startOf("month")).toISOString();
    let endDate = new Date(moment(invoiceRequestMonth).endOf("month")).toISOString();
    let searchParams = `employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
    invoiceRequestQuery.mutate(searchParams);
  }

  const fetchAchievements = ()=>{
    let startDate = new Date(moment(achievementMonth).startOf("month")).toISOString();
    let endDate = new Date(moment(achievementMonth).endOf("month")).toISOString();
    let searchParams = `employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}&month=${achievementMonth}`;
    achievementQuery.mutate(searchParams);
  }

  const fetchCustomerVisits = ()=>{
    let startDate = new Date(moment(customerVisitDate).startOf("day")).getTime();
    let endDate = new Date(moment(customerVisitDate).endOf("day")).getTime();
    let searchParams = `employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
    customerVisitQuery.mutate(searchParams);
  }

  useEffect(()=>{
    if(employeeId !== null && pfiRequestMonth){
      fetchPfiRequests()
    }
  }, [employeeId, pfiRequestMonth])

  useEffect(()=>{
    if(employeeId !== null && invoiceRequestMonth){
      fetchinvoiceRequests()
    }
  }, [employeeId, invoiceRequestMonth])

  useEffect(()=>{
    if(employeeId !== null && achievementMonth){
      fetchAchievements()
    }
  }, [employeeId, achievementMonth])

  useEffect(()=>{
    if(employeeId !== null && customerVisitDate){
      fetchCustomerVisits()
    }
  }, [employeeId, customerVisitDate])

  const pfiMetaData = () =>{
    let numOfApproved = 0;
    let numOfUnApproved = 0;
    if(pfiRequestQuery?.data){
      pfiRequestQuery?.data?.forEach( item =>{
        if(item.approved){
          numOfApproved++
        }else{
          numOfUnApproved++
        }
      })
    }
    return {
      approved: numOfApproved,
      unApproved: numOfUnApproved
    }
  }

  const invoiceRequestMetaData = () =>{
    let numOfApproved = 0;
    let numOfUnApproved = 0;
    if(invoiceRequestQuery?.data){
      invoiceRequestQuery?.data?.forEach( item =>{
        if(item.approved){
          numOfApproved++
        }else{
          numOfUnApproved++
        }
      })
    }
    return {
      approved: numOfApproved,
      unApproved: numOfUnApproved
    }
  }

  const achievement = () =>{
    let achievement = 0;
    achievementQuery?.data?.data?.forEach( item =>{
      achievement += parseInt(item.quantity)
    })
    return achievement
  }

  const listCustomerVisits = () =>{
    return customerVisitQuery?.data?.map( item => {
      return <CustomerVisitItem key={item.id} companyName={item.customer.companyName} contactPerson={item.contactPerson.name} visitDate={item.nextVisitDate}/>
    })
  }

  return (
    <div className="container-fluid">

      {(userData?.staffCadre[0] === "admin" || userData?.accountType === "Supervisor") &&
      <div className='row'>
        <div className="col-lg-6 d-flex align-items-strech">
          <div className="card w-100">
            <div className="card-body p-3">
              <div className='d-flex flex-column mb-2'>
                <h5 className="card-title fw-semibold me-auto mb-2"> Filter by {userData?.staffCadre[0] === "admin" ? "Employees" : "Subordinates"} </h5>
                <select className="form-select shadow-none" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} id="employeeId" aria-label="Default select example">
                  <option value="">Select Employee</option>
                  {listEmployeeOptions()}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>}


      <div className="row">
        <div className="col-lg-6 d-flex align-items-strech">
          <div className="card w-100">
            <div className="card-body">
              <div className='d-flex align-items-center mb-2'>
                <h5 className="card-title fw-semibold me-auto mb-0"> Customer Visits for today </h5>
                <div className='d-flex'>
                  <input type="date" className="form-control" id="customerVisitDate" value={customerVisitDate} onChange={(e) => setCustomerVisitDate(e.target.value)} />
                </div>
              </div>

              <ul style={{ maxHeight: "200px", overflowY: "auto"}}>
                {!customerVisitQuery.isLoading && listCustomerVisits()}
              </ul>

              {customerVisitQuery?.isLoading &&
              <div>Fetching customer visits ...</div>}
              
            </div>
          </div>
        </div>
        <div className="col-lg-6 d-flex align-items-strech">
          <div className="card w-100">
            <div className="card-body">
              {employeeId &&
              <div className="row align-items-start">
                <div className='col-12 mb-4'>
                  <div className='d-flex align-items-center'>
                    <h5 className="card-title fw-semibold me-auto mb-0"> Achievements </h5>
                    <div className='d-flex'>
                      <input type="month" className="form-control" id="achievementMonth" value={achievementMonth} onChange={(e) => setAchievementMonth(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className='col-12'>
                  <h5>Select Employee to view achievements</h5>
                </div>
                <div className="col-6">
                  <div className="d-flex flex-column pb-1">
                    <h6 className='text-start mb-1'>Month Target</h6>
                    <p className="fw-semibold fs-6 mb-3 text-start">{ achievementQuery?.isLoading ? <CircularProgress size={20} /> : (achievementQuery?.data?.monthTarget || 0)}</p>

                    <h6 className='text-start mb-1'>Achievement</h6>
                    <p className="fw-semibold fs-6 mb-0 text-start">{achievementQuery?.isLoading ? <CircularProgress size={20} /> : achievement()}</p>
                  </div>
                </div>

                <div className="col-6">
                  <div className="d-flex">
                    <AppPieChart arrayOfData={[
                      {label: "Achievement", value: achievement()},
                      {label: "Pending", value: parseInt(achievementQuery?.data?.monthTarget) - achievement() > 0 ? parseInt(achievementQuery?.data?.monthTarget) - achievement() : 0},
                    ]} totalOverride={parseInt(achievementQuery?.data?.monthTarget)}/>
                  </div>
                </div>
              </div>}

              {!employeeId &&
                <h5>Select Employee to view achievement</h5>}
            </div>
            <div id="earning"></div>
          </div>
        </div>
        <div className="col-lg-6 d-flex align-items-strech">
          <div className="card overflow-hidden">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className='col-12 mb-4'>
                  <div className='d-flex align-items-center'>
                    <h5 className="card-title fw-semibold me-auto mb-0"> Pfi Requests </h5>
                    <div className='d-flex'>
                      <input type="month" className="form-control" id="pfiRequestMonth" value={pfiRequestMonth} onChange={(e) => setPfiRequestMonth(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex flex-column pb-1">
                    <h6 className='text-start mb-1'>Pending Pfi Requests</h6>
                    <p className="fw-semibold fs-6 mb-3 text-start">{ pfiRequestQuery?.isLoading ? <CircularProgress size={20} /> : pfiMetaData().unApproved}</p>

                    <h6 className='text-start mb-1'>Approved Pfi Requests</h6>
                    <p className="fw-semibold fs-6 mb-0 text-start">{pfiRequestQuery?.isLoading ? <CircularProgress size={20} /> : pfiMetaData().approved}</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex">
                    <AppPieChart arrayOfData={[
                      {label: "Pending Pfi Requests", value: pfiMetaData().unApproved},
                      {label: "Approved Pfi Requests", value: pfiMetaData().approved}
                    ]} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 d-flex align-items-strech">
          <div className="card overflow-hidden">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className='col-12 mb-4'>
                  <div className='d-flex align-items-center'>
                    <h5 className="card-title fw-semibold me-auto mb-0"> Invoice Requests </h5>
                    <div className='d-flex'>
                      <input type="month" className="form-control" id="invoiceRequestMonth" value={invoiceRequestMonth} onChange={(e)=>setInvoiceRequestMonth(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex flex-column pb-1">
                    <h6 className='text-start mb-1'>Pending Invoice Requests</h6>
                    <p className="fw-semibold fs-6 mb-3 text-start">{ invoiceRequestQuery?.isLoading ? <CircularProgress size={20} /> : invoiceRequestMetaData().unApproved}</p>
                    <h6 className='text-start mb-1'>Approved Invoice Requests</h6>
                    <p className="fw-semibold fs-6 mb-0 text-start">{ invoiceRequestQuery?.isLoading ? <CircularProgress size={20} /> : invoiceRequestMetaData().approved}</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex">
                    <AppPieChart arrayOfData={[
                      {label: "Pending Invoice Requests", value: invoiceRequestMetaData().unApproved},
                      {label: "Approved Invoice Requests", value: invoiceRequestMetaData().approved}
                    ]}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}