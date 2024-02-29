"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiDelete } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import formatMonth from '@/services/formatMonth';
import ConfirmationModal from "@/components/confirmationModal";
import useGetUserData from "@/hooks/useGetUserData";
import { useEffect, useState, useRef } from "react";
import ListOfSubordinates from "@/components/listOfSubordinates";
import * as XLSX from 'xlsx';


const LoadingFallBack = () =>{
  return (
    <>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
  );
}


const MonthlyTargets = () =>{  
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const closeDeleteMonthlyTargetModal = useRef();
  const pathname = usePathname();
  const { userData } = useGetUserData();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  const [month, setMonth] = useState("");

  const {data, isFetching, refetch: refetchMonthlyTargets} = useQuery({
    queryKey: ["allMonthlyTargets" ],
    queryFn: ()=>apiGet({ url: `/monthlyTarget?month=${month}&employeeId=${userData?.staffCadre?.includes("admin") ? "" : employeeId || userData?.id }`})
    .then(res => {
      console.log(res)
      return res.data
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return {}
    }),
    enabled: false
  })
  // const [salesInvoices, setSalesInvoices] = useState([])
  const [monthlyTargetToDeleteId, setMonthlyTargetToDeleteId] = useState("")

  /* const fetchInvoiceRequests = () =>{
    apiGet({ url: `/invoiceRequestForm?employeeId=${userData.id}&approved=approved`})
    .then(res => {
      console.log(res)
      setSalesInvoices(res.data)
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    })
  } */

  /* const getAchievementForTheYear = () =>{
    let achievement = 0
    salesInvoices.forEach( item =>{
      let invoiceYear = new Date(item.createdAt).getFullYear();
      let currentYear = new Date().getFullYear();
      console.log(item)
      if(invoiceYear === currentYear){
        achievement += parseInt(item.quantity);
      }
    })
    return achievement;
  } */

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

  /* useEffect(()=>{
    if(userData?.id){
      fetchInvoiceRequests()
    }
  },[userData]) */

  useEffect(()=>{
    let currentMonth = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().length > 1 ? new Date().getMonth() + 1 : `0${new Date().getMonth() + 1}`}`;
    if(!month){
      setMonth(currentMonth)
    }else{
      refetchMonthlyTargets()
    }
  },[month])

  


  const listMonthlyTargets = () =>{
    return data.data.map( (item, index) => {
      const {id, month, target, employee} = item;
      return( 
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0 link-style text-primary" onClick={() => {
            router.push(`/targetAchievements/${id}`)
          }}>
            <h6 className="fw-semibold m-0 text-primary">{employee?.firstName} {employee?.lastName}</h6>
            <p className="fw-normal m-0">{employee?.email}</p>
          </td>
          <td className="border-bottom-0 link-style" onClick={() => {
            router.push(`/targetAchievements/${id}`)
            }}>
            <p className="fw-semibold mb-1 text-primary">{formatMonth(new Date(month).getMonth())} {new Date(month).getFullYear()}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{target}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{getAchievementForTheMonth(month, employee?.invoiceRequestForms)}</p>
          </td>
          {userData?.staffCadre?.includes("admin") && 
          <td className="border-bottom-0">
            <a className="btn btn-link text-primary ms-auto" href={`/targetAchievements/${id}/edit`}>Edit</a>
            <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteMonthlyTarget" onClick={()=>setMonthlyTargetToDeleteId(id)}>Delete</a>
          </td>}
        </tr>
    )
    })
  }

  const deleteMonthlyTarget = useMutation({
    mutationFn: () => apiDelete({ url: `/monthlyTarget/${monthlyTargetToDeleteId}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Monthly Target deleted successfully"})
      refetchMonthlyTargets()
      closeDeleteMonthlyTargetModal.current.click();
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteMonthlyTargetModal.current.click();
    })
  }) 





  const allTargetAchievementsQuery = useQuery({
    queryKey: ["allTargetAchievements-excel" ],
    queryFn:  ()=>apiGet({ url: `/monthlyTarget/excel`})
    .then(res => {
      console.log(res)
      downloadExcel(res.data)
      return res.data
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return []
    }),
    enabled: false
  })

  const downloadExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "TargetAchievement-DataSheet.xlsx");
  };

  const canShowTable = () => {
    let result = false;
    if(userData?.staffCadre?.includes("admin")){
      result = true
    }else if(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor"){
      result = true
    }else if (userData?.accountType === "Supervisor" && employeeId) {
      result = true
    }
    return result
  }


  return (
    <>
      {(userData?.accountType === "Supervisor" && !employeeId) && <ListOfSubordinates title="Target & Achievements" pathname={pathname} />}

      {canShowTable() &&
        <div className="container-fluid">
          <header className="d-flex align-items-center mb-4">
            <div className='d-flex'>
              <input type="month" className="form-control" id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            {/* <h4 className="m-0">{new Date().getFullYear()} Target: {data?.targetForCurrentYearCount}</h4>
            {userData?.staffCadre?.includes("salesPerson") &&
              <h4 className="m-0 ms-auto">Achievement Till Date: {getAchievementForTheYear()}</h4>
            } */}
            {userData?.staffCadre?.includes("admin") && <a className="btn btn-link text-primary ms-auto" href="/targetAchievements/add">Add</a>}
          </header>

          <div className="row">
            <div className="col-12 d-flex align-items-stretch">
              <div className="card w-100">
                <div className="card-body p-4">
                  <h5 className="card-title fw-semibold mb-4 opacity-75">All Monthly Targets</h5>
                  <div className="table-responsive">
                    <table className="table text-nowrap mb-0 align-middle">
                      <thead className="text-dark fs-4">
                        <tr>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">#</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Employee</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Month</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Sales Target</h6>
                          </th>
                          <th className="border-bottom-0">
                            <h6 className="fw-semibold mb-0">Achievement</h6>
                          </th>
                          {userData?.staffCadre?.includes("admin") &&
                            <th className="border-bottom-0">
                              <h6 className="fw-semibold mb-0">Actions</h6>
                            </th>}
                        </tr>
                      </thead>
                      <tbody>
                        {data ? listMonthlyTargets() : <LoadingFallBack />}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Monthly Target" message="Are you sure your want to delete this monthly target?" isLoading={deleteMonthlyTarget?.isLoading} onSubmit={()=>deleteMonthlyTarget.mutate()} id="deleteMonthlyTarget" btnColor="danger" closeButtonRef={closeDeleteMonthlyTargetModal} />}
        </div>
      }
    </>
    
  )
}

export default MonthlyTargets