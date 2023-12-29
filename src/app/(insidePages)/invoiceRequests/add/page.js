"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import formatAsCurrency from '@/services/formatAsCurrency';
import { useRouter } from "next/navigation";
import useGetUserData from "@/hooks/useGetUserData";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import formValidator from "@/services/validation";
import { setRef } from "@mui/material";
import AppAutoComplete from "@/components/autoComplete";




const AddInvoiceRequest = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const { userData } = useGetUserData();
  const [formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    contactPersonId: "",
    customerType: "",
    pfiRequestFormId: "",
    invoiceName: "",
    address: "",
    contactOfficeTelephone: "",
    emailAddress: "",
    salesThru: "",
    industry: "",
    brandId: "",
    productId: "",
    vehicleModelDetails: "",
    quantity: "",
    color: "",
    totalInvoiceValuePerVehicle: "",
    typeOfBodyBuilding: "",
    bodyFabricatorName: "",
    registration: "",
    whtDeduction: false,
    vatDeduction: false,
    rebateAmount: "",
    refundToCustomer: "",
    servicePackageDetails: "",
    rebateReceiver: "",
    relationshipWithTransaction: "",
    expectedDeliveryDate: "",
    deliveryLocation: "",
    deliveredBy: "",
    paymentStatus: "",
    bankName: "",
    bankAccountName: "",
    accountNumber: "",
    amountPaid: "",
    dateOfPayment: "",
    lpoNumber: "",
    paymentDueDate: "",
    otherPaymentDetails: "",
    additionalInformation: ""
  })

  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(options[0]);
  const [inputValue, setInputValue] = useState('');
  const [refund, setRefund] = useState(false);


  const [errors, setErrors] = useState({})

  const brandsQuery = useQuery({
    queryKey: ["allBrands"],
    queryFn: () => apiGet({ url: "/brand?isActive=true" })
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
      retry: 3
  })

  const productQuery = useQuery({
    queryKey: ["allProducts"],
    queryFn: () => apiGet({ url: `/product?isActive=true` })
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
      retry: 3
  })

  const pfiRequestQuery = useQuery({
    queryKey: ["allPfiRequests"],
    queryFn: () => apiGet({ url: `/pfiRequestForm?approved=approved&employeeId=${userData?.id}` })
      .then(res => {
        console.log(res)
        generatePfiOptions(res.data)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      enabled: false
  })

  useEffect(()=>{
    if(userData?.id){
      pfiRequestQuery.refetch();
    }
  }, [userData?.id])


  const generatePfiOptions = (data = []) =>{
    let options = []
    if(data.length > 0){
      console.log(data)
      data.forEach( pfi =>{
        options.push({id: pfi.id, label: `${pfi.pfiReferenceNumber}--${pfi.customer.companyName}--${pfi.contactPersonName}`})
      })
    } 
    console.log(options)
    setOptions(options)
  }

  const listBrandOptions = () => {
    if (brandsQuery?.data?.length) {
      return brandsQuery.data.map(brand =>
        <option key={brand.id} value={brand.id}>{brand.name}</option>
      )
    }
  }

  const listProductOptions = () => {
    let products = productQuery?.data;
    if (formData.brandId) {
      products = products.filter(item => item.brandId === formData.brandId)
    }
    if (products.length) {
      return products.map(product =>
        <option key={product.id} value={product.id}>{product.name}</option>
      )
    }
  }


  useEffect(() => {
    if (formData.pfiRequestFormId) {
      let { employeeId, customerId, contactPersonId, companyName, companyAddress, phoneNumber, emailAddress, brandId, productId, vehicleDetails, quantity, pricePerVehicle, vatDeduction, whtDeduction, refundRebateAmount, refundRebateRecipient, relationshipWithTransaction, deliveryLocation } = getPfiRequestData();

      setFormData(prevState => ({
        ...prevState,
        employeeId, customerId, contactPersonId, invoiceName: companyName, address: companyAddress, contactOfficeTelephone: phoneNumber, emailAddress, brandId, productId, vehicleModelDetails: vehicleDetails, quantity, totalInvoiceValuePerVehicle: pricePerVehicle, vatDeduction, whtDeduction, rebateAmount: refundRebateAmount, rebateReceiver: refundRebateRecipient, relationshipWithTransaction, deliveryLocation
      }))
    }

  }, [formData.pfiRequestFormId])

  useEffect(()=>{
    if(formData.paymentStatus === "Cash"){
      setFormData( prevState => ({
        ...prevState,
        lpoNumber: "",
        paymentDueDate: "",
        otherPaymentDetails: ""
      }))
    }
    if(formData.paymentStatus === "Credit"){
      setFormData( prevState => ({
        ...prevState,
        bankName: "",
        bankAccountName: "",
        amountPaid: "",
        accountNumber: "",
        dateOfPayment: ""
      }))
    }
  }, [formData.paymentStatus])

  const getPfiRequestData = () => {
    let id = formData.pfiRequestFormId
    let data = {}
    if (!pfiRequestQuery.isLoading) {
      pfiRequestQuery.data.forEach(pfiRequest => {
        if (pfiRequest.id === id) {
          data = pfiRequest
        }
      })
    }
    return data
  }

  const handleChange = (prop) => (event) => {
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    let numberOnlyList = ["amountPaid", "accountNumber", "rebateAmount", "refundToCustomer", "totalInvoiceValuePerVehicle", "quantity" ]
    if(numberOnlyList.includes(prop) && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }

    if ( prop === "vatDeduction" || prop === "whtDeduction") {
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


  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: () => apiPost({ url: "/invoiceRequestForm", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allInvoiceRequests"])
        router.push("/invoiceRequests")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData)
    let errors = formValidator(["customerType", "pfiRequestFormId", "invoiceName", "contactOfficeTelephone", "emailAddress", "salesThru", "industry", "industry", "brandId", "productId", "vehicleModelDetails", "quantity", "color", "totalInvoiceValuePerVehicle", "deliveredBy", "paymentStatus"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are missing" })
      return setErrors(errors);
    }
    mutate()
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Invoice Requests</h4>
        <span className="breadcrumb-item ms-3"><a href="/companies"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Invoice Request</h5>
              <form>

                <div className="pb-3">
                  <label htmlFor="pfiRequestFormId" className="form-label">Pfi Reference Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <AppAutoComplete options={options} handleClickOption={(id)=>{
                    setFormData( prevState =>({
                      ...prevState,
                      pfiRequestFormId: id
                    }))
                  }} placeholder="Select pfi reference number"/>
                  <span className='text-danger font-monospace small'>{errors.pfiRequestFormId}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="customerType" className="form-label">Customer Type (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="customerType" onChange={handleChange("customerType")} value={formData.customerType} aria-label="Default select example">
                    <option value="">Select Customer Type</option>
                    <option value="existing customer">Existing Customer</option>
                    <option value="new customer">New Customer</option>
                  </select>
                  <span className='text-danger font-monospace small'>{errors.customerType}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="invoiceName" className="form-label">Invoice Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" value={formData.invoiceName} onChange={handleChange("invoiceName")} id="invoiceName" placeholder="Invoice Name" />
                  <span className='text-danger font-monospace small'>{errors.invoiceName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea className="form-control shadow-none" value={formData.address} onChange={handleChange("address")} id="address" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.address}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="contactOfficeTelephone" className="form-label">Contact Office Telephone (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="tel" className="form-control shadow-none" value={formData.contactOfficeTelephone} onChange={handleChange("contactOfficeTelephone")} id="contactOfficeTelephone" placeholder="Phone Number" />
                  <span className='text-danger font-monospace small'>{errors.contactOfficeTelephone}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label">Email Address (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.emailAddress} onChange={handleChange("emailAddress")} id="emailAddress" placeholder="Email Address" />
                  <span className='text-danger font-monospace small'>{errors.emailAddress}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="salesThru" className="form-label">Sales Through (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.salesThru} onChange={handleChange("salesThru")} id="salesThru" aria-label="Default select example">
                      <option value="">Select Sales Through</option>
                      <option value="KA">KA</option>
                      <option value="Retail">Retail</option>
                      <option value="Agent">Agent</option>
                      <option value="Govt">Govt</option>
                      <option value="Fleet">Fleet</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.salesThru}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="industry" className="form-label">Industry (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.industry} onChange={handleChange("industry")} id="industry" aria-label="Default select example">
                      <option value="">Select Industry</option>
                      <option value="Agric">Agric</option>
                      <option value="Construction">Construction</option>
                      <option value="Distribution">Distribution</option>
                      <option value="Food & Bevereges">Food & Bevereges</option>
                      <option value="Government">Government</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Oil & Gas">Oil & Gas</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.industry}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="brandId" className="form-label">Vehicle Brand (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.brandId} onChange={handleChange("brandId")} id="brandId" aria-label="Default select example">
                      <option value="">Select Brand</option>
                      {!brandsQuery.isLoading && listBrandOptions()}
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.brandId}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="productId" className="form-label">Product (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.productId} onChange={handleChange("productId")} id="productId" aria-label="Default select example">
                      <option value="">Select Product</option>
                      {!productQuery.isLoading && listProductOptions()}
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.productId}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="vehicleModelDetails" className="form-label">Vehicle Model Specific Details (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea className="form-control shadow-none" value={formData.vehicleModelDetails} onChange={handleChange("vehicleModelDetails")} id="vehicleModelDetails" rows={5}></textarea>
                  <span className='text-danger font-monospace small'>{errors.vehicleModelDetails}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Quantity  (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.quantity} onChange={handleChange("quantity")} id="quantity" placeholder="Quantity of Products" />
                  <span className='text-danger font-monospace small'>{errors.quantity}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="color" className="form-label">Colour (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.color} onChange={handleChange("color")} id="color" placeholder="Color of Vehicles" />
                  <span className='text-danger font-monospace small'>{errors.color}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="totalInvoiceValuePerVehicle" className="form-label">Total Invoice Value Per Vehicle (<span className='fst-italic text-warning'>required</span>) <span className='ms-3 fw-bold'>{formatAsCurrency(formData.totalInvoiceValuePerVehicle)}</span></label>
                  <input type="text" className="form-control shadow-none" value={formData.totalInvoiceValuePerVehicle} onChange={handleChange("totalInvoiceValuePerVehicle")} id="totalInvoiceValuePerVehicle" placeholder="Price Per Vehicle" />
                  <span className='text-danger font-monospace small'>{errors.totalInvoiceValuePerVehicle}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="typeOfBodyBuilding" className="form-label">Type of Body Building</label>
                  <textarea className="form-control shadow-none" value={formData.typeOfBodyBuilding} onChange={handleChange("typeOfBodyBuilding")} id="typeOfBodyBuilding" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.typeOfBodyBuilding}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="bodyFabricatorName" className="form-label">Body Fabricator Name</label>
                  <textarea className="form-control shadow-none" value={formData.bodyFabricatorName} onChange={handleChange("bodyFabricatorName")} id="bodyFabricatorName" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.bodyFabricatorName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="registration" className="form-label">Registration</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.registration} onChange={handleChange("registration")} id="registration" aria-label="Default select example">
                      <option value="">Select Registration Type</option>
                      <option value="None">None</option>
                      <option value="Private">Private</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.registration}</span>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" checked={formData.vatDeduction} onChange={handleChange("vatDeduction")} id="vatDeduction" />
                  <label className="form-check-label" htmlFor="vatDeduction">
                    VAT Deduction
                  </label>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" checked={formData.whtDeduction} onChange={handleChange("whtDeduction")} id="whtDeduction" />
                  <label className="form-check-label" htmlFor="whtDeduction">
                    WHT Deduction
                  </label>
                </div>
                
                <div className="form-check mb-3">
                  <input className="form-check-input shadow-none" type="checkbox" checked={refund} onChange={()=>setRefund( prevState => !prevState)} id="refund" />
                  <label className="form-check-label" htmlFor="refund">
                    Refund
                  </label>
                </div>


                {refund &&
                  <>
                    <div className="mb-3">
                      <label htmlFor="rebateAmount" className="form-label">Rebate Amount <span className='ms-3 fw-bold'>{formatAsCurrency(formData.rebateAmount)}</span></label>
                      <input type="text" className="form-control shadow-none" value={formData.rebateAmount} onChange={handleChange("rebateAmount")} id="rebateAmount" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="refundToCustomer" className="form-label">Refund to Customer <span className='ms-3 fw-bold'>{formatAsCurrency(formData.refundToCustomer)}</span></label>
                      <input type="text" className="form-control shadow-none" value={formData.refundToCustomer} onChange={handleChange("refundToCustomer")} id="refundToCustomer" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="rebateReceiver" className="form-label">Rebate Receiver</label>
                      <input type="text" className="form-control shadow-none" value={formData.rebateReceiver} onChange={handleChange("rebateReceiver")} id="rebateReceiver" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="relationshipWithTransaction" className="form-label">Relationship with transaction (if rebate receiver is not working in buying company)</label>
                      <input type="text" className="form-control shadow-none" value={formData.relationshipWithTransaction} onChange={handleChange("relationshipWithTransaction")} id="relationshipWithTransaction" placeholder="Relationship with Transaction" />
                    </div>
                  </>

                }
                

                <div className="mb-3">
                  <label htmlFor="servicePackageDetails" className="form-label">Service Package Details (if given)</label>
                  <textarea className="form-control" value={formData.servicePackageDetails} onChange={handleChange("servicePackageDetails")} id="servicePackageDetails"></textarea>
                  <span className='text-danger font-monospace small'>{errors.servicePackageDetails}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="expectedDeliveryDate" className="form-label">Expected Delivery Date</label>
                  <input type="date" className="form-control shadow-none" value={formData.expectedDeliveryDate} onChange={handleChange("expectedDeliveryDate")} id="expectedDeliveryDate" />
                </div>

                <div className="mb-3">
                  <label htmlFor="deliveryLocation" className="form-label">Delivery Location </label>
                  <textarea className="form-control" value={formData.deliveryLocation} onChange={handleChange("deliveryLocation")} id="deliveryLocation"></textarea>
                  <span className='text-danger font-monospace small'>{errors.deliveryLocation}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="deliveredBy" className="form-label">Delivered By (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={formData.deliveredBy === "Delivered By Us"} value="Delivered By Us" onChange={handleChange("deliveredBy")} id="deliveredByUs" />
                    <label className="form-check-label" htmlFor="deliveredByUs">
                      Delivered By Us
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={formData.deliveredBy === "Pickup By Customer"} value="Pickup By Customer" onChange={handleChange("deliveredBy")} id="pickupByCustomer" />
                    <label className="form-check-label" htmlFor="pickupByCustomer">
                      Pickup By Customer
                    </label>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.deliveredBy}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentStatus" className="form-label">Payment Status (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    <select className="form-select shadow-none" value={formData.paymentStatus} onChange={handleChange("paymentStatus")} id="paymentStatus" aria-label="Default select example">
                      <option value="">Select Payment Status</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <span className='text-danger font-monospace small'>{errors.paymentStatus}</span>
                </div>

                {
                  formData.paymentStatus === "Cash" &&
                  <>
                    <div className="mb-3">
                      <label htmlFor="bankName" className="form-label">Bank Name </label>
                      <input type="text" className="form-control shadow-none" value={formData.bankName} onChange={handleChange("bankName")} id="bankName" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="bankAccountName" className="form-label">Company Account Name (Payee Name) </label>
                      <input type="text" className="form-control shadow-none" value={formData.bankAccountName} onChange={handleChange("bankAccountName")} id="bankAccountName" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="accountNumber" className="form-label">Account Number </label>
                      <input type="text" className="form-control shadow-none" value={formData.accountNumber} onChange={handleChange("accountNumber")} id="accountNumber" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="amountPaid" className="form-label">Amount Paid <span className='ms-3 fw-bold'>{formatAsCurrency(formData.amountPaid)}</span> </label>
                      <input type="text" className="form-control shadow-none" value={formData.amountPaid} onChange={handleChange("amountPaid")} id="amountPaid" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="dateOfPayment" className="form-label">Date Of Payment</label>
                      <input type="date" className="form-control shadow-none" value={formData.dateOfPayment} onChange={handleChange("dateOfPayment")} id="dateOfPayment" />
                    </div>
                  </>
                }


                {
                  formData.paymentStatus === "Credit" &&
                  <>
                    <div className="mb-3">
                      <label htmlFor="lpoNumber" className="form-label">LPO Number </label>
                      <input type="text" className="form-control shadow-none" value={formData.lpoNumber} onChange={handleChange("lpoNumber")} id="lpoNumber" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="paymentDueDate" className="form-label">Payment Due Date </label>
                      <input type="date" className="form-control shadow-none" value={formData.paymentDueDate} onChange={handleChange("paymentDueDate")} id="paymentDueDate" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="otherPaymentDetails" className="form-label">Other Payment Details </label>
                      <textarea rows={5} className="form-control shadow-none" value={formData.otherPaymentDetails} onChange={handleChange("otherPaymentDetails")} id="otherPaymentDetails" ></textarea>
                    </div>
                  </>
                }

                <div className="mb-3">
                  <label htmlFor="deliveryLocation" className="form-label">Additional Information</label>
                  <textarea className="form-control shadow-none" value={formData.additionalInformation} onChange={handleChange("additionalInformation")} id="deliveryLocation" rows={6}></textarea>
                </div>

                <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddInvoiceRequest