"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/services/apiService";
import { useParams, useRouter } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import moment from "moment";
import ConfirmationModal from "@/components/confirmationModal";
import useGetUserData from "@/hooks/useGetUserData";
import { useRef } from "react";

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

const EmployeeDetails = () => {
  const params = useParams();
  const {id} = params;
  const router = useRouter();
  const closeDeleteEmployeeModal = useRef();
  const {userData} = useGetUserData();
  console.log(id);
  const dispatchMessage = useDispatchMessage();

  const {data, isFetching, refetch: refetchEmployeeData} = useQuery({
    queryKey: ["allEmployees", id],
    queryFn: () => apiGet({ url: `/employee/${id}`})
    .then(res =>{
      console.log(res.data)
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

  const disableEmployee = useMutation({
    mutationFn: () => apiPatch({ url: `/employee/${id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Employee disabled successfully"})
      refetchEmployeeData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const reActivateEmployee = useMutation({
    mutationFn: () => apiPatch({ url: `/employee/${id}`, data: {isActive: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Employee activated successfully"})
      refetchEmployeeData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const deleteEmployee = useMutation({
    mutationFn: () => apiDelete({ url: `/employee/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Employee deleted successfully"})
      closeDeleteEmployeeModal.current.click();
      router.push("/employees")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteEmployeeModal.current.click();
    })
  }) 

  const listBrandsAssigned = () =>{
    let brands = ""
    data.brandsAssigned.forEach( brand => {
      if(brands === ""){
        brands += `${brand}`
      }else{
        brands += ` | ${brand}`
      }
    })
    return brands;
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Employee</h4>
        <span className="breadcrumb-item ms-3"><a href="/employees"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        <a className="btn btn-link text-primary ms-auto" href={`/employees/${id}/edit`}>Edit</a>
        {!data?.staffCadre?.includes("admin") && <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteEmployee">Delete</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Employee Details</h5>
                {data?.isActive ?
                  <button className="btn btn-muted ms-auto" disabled={disableEmployee.isLoading} onClick={disableEmployee.mutate}>
                    {disableEmployee?.isLoading ? "Loading..." : "Disable"}
                  </button> :
                  <button className="btn btn-success ms-auto" disabled={reActivateEmployee.isLoading} onClick={reActivateEmployee.mutate}>
                    {reActivateEmployee?.isLoading ? "Loading..." : "Activate"}
                  </button>
                }
              </header>

              {data ?
                <>
                  <DataListItem title="Employee Name" value={`${data.firstName} ${data.middleName} ${data.lastName}`} />
                  <DataListItem title="Employee" value={data.company.name} />
                  <DataListItem title="Branch" value={data.branch.name} />
                  <DataListItem title="Supervisor" value={data.supervisor ? `${data?.supervisor?.firstName} ${data?.supervisor?.lastName}` : "---"} />
                  <DataListItem title="Staff Cadre" value={data.staffCadre[0]} />
                  <DataListItem title="Email" value={data.email} />
                  <DataListItem title="Employment Date" value={ new Date(data.employmentDate).toDateString()} />
                  <DataListItem title="Brands Assigned" value={listBrandsAssigned()} />
                  <DataListItem title="is Active" value={data?.isActive ? "Yes" : "No"} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />
              }
            </div>
          </div>
        </div>
      </div>

      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Employee" message="Are you sure your want to delete this employee?" isLoading={deleteEmployee.isLoading} onSubmit={deleteEmployee.mutate} id="deleteEmployee" btnColor="danger" closeButtonRef={closeDeleteEmployeeModal} />}
    </div>
  )
}

export default EmployeeDetails