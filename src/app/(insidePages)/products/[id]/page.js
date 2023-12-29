"use client"

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/services/apiService";
import { useParams, useRouter } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import formatAsCurrency from "@/services/formatAsCurrency";
import moment from "moment";
import useGetUserData from "@/hooks/useGetUserData";
import ConfirmationModal from "@/components/confirmationModal";
import { Modal, ClickAwayListener } from "@mui/material";
import { useState, useRef } from "react";


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

const ProductDetails = () => {
  const params = useParams();
  const {id} = params;
  const router = useRouter();
  const closeDeleteProductModal = useRef();
  console.log(id);
  const {userData} = useGetUserData();
  const dispatchMessage = useDispatchMessage();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {data, isFetching, refetch: refetchProductData} = useQuery({
    queryKey: ["allProducts", id],
    queryFn: () => apiGet({ url: `/product/${id}`})
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

  const disableProduct = useMutation({
    mutationFn: () => apiPatch({ url: `/product/${id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Product disabled successfully"})
      refetchProductData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const reActivateProduct = useMutation({
    mutationFn: () => apiPatch({ url: `/product/${id}`, data: {isActive: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Product activated successfully"})
      refetchProductData()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const deleteProduct = useMutation({
    mutationFn: () => apiDelete({ url: `/product/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Product deleted successfully"})
      closeDeleteProductModal.current.click();
      router.push("/companies")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteProductModal.current.click();
    })
  }) 

  const listProductImages = () => {
    if(data?.images){
      return data?.images.map(image => {
        return <img key={image} src={image} onClick={handleOpen} style={{cursor: "pointer"}} height="150px" className="p-3 rounded-3" alt="Product Image" />
      })
    }
  }

  const listCarouselImages = () =>{
    if(data?.images){
      return data?.images.map ((image, index) =>{
        return (
          <div key={image} className={`carousel-item ${index === 0 && "active"}`}>
            <img src={image} className="d-block w-100" alt="carousel image" />
          </div>
        )
      })
    }
  }

  const listCarouselButtons = () =>{
    if(data?.images){
      return data?.images.map ((image, index) =>{
        return(
          <button
            key={image}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={index}
            className={`${index === 0 && "active"}`}
            aria-current={`${index === 0 && "true"}`}
            aria-label={`Slide ${index}`}
          />
        )
      })
    }
  }

    const deriveProductStatus = (priceData)=>{
      if(priceData){
        let {unitPrice, promoPrice, validTill, anyPromo} = priceData
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
  }

  const listBrochures = () =>{
    return data.brochures.map(file => {
      return <li className=" my-3" key={file}> <span>{file.slice(56, file.length).replaceAll("%20", "-")}</span> <br /> <a className="btn btn-link px-0" href={file} target="_blank">download</a></li>
    })
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Product</h4>
        <span className="breadcrumb-item ms-3"><a href="/products"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        {userData?.staffCadre?.includes("admin") &&<a className="btn btn-link text-primary ms-auto" href={`/products/${id}/edit`}>Edit</a>}
        {userData?.staffCadre?.includes("admin") &&<a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteProduct">Delete</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <header className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Product Details</h5>
                
                {userData?.staffCadre.includes("admin") && <>
                {data?.isActive ?
                  <button className="btn btn-muted ms-auto" disabled={disableProduct.isLoading} onClick={disableProduct.mutate}>
                    {disableProduct?.isLoading ? "Loading..." : "Disable"}
                  </button> :
                  <button className="btn btn-success ms-auto" disabled={reActivateProduct.isLoading} onClick={reActivateProduct.mutate}>
                    {reActivateProduct?.isLoading ? "Loading..." : "Activate"}
                  </button>}
                </>}
                
              </header>

              {data ?
                <>
                  <DataListItem title="Product Name" value={data.name} />
                  {userData?.staffCadre?.includes("admin") && <DataListItem title="Product Code" value={data.code} />}
                  <DataListItem title="Brand" value={data.brand.name} />
                  <DataListItem title="Price" value={formatAsCurrency(deriveProductStatus(data.price)?.price || "")} />
                  <DataListItem title="Description" value={data.description} />
                  <DataListItem title="Specifications" value={data.specifications} />
                  <DataListItem title="Is Active?" value={data.isActive ? "Yes" : "No"} />
                  <div className="mb-3 d-flex flex-column">
                    <h6 className="m-0 me-3">Product Images</h6>
                    <figure>
                      {listProductImages()}
                    </figure>
                  </div>

                  <div className="mb-3 d-flex flex-column">
                    <h6 className="m-0 me-3 mb-2">Brochures</h6>
                    <ul>
                      {listBrochures()}
                    </ul>
                  </div>
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />
              }
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="row d-flex h-100">
          <ClickAwayListener onClickAway={handleClose}>
            <div className="col-12 col-md-8 col-lg-6 m-auto">
              <div id="carouselExampleIndicators" className="carousel slide">
                <div className="carousel-indicators">
                  {listCarouselButtons()}
                </div>
                <div className="carousel-inner">
                  {listCarouselImages()}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>

            </div>
          </ClickAwayListener>
          
        </div>
      </Modal>


      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Delete Product" message="Are you sure your want to delete this product?" isLoading={deleteProduct.isLoading} onSubmit={deleteProduct.mutate} id="deleteProduct" btnColor="danger" closeButtonRef={closeDeleteProductModal} />}
    </div>
  )
}

export default ProductDetails