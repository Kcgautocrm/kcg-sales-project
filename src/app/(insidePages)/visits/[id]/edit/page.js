"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";
import Compress from "react-image-file-resizer";
import useGetUserData from "@/hooks/useGetUserData";
import formValidator from "@/services/validation";
import AppAutoComplete from "@/components/autoComplete";


const EditVisitReport = () => {
  const params = useParams();
  const { userData } = useGetUserData();
  const { id } = params;
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["allVisitReports", id],
    queryFn: () => apiGet({ url: `/visitReport/${id}?singleReport=${true}` })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        return res.data
      })
      .catch(error => {
        console.log(error.message)
        dispatchMessage({ severity: "error", message: error.message })
        return {}
      }),
      staleTime: Infinity,
      retry: 3
  })

  useEffect(() => {
    if (data) {
      let {employeeId, customerId, contactPersonId, callType, status, productsDiscussed, quantity, durationOfMeeting, meetingOutcome, visitDate, pfiRequest, nextVisitDate, followUpVisits } = data;
      visitDate = visitDate?.split("T")
      nextVisitDate = nextVisitDate?.split("T")
      setFormData(prevState => ({
        ...prevState,
        employeeId, customerId, contactPersonId, callType, status, productsDiscussed, quantity, durationOfMeeting, meetingOutcome, visitDate: visitDate[0], visitTime: visitDate[1], pfiRequest, nextVisitDate: nextVisitDate[0], nextVisitTime: nextVisitDate[1], followUpVisits
      }))
    }
  }, [data])

  useEffect(()=>{
    if(userData?.id && data){
      if((userData?.id !== data.employeeId)){
        router.push(`/visits/${data.customerId}`)
      }
    }
  }, [userData, data])


  const[formData, setFormData] = useState({
    employeeId: "",
    customerId: "",
    contactPersonId: "",
    callType: "",
    status: "",
    productsDiscussed: [],
    quantity: "",
    durationOfMeeting: "",
    meetingOutcome: "",
    visitDate: "",
    visitTime: "",
    nextVisitDate: "",
    nextVisitTime: "",
    followUpVisits: [],
    pfiRequest: false
  })
  const [errors, setErrors] = useState({});

  const [initialValue, setInitialValue] = useState("");

  const customerQuery = useQuery({
    queryKey: ["allCustomers"],
    queryFn: () => apiGet({ url: `/customer?employeeId=${userData?.id}&isActive=true` })
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
    queryFn: () => apiGet({ url: `/contactPerson?employeeId=${userData?.id}&isActive=true` })
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

  useEffect(()=>{
    if(formData.customerId === ""){
      setFormData( prevState =>({
        ...prevState,
        contactPersonId: ""
      }))
    }
  },[formData.customerId])

  const productsQuery = useQuery({
    queryKey: ["allProducts"],
    queryFn: () => apiGet({ url: "/product?isActive=true" })
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

  const handleCheckPfi = () => {
    setFormData(prevState => ({
      ...prevState,
      pfiRequest: !prevState.pfiRequest
    }))
  }

  const listCustomers = () => {
    if (customerQuery.data) {
      return customerQuery.data.map(customer =>
        <option key={customer.id} value={customer.id}> {customer.companyName} </option>
      )
    }
  }

  const listCustomerOptions = () => {
    if (customerQuery.data) {
      return customerQuery.data.map(customer => {return ({id: customer.id, label: customer.companyName})}
      )
    }
  }

  const listContactPersons = () => {
    let persons = contactPersonQuery.data;
    if (formData.customerId) {
      persons = persons.filter(person => person.customerId === formData.customerId)
    }
    if (persons.length > 0) {
      return persons.map(person =>
        <option key={person.id} value={person.id}>{person.name}</option>
      )
    }
  }


  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  /* const handleChangeFollowUp = (prop) => (event) => {
    setFollowUpData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  } */

  const handleCheckProducts = (product) => (event) => {
    if (event.target.checked) {
      let productData;
      productsQuery.data.forEach(item => {
        if (item.name === product) {
          productData = item.name;
        }
      })
      let state = formData;
      state.productsDiscussed.push(productData);
      setFormData(prevState => ({
        ...prevState,
        ...state
      }))
    } else {
      let state = formData;
      state.productsDiscussed = state.productsDiscussed.filter(function (item) { return item !== product })
      setFormData(prevState => ({
        ...prevState,
        ...state
      }))
    }
  }

  const listProductOptions = () => {
    return productsQuery.data.map(product =>
      <div className="form-check ms-3" key={product.id}>
        <input className="form-check-input" type="checkbox" checked={isChecked(product.name)} onChange={handleCheckProducts(product.name)} value={product.name} id={product.id} />
        <label className="form-check-label fw-bold" htmlFor={product.id}>
          {product.name}
        </label>
      </div>
    )
  }

  const isChecked = (prop) => {
    let checked = false;
    formData?.productsDiscussed?.forEach(item => {
      if (item === prop) {
        checked = true
      }
    })
    return checked;
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: (data) => apiPatch({ url: `/visitReport/${id}`, data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allVisitReport", id])
        router.push(`/visits/${formData.customerId}`)
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = (event) => {
    event.preventDefault();
    let errors = formValidator(["customerId", "contactPersonId", "status", "durationOfMeeting", "productsDiscussed", "visitDate"], formData);
    if(Object.keys(errors).length){
      dispatchMessage({ severity: "error", message: "Some required fields are empty" })
      return setErrors(errors);
    }
    let data = {...formData};
    data.visitDate = `${data.visitDate}T${data.visitTime}`
    data.nextVisitDate = `${data.nextVisitDate}T${data.nextVisitTime}`
    delete data.visitTime;
    delete data.nextVisitTime;
    mutate(data)
  }

  const setInitialValueInAutoComplete = () =>{
    if(customerQuery.data?.length > 0){
      customerQuery?.data.forEach( customer =>{
        if(formData?.customerId === customer?.id){
          setInitialValue(customer.companyName);
        }
      })
    } 
  }

  useEffect(()=>{
    setInitialValueInAutoComplete();
  }, [customerQuery.data, formData.customerId])



  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Visit Report</h4>
        <span className="breadcrumb-item ms-3"><a href="/visits"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Edit Visit Report Details</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="customerId" className="form-label">Customer (<span className='fst-italic text-warning'>required</span>)</label>
                  <AppAutoComplete options={listCustomerOptions()} handleClickOption={(id)=>{
                    setFormData( prevState =>({
                      ...prevState,
                      customerId: id
                    }))
                  }} placeholder="Select Customer" initialValue={initialValue} />
                  <span className='text-danger font-monospace small'>{errors.customerId}</span>
                </div>
                <div className="mb-3">
                  <label htmlFor="contactPersonId" className="form-label">Contact Person (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="contactPersonId" onChange={handleChange("contactPersonId")} value={formData.contactPersonId} aria-label="Default select example">
                    <option value="">Select Contact Person</option>
                    {!contactPersonQuery.isLoading && listContactPersons()}
                  </select>
                  <span className='text-danger font-monospace small'>{errors.contactPersonId}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="callType" className="form-label">Call Type</label>
                  <select className="form-select shadow-none" id="callType" onChange={handleChange("callType")} value={formData.callType} aria-label="Default select example">
                    <option value="">Select Call Type</option>
                    <option value="Telephone">Telephone</option>
                    <option value="In-Person">In-Person</option>

                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="status" onChange={handleChange("status")} value={formData.status} aria-label="Default select example">
                    <option value="">Select Status</option>
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                    <option value="Follow-Up">Follow-Up</option>
                    <option value="Demo">Demo</option>
                  </select>
                  <span className='text-danger font-monospace small'>{errors.status}</span>
                </div>


                <div className="mb-3">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input type="text" className="form-control" id="quantity" value={formData.quantity} onChange={handleChange("quantity")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="durationOfMeeting" className="form-label">Duration Of Meeting (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="durationOfMeeting" onChange={handleChange("durationOfMeeting")} value={formData.durationOfMeeting} aria-label="Default select example">
                    <option value="">Select Meeting Duration</option>
                    <option value="30 mins">30 mins</option>
                    <option value="1 hr">1 hr</option>
                    <option value="1hr 30mins">1hr 30mins</option>
                    <option value="2 hrs">2 hrs</option>
                    <option value="2hrs 30 mins">2hrs 30 mins</option>
                    <option value="3 hrs">3 hrs</option>
                    <option value="3hrs 30 mins">3hrs 30 mins</option>
                    <option value="4hrs">4hrs</option>
                    <option value="4hrs 30 mins">4hrs 30 mins</option>
                    <option value="5 hrs">5 hrs</option>
                    <option value="Above 5 hrs">5 hrs</option>
                  </select>
                  <span className='text-danger font-monospace small'>{errors.durationOfMeeting}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="meetingOutcome" className="form-label">Meeting Outcome</label>
                  <textarea rows={4} className="form-control" id="meetingOutcome" value={formData.meetingOutcome} onChange={handleChange("meetingOutcome")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="visitDate" className="form-label">Visit Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <div className="d-flex">
                    <input type="date" className="form-control" id="visitDate" value={formData.visitDate} onChange={handleChange("visitDate")} />
                    <input type="time" className="form-control ms-1" id="visitTime" value={formData.visitTime} onChange={handleChange("visitTime")} />
                  </div>
                  <span className='text-danger font-monospace small'>{errors.visitDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="nextVisitDate" className="form-label">Next Visit Date</label>
                  <div className="d-flex">
                    <input type="date" className="form-control" id="nextVisitDate" value={formData.nextVisitDate} onChange={handleChange("nextVisitDate")} />
                    <input type="time" className="form-control ms-1" id="nextVisitTime" value={formData.nextVisitTime} onChange={handleChange("nextVisitTime")} />
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" checked={formData.pfiRequest} onChange={handleCheckPfi} id="pfiRequest" />
                  <label className="form-check-label fw-bold" htmlFor="pfiRequest">
                    Pfi Request
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="productsDiscussed" className="form-label">Products Discussed (<span className='fst-italic text-warning'>required</span>)</label>
                  {!productsQuery.isLoading && !productsQuery.isError &&
                    <div className=''> {listProductOptions()} </div>}
                  <span className='text-danger font-monospace small'>{errors.productsDiscussed}</span>
                </div>

                <div className="mt-5">
                  <button type="submit" className="btn btn-primary px-5 py-2" disabled={isLoading || isFetching} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
                  <a className="btn btn-outline-primary px-5 py-2 ms-3" href="/visits">Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditVisitReport