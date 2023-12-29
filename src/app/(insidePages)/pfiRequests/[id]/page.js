"use client"

import { useParams, useRouter } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { useSelector } from "react-redux";
import { getDecodedToken } from "@/services/localStorageService";
import { usePathname } from "next/navigation";
import useGetComments from "@/hooks/useGetComments";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/apiService";
import ConfirmationModal from '@/components/confirmationModal';
import moment from 'moment';
import useGetUserData from "@/hooks/useGetUserData";
import formatAsCurrency from '@/services/formatAsCurrency';


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

const PfiRequestDetails = () => {
  const params = useParams();
  const router = useRouter();
  const {id} = params;
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();
  const pathName = usePathname();
  const {refetch, listComments} = useGetComments(id);

  const approvePfiModalRef = useRef();
  const lockPfiModalRef = useRef();
  const unlockPfiModalRef = useRef();
  const requestEditPfiModalRef = useRef();
  const deletePfiModalRef = useRef();

  const {data, refetch: refreshPfiDetails} = useQuery({
    queryKey: ["allPfiRequests", id],
    queryFn: () => apiGet({ url: `/pfiRequestForm/${id}`})
    .then(res =>{
      console.log(res.data)
      //dispatchMessage({ message: res.message})
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

  const [commentData, setCommentData] = useState({
    senderId: "",
    receiverId: "",
    resourceId: "",
    resourceUrl: "",
    message: ""
  });

  const [formData, setFormData] = useState({
    pfiReferenceNumber: "",
    pfiDate: "",
    approved: false
  });

  useEffect(() => {
    if (data) {
      const { pfiReferenceNumber, pfiDate } = data;
      setFormData(prevState => ({
        ...prevState,
        pfiReferenceNumber: pfiReferenceNumber || "",
        pfiDate: pfiDate || "",
        approved: data.approved
      }))
    }
  }, [data])

  const [errors, setErrors] = useState({})

  const clearComment = () => {
    setCommentData( prevState => ({
      ...prevState, 
      message: ""
    }))
  }
  
  const commentMutation = useMutation({
    mutationFn: () => apiPost({ url: "/comment", data: commentData })
      .then(res => {
        clearComment();
        console.log(res.data)
        refetch()
        
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleChangeComment =  (event) => {
    setCommentData(prevState => ({
      ...prevState,
      message: event.target.value
    }))
  }

  const handleSubmitComment = (e)=>{
    e.preventDefault();
    // return console.log(commentData)
    if(!commentData?.message){
      return
    }
    commentMutation.mutate()
  }

  const handleChange = (prop) => (event) => {
    if (prop === "approved") {
      setFormData(prevState => ({
        ...prevState,
        [prop]: !prevState[prop]
      }))
      return
    }
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const { isLoading: isLoadingApprovePfi, mutate: approvePfiRequest } = useMutation({
    mutationFn: () => apiPatch({ url: `/pfiRequestForm/${data.id}`, data: formData })
      .then(res => {
        console.log(res.data)
        refreshPfiDetails()
        approvePfiModalRef.current.click();
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        approvePfiModalRef.current.click();
      }),
  })

  const handleApprovePfiRequest = () =>{
    if((!formData.pfiDate || !formData.pfiReferenceNumber) && formData.approved){
      return dispatchMessage({ severity: "error", message: `Fill in Pfi Reference Number and Pfi Date`})
    }
    console.log(formData)
    approvePfiRequest();
  }

  const { isLoading: isLoadingLockPfi, mutate: lockPfiRequest } = useMutation({
    mutationFn: () => apiPatch({ url: `/pfiRequestForm/${data.id}`, data: {locked: true} })
      .then(res => {
        console.log(res.data)
        refreshPfiDetails();
        lockPfiModalRef.current.click();
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        lockPfiModalRef.current.click();
      }),
  })


  const { isLoading: isRequestingEdit, mutate: requestForEdit } = useMutation({
    mutationFn: () => apiPost({ url: `/notification`, data: {staffCadre: "admin", resourceId: data?.id, resourceUrl: pathName, title: "Pfi Request", message: `${userData.firstName} ${userData.lastName} is requesting to edit Pfi Request`} })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: "Request has been sent to admin" })
        requestEditPfiModalRef.current.click()
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        requestEditPfiModalRef.current.click()
      }),
  })

  const { isLoading: isUnlockingPfi, mutate: unLockPfiRequest } = useMutation({
    mutationFn: () => apiPatch({ url: `/pfiRequestForm/${data?.id}`, data: {locked: false, approved: false} })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: "Pfi has been unlocked" });
        refreshPfiDetails();
        unlockPfiModalRef.current.click()
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        unlockPfiModalRef.current.click()
      }),
  })


  const {mutate: deletePfi, isLoading: isDeletingPfi} = useMutation({
    mutationFn: () => apiDelete({ url: `/pfiRequestForm/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Pfi Request deleted successfully"})
      deletePfiModalRef.current.click();
      router.push("/pfiRequests")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      deletePfiModalRef.current.click();
    })
  }) 

 

  useEffect(()=>{
    setCommentData( prevState =>({
      ...prevState,
      senderId: userData?.id,
      receiverId: data?.employeeId,
      resourceId: id,
      resourceUrl: pathName
    }))
  },[data, userData])


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Pfi Requests</h4>
        <span className="breadcrumb-item ms-3 me-auto"><a href="/pfiRequests"><i className="fa-solid fa-arrow-left"></i> Back</a></span>
        
        {(!data?.locked && userData?.id === data?.employeeId) && <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#lockItModal">Lock It <i className="fa-solid fa-lock ms-1"></i></button>}
        {(data?.locked && userData?.staffCadre?.includes("admin")) && <button className="btn btn-outline-primary ms-2"  data-bs-toggle="modal" data-bs-target="#unlockItModal"> {isUnlockingPfi ? "Loading..." : "Unlock It"}<i className="fa-solid fa-lock-open ms-1"></i></button>}
        {(!data?.locked && userData?.id === data?.employeeId) && <a className={`btn btn-link text-primary`} href={`/pfiRequests/${id}/edit`}>Edit</a>}
        {(data?.locked  && userData?.id === data?.employeeId) && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#requestEditModal">Request Edit</button>}
        {(userData?.staffCadre.includes("admin")) && <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deletePfiRequest">Delete</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex flex-column align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <div className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold mb-0 opacity-75 me-auto">Pfi Request Details</h5>
                {
                  data?.locked &&
                  <span className=" border border-primary text-primary px-3 py-2 rounded-3 me-2">Locked <i className="fa-solid fa-lock ms-1"></i></span>
                }
                {
                  data?.approved ?
                  <span className=" border border-success text-success-emphasis px-3 py-2 rounded-3">Approved <i className="fa-regular fa-circle-check ms-1"></i></span> :
                  <span className=" border border-muted text-muted px-3 py-2 rounded-2">Pending Approval </span>
                }
              </div>

              {data ?
                <>
                  {userData?.staffCadre?.includes("admin") &&
                  <DataListItem title="Employee" value={`${data.employee.firstName} ${data.employee.lastName}`} />}
                  <DataListItem title="Customer" value={data.customer.companyName} />
                  <DataListItem title="Customer Address" value={data.customer.address} />
                  <DataListItem title="Contact Person Name" value={data.contactPerson.name} />
                  <DataListItem title="Phone Number" value={data.contactPerson.phoneNumber} />
                  <DataListItem title="Email" value={data.contactPerson.email} />
                  <DataListItem title="Brand" value={data.brand.name} />
                  <DataListItem title="Product" value={data.product.name} />
                  <DataListItem title="Vehicle Details" value={data.vehicleDetails} />
                  <DataListItem title="Quantity" value={data.quantity} />
                  <DataListItem title="Body Type Description" value={data.bodyTypeDescription} />
                  <DataListItem title="Vehicle Service Details" value={data.vehicleServiceDetails} />
                  <DataListItem title="Special Fitment Details" value={data.specialFitmentDetails} />
                  <DataListItem title="Cost For Special Fitment" value={formatAsCurrency(data.costForSpecialFitment)} />
                  <DataListItem title="Price Per Vehicle (inclusive of VAT)" value={formatAsCurrency(data.pricePerVehicle)} />
                  <DataListItem title="Discount" value={data.discount} />
                  <DataListItem title="VAT Deduction" value={data.vatDeduction ? "Yes" : "No"} />
                  <DataListItem title="WHT Deduction" value={data.whtDeduction? "Yes" : "No"} />
                  <DataListItem title="Registration" value={data.registration? "Yes" : "No"} />
                  <DataListItem title="Refund/Rebate Amount" value={formatAsCurrency(data.refundRebateAmount)} />
                  <DataListItem title="Refund/Rebate Recipient" value={data.refundRebateRecipient} />
                  <DataListItem title="Designation" value={data.designation} />
                  <DataListItem title="Relationship With Transaction" value={data.relationshipWithTransaction} />
                  <DataListItem title="Estimated Order Closing Time (No of days)" value={data.estimatedOrderClosingTime} />
                  <DataListItem title="Payment Type" value={data.paymentType} />
                  <DataListItem title="Delivery Location" value={data.deliveryLocation} />
                  <DataListItem title="Approved" value={data.approved ? "Yes" : "No"} />
                  <DataListItem title="Locked" value={data.locked ? "Yes" : "No"} />
                  <DataListItem title="Pfi Reference Number" value={data.pfiReferenceNumber} />
                  <DataListItem title="Pfi Date" value={moment(new Date(data.pfiDate)).format('ll')} />
                  <DataListItem title="Additional Information" value={data.additionalInformation} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />

              }
            </div>
          </div>

          {(userData?.staffCadre?.includes("admin")) && <div className="card w-100 p-3">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}> 
              <form>
                <div className="mb-3">
                  <label htmlFor="pfiReferenceNumber" className="form-label">Pfi Reference Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.pfiReferenceNumber} onChange={handleChange("pfiReferenceNumber")} id="pfiReferenceNumber" />
                  <span className='text-danger font-monospace small'>{errors.pfiReferenceNumber}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="pfiDate" className="form-label">Pfi Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control shadow-none" value={formData.pfiDate} onChange={handleChange("pfiDate")} id="pfiDate" />
                  <span className='text-danger font-monospace small'>{errors.pfiDate}</span>
                </div>

                <div className="form-check my-3">
                  <input className="form-check-input shadow-none" type="checkbox" value={formData.approved} checked={formData.approved} onChange={handleChange("approved")} id="approved" />
                  <label className="form-check-label" htmlFor="approved">
                    Approve
                  </label>
                  <div className='form-text text-warning-emphasis'> Check this box to approve Pfi Request</div>
                </div>

                {(data?.locked) && <button className="btn btn-outline-primary" type='button' data-bs-toggle="modal" data-bs-target="#approveModal">Update</button>}
              </form>
            </div>
          </div>}


          <div className="card w-100 p-3">
            <h5 className="mb-4">Comments</h5>
            <ul className="list-unstyled">
              {listComments()}
            </ul>
            <div className="mb-3 d-flex">
              <textarea rows={3} className="form-control" id="location" value={commentData.message} placeholder="Make Your Comments here" onChange={handleChangeComment}></textarea>
              <div className="d-flex align-items-center">
                <button className="btn nav-icon-hover" disabled={commentMutation.isLoading} onClick={handleSubmitComment}><i className="fa-solid fa-paper-plane h1"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Approve Pfi Request" message="Are you sure your want to approve this Pfi Request" isLoading={isLoadingApprovePfi} onSubmit={handleApprovePfiRequest} id="approveModal" closeButtonRef={approvePfiModalRef} />}

      {userData?.staffCadre?.includes("salesPerson") && <ConfirmationModal title="Lock Pfi Request" message="After Locking Pfi Request, Pfi will be sent to admin and you won't be able to make any changes. Do you still want to proceed?" isLoading={isLoadingLockPfi} onSubmit={lockPfiRequest} id="lockItModal" closeButtonRef={lockPfiModalRef}  />}

      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title="Unlock Pfi Request" message="After Unlocking Pfi Request, Employee will be able to make changes. Do you still want to proceed?" isLoading={isUnlockingPfi} onSubmit={unLockPfiRequest} id="unlockItModal"  closeButtonRef={unlockPfiModalRef}  />}

      {userData?.staffCadre?.includes("salesPerson") && <ConfirmationModal title="Request to Edit Pfi Request" message="A notification will be sent to the admin to unlock the Pfi 
      Request to enable editing. Do you still want to proceed?" isLoading={isRequestingEdit} onSubmit={requestForEdit} id="requestEditModal" closeButtonRef={requestEditPfiModalRef}  />}

      <ConfirmationModal title="Delete Pfi Request" message="Are you sure your want to delete this Pfi Request? This action cannot be reversed." isLoading={isDeletingPfi} onSubmit={deletePfi} id="deletePfiRequest" btnColor="danger" closeButtonRef={deletePfiModalRef}  />
    </div>
  )
}

export default PfiRequestDetails