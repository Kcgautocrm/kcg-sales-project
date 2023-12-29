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

const BrandDetails = () => {
  const params = useParams();
  const router = useRouter();
  const closeDeleteBrandModal = useRef();
  const {id} = params;
  const {userData} = useGetUserData();
  console.log(id);
  const dispatchMessage = useDispatchMessage();

  const {data, isFetching, refetch: refetchBrandData} = useQuery({
    queryKey: ["allBrands", id],
    queryFn: () => apiGet({ url: `/brand/${id}`})
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

  const disableBrand = useMutation({
    mutationFn: () => apiPatch({ url: `/brand/${id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Brand disabled successfully"})
      refetchBrandData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const reActivateBrand = useMutation({
    mutationFn: () => apiPatch({ url: `/brand/${id}`, data: {isActive: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Brand activated successfully"})
      refetchBrandData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const deleteBrand = useMutation({
    mutationFn: () => apiDelete({ url: `/brand/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Brand deleted successfully"})
      closeDeleteBrandModal.current.click();
      router.push("/brands")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message.replace("prices", "price-master")})
      closeDeleteBrandModal.current.click();
    })
  }) 

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Brand</h4>
        <span className="breadcrumb-item ms-3"><a href="/brands"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        <a className="btn btn-link text-primary ms-auto" href={`/brands/${id}/edit`}>Edit</a>
        <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteBrand">Delete</a>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Brand Details</h5>
                {data?.isActive ?
                  <button className="btn btn-muted ms-auto" disabled={disableBrand.isLoading} onClick={disableBrand.mutate}>
                    {disableBrand?.isLoading ? "Loading..." : "Disable"}
                  </button> :
                  <button className="btn btn-success ms-auto" disabled={reActivateBrand.isLoading} onClick={reActivateBrand.mutate}>
                    {reActivateBrand?.isLoading ? "Loading..." : "Activate"}
                  </button>
                }
              </header>

              {data ?
                <>
                  <div className="row mb-3 d-flex align-items-center">
                    <div className="col-12 col-md-4">
                      <h6 className="m-0">Brand Logo</h6>
                    </div>
                    <div className="col-12 col-md-8">
                      <img src={data.logo} height={40} alt="Brand Logo" />
                    </div>
                  </div>
                  <DataListItem title="Brand Name" value={data.name} />
                  <DataListItem title="Brand Code" value={data.code} />
                  <DataListItem title="Description" value={data.description} />
                  <DataListItem title="is Active?" value={data.isActive ? "Yes" : "No"} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />

              }
            </div>
          </div>
        </div>
      </div>
      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Brand" message="Are you sure your want to delete this brand?" isLoading={deleteBrand.isLoading} onSubmit={deleteBrand.mutate} id="deleteBrand" btnColor="danger" closeButtonRef={closeDeleteBrandModal} />}
    </div>
  )
}

export default BrandDetails