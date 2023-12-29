"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/services/apiService";
import { useParams, useRouter } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import formatAsCurrency from "@/services/formatAsCurrency";
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

const PriceMasterDetails = () => {
  const params = useParams();
  const {id} = params;
  const router = useRouter();
  const closeDeletePriceMasterModal = useRef();
  const {userData} = useGetUserData();
  console.log(id);
  const dispatchMessage = useDispatchMessage();

  const {data, isFetching, refetch: refetchPriceMasterData} = useQuery({
    queryKey: ["allProductPrices", id],
    queryFn: () => apiGet({ url: `/priceMaster/${id}`})
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

  const deletePriceMaster = useMutation({
    mutationFn: () => apiDelete({ url: `/priceMaster/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "PriceMaster deleted successfully"})
      closeDeletePriceMasterModal.current.click();
      router.push("/priceMaster")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeletePriceMasterModal.current.click();
    })
  }) 

  const deriveProductStatus = (unitPrice, promoPrice, validTill, anyPromo)=>{
    let validTillString = new Date(validTill).getTime();
    let currentDateString = new Date().getTime();
    let result = {};
    if(!anyPromo){
      result.price = unitPrice
      result.promoActive = false;
    }else if(currentDateString >= validTillString){
      result.price = unitPrice
      result.promoActive = false;
    }else if(currentDateString < validTillString){
      result.price = promoPrice
      result.promoActive = true;
    }
    return result
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Price Master</h4>
        <span className="breadcrumb-item ms-3"><a href="/priceMaster"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        <a className="btn btn-link text-primary ms-auto" href={`/priceMaster/${id}/edit`}>Edit</a>
        <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deletePriceMaster">Delete</a>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Product Price Details</h5>
              {data ?
                <>
                  <DataListItem title="Product" value={data.product.name} />
                  <DataListItem title="Brand" value={data.brand.name} />
                  <DataListItem title="Unit Price" value={formatAsCurrency(data.unitPrice)} />
                  <DataListItem title="Vat Inclusive?" value={data.vatInclusive ? "Yes" : "No"} />
                  <DataListItem title="Vat Rate" value={data.vatRate} />
                  <DataListItem title="Any Promo" value={deriveProductStatus(data.unitPrice, data.promoPrice, data.validTill, data.anyPromo).promoActive ? "Yes" : "No"} />
                  <DataListItem title="Promo Price" value={data.promoPrice ? formatAsCurrency(data.promoPrice) : "---"} />
                  <DataListItem title="Promo Text" value={data.promoText || "---"} />
                  <DataListItem title="Valid From" value={data.validFrom ? `${moment(new Date(data.validFrom)).format('MMMM Do YYYY, h:mm:ss a')}` : "---"} />
                  <DataListItem title="Valid Till" value={data.validTill ? `${moment(new Date(data.validTill)).format('MMMM Do YYYY, h:mm:ss a')}`: "---"} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />

              }
            </div>
          </div>
        </div>
      </div>
      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Price Master" message="Are you sure your want to delete product price?" isLoading={deletePriceMaster.isLoading} onSubmit={deletePriceMaster.mutate} id="deletePriceMaster" btnColor="danger" closeButtonRef={closeDeletePriceMasterModal} />}
    </div>
  )
}

export default PriceMasterDetails