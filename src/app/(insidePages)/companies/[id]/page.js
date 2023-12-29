"use client"

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useRouter } from "next/navigation";
import moment from "moment";
import ConfirmationModal from "@/components/confirmationModal";
import useGetUserData from "@/hooks/useGetUserData";
import { useState, useRef } from "react";
import clipLongText from "@/services/clipLongText";


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

const BranchesLoadingFallBack = () =>{
  return (
    <>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
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
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
    
  );
}

const CompanyDetails = () => {
  const params = useParams();
  const router = useRouter();
  const closeDeleteCompanyModal = useRef();
  const {id} = params;
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();

  const {data, refetch: refetchCompanyData} = useQuery({
    queryKey: ["allCompanies", id],
    queryFn: () => apiGet({ url: `/company/${id}`})
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

  const [openModal, setOpenModal] = useState(false);

  const disableCompany = useMutation({
    mutationFn: () => apiPatch({ url: `/company/${id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Company disabled successfully"})
      refetchCompanyData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const reActivateCompany = useMutation({
    mutationFn: () => apiPatch({ url: `/company/${id}`, data: {isActive: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Company activated successfully"})
      refetchCompanyData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const deleteCompany = useMutation({
    mutationFn: () => apiDelete({ url: `/company/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Company deleted successfully"})
      closeDeleteCompanyModal.current.click();
      router.push("/companies")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteCompanyModal.current.click();
    })
  }) 

  const listCompanyBrands = () =>{
    let brands = ""
    data.brands.forEach( brand => {
      if(brands === ""){
        brands += `${brand}`
      }else{
        brands += ` | ${brand}`
      }
    })
    return brands;
  }


  const listBranches = () => {
    return data.branches.map((item, index) => {
      const { id, name, code, email, phoneNumber, state, lga, address, isHeadOffice, isActive } = item;
        return (
          <tr key={id} className="hover">
            <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
            <td className="border-bottom-0 link-style" onClick={() => router.push(`/branches/${id}`)}>
              <h6 className="fw-semibold mb-1 text-capitalize text-primary">{name}</h6>
            </td>
            <td className="border-bottom-0">
              <p className="fw-semibold mb-1 text-capitalize">{code}</p>
            </td>
            <td className="border-bottom-0">
              <p className="fw-semibold mb-1 ">{email}</p>
            </td>
            <td className="border-bottom-0">
              <p className="mb-0 fw-normal text-capitalize">{phoneNumber}</p>
            </td>
            <td className="border-bottom-0">
              <p className="mb-0 fw-normal text-capitalize">{clipLongText(address)}</p>
              <span className="mb-0 fw-normal">{lga} {state}</span>
            </td>
            <td className="border-bottom-0">
              <p className="mb-0 fw-normal text-capitalize">{isHeadOffice ? "Yes" : "No"}</p>
            </td>
            <td className="border-bottom-0">
              <p className="mb-0 fw-normal text-capitalize">{isActive ? "Yes" : "No"}</p>
            </td>
            <td className="border-bottom-0">
              <a className="btn btn-link text-primary" onClick={() => router.push(`/branches/${id}/edit`)}>Edit</a>
            </td>
          </tr>
        )
    })
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Company</h4>
        <span className="breadcrumb-item ms-3"><a href="/companies"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        <a className="btn btn-link text-primary ms-auto"  onClick={()=>router.push(`/branches/add?companyId=${id}`)}>Add Branch</a>
        <a className="btn btn-link text-primary ms-2" href={`/companies/${id}/edit`}>Edit</a>
        <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteCompany">Delete</a>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100"> 
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Company Details</h5>
                {data?.isActive ?
                  <button className="btn btn-muted ms-auto" disabled={disableCompany.isLoading} onClick={disableCompany.mutate}>
                    {disableCompany?.isLoading ? "Loading..." : "Disable"}
                  </button> :
                  <button className="btn btn-success ms-auto" disabled={reActivateCompany.isLoading} onClick={reActivateCompany.mutate}>
                    {reActivateCompany?.isLoading ? "Loading..." : "Activate"}
                  </button>
                }
              </header>
              

              {data ?
                <>
                  <div className="row mb-3 d-flex align-items-center">
                    <div className="col-12 col-md-4">
                      <h6 className="m-0">Company Logo</h6>
                    </div>
                    <div className="col-12 col-md-8">
                      <img src={data.logo} height={40} alt="Company Logo" />
                    </div>
                  </div>
                  <DataListItem title="Company Name" value={data.name} />
                  <DataListItem title="Company Code" value={data.code} />
                  <DataListItem title="Email" value={data.email} />
                  <DataListItem title="Address" value={data.address} />
                  <DataListItem title="Brands" value={listCompanyBrands()} />
                  <DataListItem title="Is Active?" value={data.isActive ? "Yes" : "No"} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />
              }
            </div>


            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4 opacity-75">Branches</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">#</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Branch Name</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Code</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Email</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Phone Number</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Address</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Head Office?</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">isActive?</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Actions</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data ? listBranches() : <BranchesLoadingFallBack />}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Company" message="Are you sure your want to delete this company?" isLoading={deleteCompany?.isLoading} onSubmit={deleteCompany.mutate} id="deleteCompany" btnColor="danger" closeButtonRef={closeDeleteCompanyModal} />}

    </div>
  )
}

export default CompanyDetails