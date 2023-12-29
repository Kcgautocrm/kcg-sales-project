"use client"

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { apiPost, apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import formatAsCurrency from '@/services/formatAsCurrency';
import { useRouter } from "next/navigation";
import useGetUserData from "@/hooks/useGetUserData";
import formValidator from "@/services/validation";


const AddPfiRequest = () => {
  const dispatchMessage = useDispatchMessage();
  const router = useRouter()
  const { userData } = useGetUserData();
  const [formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    contactPersonId: "",
    customerType: "",
    companyName: "",
    companyAddress: "",
    contactPersonName: "",
    phoneNumber: "",
    emailAddress: "",
    brandId: "",
    productId: "",
    vehicleDetails: "",
    quantity: "",
    pricePerVehicle: "",
    bodyTypeDescription: "",
    vehicleServiceDetails: "",
    specialFitmentDetails: "",
    costForSpecialFitment: "",
    discount: "",
    vatDeduction: false,
    whtDeduction: false,
    registration: false,
    refundRebateAmount: "",
    refundRebateRecipient: "",
    designation: "",
    relationshipWithTransaction: "",
    estimatedOrderClosingTime: "",
    paymentType: "",
    deliveryLocation: "",
    additionalInformation: "",
  })

  const [errors, setErrors] = useState({})
  const [refund, setRefund] = useState(false);


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

  const customerQuery = useQuery({
    queryKey: ["allCustomers"],
    queryFn: () => apiGet({ url: `/customer?approved=approved&employeeId=${userData?.id}` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  const contactPersonQuery = useQuery({
    queryKey: ["allContactPersons"],
    queryFn: () => apiGet({ url: `/contactPerson?employeeId=${userData?.id}` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false
  })

  useEffect(()=>{
    if(userData?.id){
      customerQuery.refetch();
      contactPersonQuery.refetch();
    }
  }, [userData?.id])

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

  const listCustomerOptions = () => {
    if (customerQuery?.data?.length) {
      return customerQuery.data.map(customer =>
        <option key={customer.id} value={customer.id}>{customer.companyName}</option>
      )
    }
  }

  const listContactPersonOptions = () => {
    let contactPersons = contactPersonQuery?.data;
    if (formData.customerId) {
      contactPersons = contactPersons.filter(item => item.customerId === formData.customerId)
    }
    if (contactPersons.length) {
      return contactPersons.map(contactPerson =>
        <option key={contactPerson.id} value={contactPerson.id}>{contactPerson.name}</option>
      )
    }
  }

  const getCustomerData = () => {
    let id = formData.customerId
    let data = {}
    if (!customerQuery.isLoading) {
      customerQuery.data.forEach(customer => {
        if (customer.id === id) {
          data = customer
        }
      })
    }
    return data
  }

  const getContactPersonData = () => {
    let id = formData.contactPersonId
    let data = {}
    if (!contactPersonQuery.isLoading) {
      contactPersonQuery.data.forEach(customer => {
        if (customer.id === id) {
          data = customer
        }
      })
    }
    return data
  }

  useEffect(() => {
    if (formData.customerId) {
      let data = getCustomerData();
      setFormData(prevState => ({
        ...prevState,
        companyName: data.companyName,
        companyAddress: data.address
      }))
    }
  }, [formData.customerId])

  useEffect(() => {
    if (formData.contactPersonId) {
      let data = getContactPersonData();
      setFormData(prevState => ({
        ...prevState,
        contactPersonName: data.name,
        phoneNumber: data.phoneNumber,
        emailAddress: data.email
      }))
    }
  }, [formData.contactPersonId])

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      employeeId: userData.id
    }))
  }, [userData])

  const handleChange = (prop) => (event) => {
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    if((prop === "quantity" || prop === "pricePerVehicle" || prop === "refundRebateAmount" || prop === "estimatedOrderClosingTime" || prop === "costForSpecialFitment") && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }


    if (prop === "registration" || prop === "vatDeduction" || prop === "whtDeduction") {
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
    mutationFn: () => apiPost({ url: "/pfiRequestForm", data: formData })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allPfiRequests"])
        router.push("/pfiRequests")
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData)
    let errors = formValidator(["customerType", "companyName", "contactPersonName", "phoneNumber", "emailAddress", "brandId", "productId", "vehicleDetails", "quantity", "pricePerVehicle", "estimatedOrderClosingTime"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    mutate()
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Pfi Requests</h4>
        <span className="breadcrumb-item ms-3"><a href="/companies"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Pfi Request</h5>
              <form>
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
                  <label htmlFor="companyName" className="form-label">Company Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    {formData.customerType === "existing customer" ?
                      <select className="form-select" id="customerId" onChange={handleChange("customerId")} value={formData.customerId} aria-label="Default select example">
                        <option value="">Select Company</option>
                        {!customerQuery.isLoading && listCustomerOptions()}
                      </select> :
                      <input type="text" className="form-control" value={formData.companyName} onChange={handleChange("companyName")} id="companyName" placeholder="New Company Name" />
                    }
                  </div>
                  <span className='text-danger font-monospace small'>{errors.companyName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="companyAddress" className="form-label">Company Address</label>
                  <textarea className="form-control shadow-none" value={formData.companyAddress} onChange={handleChange("companyAddress")} id="companyAddress" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.companyAddress}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="contactPerson" className="form-label">Contact Person (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className='d-flex align-items-center'>
                    {formData.customerType === "existing customer" ?
                      <select className="form-select shadow-none" id="contactPerson" onChange={handleChange("contactPersonId")} value={formData.contactPersonId} aria-label="Default select example">
                        <option value="">Contact Person</option>
                        {contactPersonQuery.data && listContactPersonOptions()}
                      </select> :
                      <input type="text" className="form-control shadow-none" value={formData.contactPersonName} onChange={handleChange("contactPersonName")} id="contactPersonName" placeholder="Firstname Lastname" />
                    }
                  </div>
                  <span className='text-danger font-monospace small'>{errors.contactPersonName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="tel" className="form-control shadow-none" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} id="phoneNumber" placeholder="Phone Number" />
                  <span className='text-danger font-monospace small'>{errors.phoneNumber}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label">Email Address (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.emailAddress} onChange={handleChange("emailAddress")} id="emailAddress" placeholder="Email Address" />
                  <span className='text-danger font-monospace small'>{errors.emailAddress}</span>
                </div>




                <div className="mb-3">
                  <label htmlFor="brandId" className="form-label">Brand (<span className='fst-italic text-warning'>required</span>)</label>
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
                  <label htmlFor="vehicleDetails" className="form-label">Vehicle Details (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea className="form-control shadow-none" value={formData.vehicleDetails} onChange={handleChange("vehicleDetails")} id="vehicleDetails" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.vehicleDetails}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Quantity  (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.quantity} onChange={handleChange("quantity")} id="quantity" placeholder="Quantity of Products" />
                  <span className='text-danger font-monospace small'>{errors.quantity}</span>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="bodyTypeDescription" className="form-label">Body Type Description / Any Extra Requirement Detail</label>
                  <textarea className="form-control shadow-none" value={formData.bodyTypeDescription} onChange={handleChange("bodyTypeDescription")} id="bodyTypeDescription" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.bodyTypeDescription}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="vehicleServiceDetails" className="form-label">Vehicle Service Details</label>
                  <textarea className="form-control shadow-none" value={formData.vehicleServiceDetails} onChange={handleChange("vehicleServiceDetails")} id="vehicleServiceDetails" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.vehicleServiceDetails}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="specialFitmentDetails" className="form-label">Body / Special Fitment details (please be specific)</label>
                  <textarea className="form-control shadow-none" value={formData.specialFitmentDetails} onChange={handleChange("specialFitmentDetails")} id="specialFitmentDetails" rows={3}></textarea>
                  <span className='text-danger font-monospace small'>{errors.specialFitmentDetails}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="costForSpecialFitment" className="form-label">Cost for Body/Super Structure/Special Fitment <span className='ms-3 fw-bold'>{formatAsCurrency(formData.costForSpecialFitment)}</span></label>
                  <input type="text" className="form-control shadow-none" value={formData.costForSpecialFitment} onChange={handleChange("costForSpecialFitment")} id="costForSpecialFitment" placeholder="Cost Of Body Special Fitment" />
                  <span className='text-danger font-monospace small'>{errors.costForSpecialFitment}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="pricePerVehicle" className="form-label">Price Per Vehicle (inclusive of VAT) (<span className='fst-italic text-warning'>required</span>)<span className='ms-3 fw-bold'>{formatAsCurrency(formData.pricePerVehicle)}</span></label>
                  <input type="text" className="form-control shadow-none" value={formData.pricePerVehicle} onChange={handleChange("pricePerVehicle")} id="pricePerVehicle" placeholder="Price Per Vehicle" />
                  <span className='text-danger font-monospace small'>{errors.pricePerVehicle}</span>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="discount" className="form-label">Discount, if any</label>
                  <input type="text" className="form-control shadow-none" value={formData.discount} onChange={handleChange("discount")} id="discount" placeholder="Discount" />
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
                  <input className="form-check-input shadow-none" type="checkbox" checked={formData.registration} onChange={handleChange("registration")} id="registration" />
                  <label className="form-check-label" htmlFor="registration">
                    Registration
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
                      <label htmlFor="refundRebateAmount" className="form-label">Refund/Rebate amount, if any  <span className='ms-3 fw-bold'>{formatAsCurrency(formData.refundRebateAmount)}</span></label>
                      <input type="text" className="form-control shadow-none" value={formData.refundRebateAmount} onChange={handleChange("refundRebateAmount")} id="refundRebateAmount" placeholder="Amount to be Refunded" />
                    </div>


                    <div className="mb-3">
                      <label htmlFor="refundRebateRecipient" className="form-label">Person name receiving refund/rebate</label>
                      <input type="text" className="form-control shadow-none" value={formData.refundRebateRecipient} onChange={handleChange("refundRebateRecipient")} id="refundRebateRecipient" placeholder="Person to be Refunded" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="designation" className="form-label">Designation (when rebate receiver is working in buying company)</label>
                      <input type="text" className="form-control shadow-none" value={formData.designation} onChange={handleChange("designation")} id="designation" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="relationshipWithTransaction" className="form-label">Relationship with transaction (if rebate receiver is not working in buying company)</label>
                      <input type="text" className="form-control shadow-none" value={formData.relationshipWithTransaction} onChange={handleChange("relationshipWithTransaction")} id="relationshipWithTransaction" placeholder="Relationship with Transaction" />
                    </div>
                  </>
                }


                <div className="mb-3">
                  <label htmlFor="estimatedOrderClosingTime" className="form-label">Estimated Order Closing Time (No of Days) (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control shadow-none" value={formData.estimatedOrderClosingTime} onChange={handleChange("estimatedOrderClosingTime")} id="estimatedOrderClosingTime" placeholder="Estimated Order Closing Time" />
                  <span className='text-danger font-monospace small'>{errors.estimatedOrderClosingTime}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentType" className="form-label">Payment Type</label>
                  <select className="form-select shadow-none" id="paymentType" value={formData.paymentType} onChange={handleChange("paymentType")} aria-label="Default select example">
                    <option value="">Select Payment Type</option>
                    <option value="direct">Direct</option>
                    <option value="bank finance">Bank Finance</option>
                  </select>
                  <span className='text-danger font-monospace small'>{errors.paymentType}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="deliveryLocation" className="form-label">Delivery Location </label>
                  <textarea className="form-control" value={formData.deliveryLocation} onChange={handleChange("deliveryLocation")} id="deliveryLocation"></textarea>
                  <span className='text-danger font-monospace small'>{errors.deliveryLocation}</span>
                </div>

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

export default AddPfiRequest