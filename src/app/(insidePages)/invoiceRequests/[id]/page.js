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
import { apiGet, apiPatch, apiPost, apiDelete } from "@/services/apiService";
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

const InvoiceRequestDetails = () => {
  const params = useParams();
  const {id} = params;
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();
  const router = useRouter();
  const pathName = usePathname();
  const {refetch, comments, listComments} = useGetComments(id);

  const updateInvoiceRef = useRef();
  const deleteInvoiceRef = useRef();

  const {data, isFetching, refetch: refetchInvoiceRequestData} = useQuery({
    queryKey: ["allInvoiceRequests", id],
    queryFn: () => apiGet({ url: `/invoiceRequestForm/${id}`})
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

  const invoiceRequestMutation = useMutation({
    mutationFn: () => apiDelete({ url: `/invoiceRequestForm/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Invoice Request deleted successfully"})
      deleteInvoiceRef.current.click();
      router.push("/invoiceRequests")
    })
    .catch(error =>{
      console.log(error.message);
      deleteInvoiceRef.current.click();
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const [commentData, setCommentData] = useState({
    senderId: "",
    receiverId: "",
    resourceId: "",
    resourceUrl: "",
    message: ""
  });

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    deliveryNoteNumber: "",
    actualDeliveryDate: "",
    chasisNumber: "",
    delivery: "",
    payment: "",
    approved: false,
    approvedByGM: false,
    approvedByProductHead: false,
    additionalInformation: "",
  })

  useEffect(() => {
    if (data) {
      const { invoiceNumber, invoiceDate, deliveryNoteNumber, actualDeliveryDate, chasisNumber, delivery, payment, approvedByGM, approvedByProductHead, approved, additionalInformation } = data;
      setFormData(prevState => ({
        ...prevState,
        invoiceNumber: invoiceNumber || "",
        invoiceDate: invoiceDate || "",
        deliveryNoteNumber: deliveryNoteNumber || "",
        actualDeliveryDate: actualDeliveryDate || "",
        chasisNumber: chasisNumber || "",
        delivery: delivery || "",
        payment: payment || "",
        approvedByGM,
        approvedByProductHead,
        approved,
        additionalInformation: additionalInformation || ""
      }))
    }
  }, [data])

  const [errors, setErrors] = useState({})

  const {mutate: updateInvoiceRequest, isLoading: isLoadingInvoiceUpdate} = useMutation({
    mutationFn: () => apiPatch({ url: `/invoiceRequestForm/${id}`, data: formData})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: res.message})
      refetchInvoiceRequestData();
      updateInvoiceRef.current.click();
      return res.data
    })
    .catch(error =>{
      console.log(error);
      updateInvoiceRef.current.click();
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const handleUpdateInvoice = () =>{
    //return console.log(formData);
    updateInvoiceRequest();
  }

  const clearComment = () => {
    setCommentData( prevState => ({
      ...prevState, 
      message: ""
    }))
  }
  
  const queryClient = useQueryClient();
  const commentMutation = useMutation({
    mutationFn: () => apiPost({ url: "/comment", data: commentData })
      .then(res => {
        clearComment();
        console.log(res.data)
        //dispatchMessage({ message: res.message })
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

  const handleChange = (prop) => (event) => {
    if ( prop === "approvedByGM" || prop === "approvedByProductHead" || prop === "approved") {
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

  const handleSubmit = (e)=>{
    e.preventDefault();
    console.log(commentData)
    if(!commentData?.message){
      return
    }
    commentMutation.mutate()
  }

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
        <h4 className="m-0">Invoice Requests</h4>
        <span className="breadcrumb-item ms-3"><a href="/invoiceRequests"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        {userData?.id === data?.employeeId && (!data?.approved) && <a className="btn btn-link text-primary ms-auto" href={`/invoiceRequests/${id}/edit`}>Edit</a>}
        {userData?.staffCadre.includes("admin") && <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteInvoiceRequest">Delete</a>}
      </header>

      <div className="row">
        <div className="col-12 d-flex flex-column align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              

              <div className="d-flex align-items-center mb-4">
                <h5 className="card-title fw-semibold mb-4 opacity-75 me-auto">Invoice Request Details</h5>
                {
                  data?.approved ?
                  <span className=" border border-success text-success-emphasis px-3 py-2 rounded-3">Approved <i className="fa-regular fa-circle-check ms-1"></i></span> :
                  <span className=" border border-muted text-muted px-3 py-2 rounded-2">Pending Approval </span>
                }
              </div>

              {data ?
                <>
                  <DataListItem title="Employee" value={`${data.employee.firstName} ${data.employee.lastName}`} />
                  <DataListItem title="Customer" value={data.customer.companyName} />
                  <DataListItem title="Contact Person Name" value={data.contactPerson.name} />
                  <DataListItem title="Invoice Name" value={data.invoiceName} />
                  <DataListItem title="Address" value={data.address} />
                  <DataListItem title="Contact Office Telephone" value={data.contactOfficeTelephone} />
                  <DataListItem title="Email Address" value={data.emailAddress} />
                  <DataListItem title="Sales Through" value={data.salesThru} />
                  <DataListItem title="Industry" value={data.industry} />
                  <DataListItem title="Brand" value={data.brand.name} />
                  <DataListItem title="Product" value={data.product.name} />
                  <DataListItem title="Vehicle Model Details" value={data.vehicleModelDetails} />
                  <DataListItem title="Quantity" value={data.quantity} />
                  <DataListItem title="Color" value={data.color} />
                  <DataListItem title="Total Invoice Value Per Vehicle" value={formatAsCurrency(data.totalInvoiceValuePerVehicle)} />
                  <DataListItem title="Type of Body Building" value={data.typeOfBodyBuilding} />
                  <DataListItem title="VAT Deduction" value={data.vatDeduction ? "Yes" : "No"} />
                  <DataListItem title="WHT Deduction" value={data.whtDeduction? "Yes" : "No"} />
                  <DataListItem title="Registration" value={data.registration} />
                  <DataListItem title="Rebate Receiver" value={data.rebateReceiver} />
                  <DataListItem title="Rebate Amount" value={formatAsCurrency(data.rebateAmount)} />
                  <DataListItem title="Refund To Customer" value={formatAsCurrency(data.refundToCustomer)} />
                  <DataListItem title="Relationship With Transaction" value={data.relationshipWithTransaction} />
                  <DataListItem title="Expected Delivery Date" value={moment(data.expectedDeliveryDate).format('ll')} />
                  <DataListItem title="Delivery Location" value={data.deliveryLocation} />
                  <DataListItem title="Payment Type" value={data.paymentType} />
                  <DataListItem title="Delivery Location" value={data.deliveryLocation} />
                  <DataListItem title="Delivered By" value={data.deliveredBy} />

                  <DataListItem title="Payment Status" value={data.paymentStatus} />
                  <DataListItem title="Bank Name" value={data.bankName} />
                  <DataListItem title="Bank Account Name" value={data.bankAccountName} />
                  <DataListItem title="Account Number" value={data.accountNumber} />
                  <DataListItem title="Amount Paid" value={formatAsCurrency(data.amountPaid)} />
                  <DataListItem title="Date Of Payment" value={moment(data.dateOfPayment).format('ll') || "---"} />
                  <DataListItem title="LPO Number" value={data.lpoNumber} />
                  <DataListItem title="Payment Due Date" value={moment(data.paymentDueDate).format('ll')} />
                  <DataListItem title="Other Payment Details" value={data.otherPaymentDetails} />
                  <DataListItem title="Invoice Number" value={data.invoiceNumber} />

                  <DataListItem title="Invoice Date" value={moment(data.invoiceDate).format('ll')} />
                  <DataListItem title="Delivery Note Number" value={data.deliveryNoteNumber} />
                  <DataListItem title="Actual Delivery Date" value={moment(data.actualDeliveryDate).format('ll')} />
                  <DataListItem title="Chasis Number" value={data.chasisNumber} />
                  <DataListItem title="Delivery" value={data.delivery} />
                  <DataListItem title="Payment" value={data.payment} />
                  <DataListItem title="Approved" value={data.approved ? "Yes" : "No"} />
                  <DataListItem title="Approved By GM" value={data.approvedByGM ? "Yes" : "No"} />
                  <DataListItem title="Approved By Product Head" value={data.approvedByProductHead ? "Yes" : "No"} />
                  <DataListItem title="Additional Information" value={data.additionalInformation} />
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />

              }
            </div>
          </div>

          {(userData?.staffCadre?.includes("admin")) && 
          <div className="card w-100 p-3">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}> 
              <form>
                <div className="mb-3">
                  <label htmlFor="invoiceNumber" className="form-label">Invoice Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.invoiceNumber} onChange={handleChange("invoiceNumber")} id="invoiceNumber" />
                  <span className='text-danger font-monospace small'>{errors.invoiceNumber}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="invoiceDate" className="form-label">Invoice Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control shadow-none" value={formData.invoiceDate} onChange={handleChange("invoiceDate")} id="invoiceDate" />
                  <span className='text-danger font-monospace small'>{errors.invoiceDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="deliveryNoteNumber" className="form-label">Delivery Note Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.deliveryNoteNumber} onChange={handleChange("deliveryNoteNumber")} id="deliveryNoteNumber" />
                  <span className='text-danger font-monospace small'>{errors.deliveryNoteNumber}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="actualDeliveryDate" className="form-label">Actual Delivery Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control shadow-none" value={formData.actualDeliveryDate} onChange={handleChange("actualDeliveryDate")} id="actualDeliveryDate" />
                  <span className='text-danger font-monospace small'>{errors.actualDeliveryDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="chasisNumber" className="form-label">Chasis Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea className="form-control shadow-none" rows={4} value={formData.chasisNumber} onChange={handleChange("chasisNumber")} id="chasisNumber" ></textarea>
                  <span className='text-danger font-monospace small'>{errors.chasisNumber}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="delivery" className="form-label">Delivery</label>
                  <textarea className="form-control shadow-none" value={formData.delivery} onChange={handleChange("delivery")} id="delivery" ></textarea>
                  <span className='text-danger font-monospace small'>{errors.delivery}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="payment" className="form-label">Payment</label>
                  <textarea className="form-control shadow-none" value={formData.payment} onChange={handleChange("payment")} id="payment" ></textarea>
                  <span className='text-danger font-monospace small'>{errors.payment}</span>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" value={formData.approvedByGM} checked={formData.approvedByGM} onChange={handleChange("approvedByGM")} id="approvedByGM" />
                  <label className="form-check-label" htmlFor="approvedByGM">
                    Approved By GM
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" value={formData.approvedByProductHead} checked={formData.approvedByProductHead} onChange={handleChange("approvedByProductHead")} id="approvedByProductHead" />
                  <label className="form-check-label" htmlFor="approvedByProductHead">
                    Approved By Product Head
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" value={formData.approved} checked={formData.approved} onChange={handleChange("approved")} id="approved" />
                  <label className="form-check-label" htmlFor="approved">
                    Approved
                  </label>
                  <div className='form-text text-warning-emphasis'> Check this box to approve invoice request</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="additionalInformation" className="form-label">Additional Information</label>
                  <textarea className="form-control shadow-none" rows={4} value={formData.additionalInformation} onChange={handleChange("additionalInformation")} id="additionalInformation" ></textarea>
                  <span className='text-danger font-monospace small'>{errors.additionalInformation}</span>
                </div>

                {/* <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoadingInvoiceUpdate} onClick={handleUpdateInvoice}>{isLoadingInvoiceUpdate ? "Loading..." : "Approve"}</button> */}
                <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#approveModal">Update</button>
              </form>
            </div>
          </div>}

          <div className="card w-100 p-3">
            <h5 className="mb-4">Comments</h5>
            <ul className="list-unstyled">
              {listComments()}
            </ul>
            <div className="mb-3 d-flex">
              <textarea rows={3} className="form-control" id="location" value={commentData?.message} placeholder="Make Your Comments here" onChange={handleChangeComment}></textarea>
              <div className="d-flex align-items-center">
                <button className="btn nav-icon-hover" disabled={commentMutation?.isLoading} onClick={handleSubmit}><i className="fa-solid fa-paper-plane h1"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userData?.staffCadre?.includes("admin") && <ConfirmationModal title={`Update Invoice Request`} message={`Are you sure your want to update this Invoice Request`} isLoading={isLoadingInvoiceUpdate} onSubmit={handleUpdateInvoice} id="approveModal" closeButtonRef={updateInvoiceRef} />}

      <ConfirmationModal title="Delete Invoice Request" message="Are you sure your want to delete this invoice request? This action cannot be reversed." isLoading={invoiceRequestMutation.isLoading} onSubmit={invoiceRequestMutation.mutate} id="deleteInvoiceRequest" btnColor="danger" closeButtonRef={deleteInvoiceRef} />
    </div>
  )
}

export default InvoiceRequestDetails