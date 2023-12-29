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

const BranchDetails = () => {
  const params = useParams();
  const {id} = params;
  const router = useRouter();
  const {userData} = useGetUserData();
  console.log(id);
  const closeDeleteBranchModal = useRef();
  const dispatchMessage = useDispatchMessage();

  const {data, isFetching, refetch: refetchBranchData} = useQuery({
    queryKey: ["allBranches", id],
    queryFn: () => apiGet({ url: `/branch/${id}`})
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

  const disableBranch = useMutation({
    mutationFn: () => apiPatch({ url: `/branch/${id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Branch disabled successfully"})
      refetchBranchData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const reActivateBranch = useMutation({
    mutationFn: () => apiPatch({ url: `/branch/${id}`, data: {isActive: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Branch activated successfully"})
      refetchBranchData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const deleteBranch = useMutation({
    mutationFn: () => apiDelete({ url: `/branch/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Branch deleted successfully"})
      closeDeleteBranchModal.current.click();
      router.push("/branches")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteBranchModal.current.click();
    })
  }) 

  

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Branch</h4>
        <span className="breadcrumb-item ms-3"><a href="/branches"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        <a className="btn btn-link text-primary ms-auto" href={`/branches/${id}/edit`}>Edit</a>
        <a className="btn btn-link text-danger" data-bs-toggle="modal" data-bs-target="#deleteBranch">Delete</a>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
            <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Branch Details</h5>
                {data?.isActive ?
                  <button className="btn btn-muted ms-auto" disabled={disableBranch.isLoading} onClick={disableBranch.mutate}>
                    {disableBranch?.isLoading ? "Loading..." : "Disable"}
                  </button> :
                  <button className="btn btn-success ms-auto" disabled={reActivateBranch.isLoading} onClick={reActivateBranch.mutate}>
                    {reActivateBranch?.isLoading ? "Loading..." : "Activate"}
                  </button>
                }
              </header>

              {data ?
                <div className="container-fluid">
                  <DataListItem title="Branch Name" value={data.name} />
                  <DataListItem title="Company Name" value={data.company.name} />
                  <DataListItem title="Branch Code" value={data.code} />
                  <DataListItem title="State" value={data.state} />
                  <DataListItem title="LGA" value={data.lga} />
                  <DataListItem title="Phone Number" value={data.phoneNumber} />
                  <DataListItem title="Email" value={data.email} />
                  <DataListItem title="Address" value={data.address} />
                  <DataListItem title="Head Office" value={data.isHeadOffice ? "Yes" : "No"} />
                  <DataListItem title="Is Active?" value={data.isActive ? "Yes" : "No"} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </div> :
                <LoadingFallBack />

              }
            </div>
          </div>
        </div>
      </div>
      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Branch" message="Are you sure your want to delete this branch?" isLoading={deleteBranch.isLoading} onSubmit={deleteBranch.mutate} id="deleteBranch" btnColor="danger" closeButtonRef={closeDeleteBranchModal} />}
    </div>
  )
}

export default BranchDetails