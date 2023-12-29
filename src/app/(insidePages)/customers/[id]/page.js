"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/services/apiService";
import { useParams, useRouter } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import AddContactPerson from '../add/addContactPerson';
import EditContactPerson from "./edit/editContactPerson";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import useGetComments from "@/hooks/useGetComments";
import ConfirmationModal from '@/components/confirmationModal';
import moment from "moment";
import useGetUserData from "@/hooks/useGetUserData";
import AppAutoComplete from "@/components/autoComplete";


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

const LoadingFallBack = () => {
  return (
    <div>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )" }} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )" }} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )" }} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )" }} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )" }} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )" }} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )" }} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )" }} width="60%" animation="wave" />
      </article>
      <article className="d-flex">
        <Skeleton className="me-3" height={40} sx={{ width: "clamp(100px, 25%, 250px )" }} animation="wave" />
        <Skeleton height={40} sx={{ width: "clamp(200px, 45%, 400px )" }} width="60%" animation="wave" />
      </article>
    </div>

  );
}

const ContactPersonLoadingFallBack = () =>{
  return (
    <>
      <tr sx={{ width: "100%" }}>
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
      </tr>
      <tr sx={{ width: "100%" }}>
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

const CustomerDetails = () => {
  const params = useParams();
  const { id } = params;
  const pathName = usePathname();
  const router = useRouter();
  const closeDeleteCustomerModal = useRef();
  const closeDeleteContactPersonModal = useRef();
  const {userData} = useGetUserData();
  const dispatchMessage = useDispatchMessage();
  const {refetch, comments, listComments} = useGetComments(id);

  const [options, setOptions] = useState([])
  
  const [currentForm, setCurrentForm] = useState("")
  const [currentlyEditedContactPerson, setCurrentlyEditedContactPerson] = useState({})
  const [deleteContactPersonId, setDeleteContactPersonId] = useState(null);

  const { data, isFetching, refetch: refetchCustomerDetails } = useQuery({
    queryKey: ["allCustomers", id],
    queryFn: () => apiGet({ url: `/customer/${id}` })
      .then(res => {
        console.log(res.data)
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

  const customerQuery = useQuery({
    queryKey: ["allCustomers" ],
    queryFn:  ()=>apiGet({ url: `/customer?approved=approved`})
    .then(res => {
      console.log(res);
      generateOptions(res.data);
      return res.data;
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
      return []
    }),
    staleTime: Infinity,
    retry: 3
  })

  const generateOptions = (data = []) =>{
    let options = []
    if(data.length > 0){
      console.log(data)
      data.forEach( item =>{
        options.push({id: item.id, label: item.companyName})
      })
    } 
    setOptions(options)
  }

  const deleteCustomer = useMutation({
    mutationFn: () => apiDelete({ url: `/customer/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Customer deleted successfully"})
      closeDeleteContactPersonModal.current.click();
      refetchCustomerDetails();
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteContactPersonModal.current.click();
    })
  }) 

  const deleteContactPerson = useMutation({
    mutationFn: (contactPersonId) => apiDelete({ url: `/contactPerson/${contactPersonId}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Contact Person deleted successfully"})
      closeDeleteContactPersonModal.current.click();
      refetchCustomerDetails();
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteContactPersonModal.current.click();
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

  const approveCustomer = useMutation({
    mutationFn: () => apiPatch({ url: `/customer/${id}`, data: {approved: true}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Customer approved successfully"})
      refetchCustomerDetails()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const disApproveCustomer = useMutation({
    mutationFn: () => apiPatch({ url: `/customer/${id}`, data: {approved: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Customer disapproved successfully"})
      refetchCustomerDetails()
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  

  const [formData, setFormData] = useState({
    approved: false,
  })

  useEffect(() => {
    if (data) {
      setFormData(prevState => ({
        ...prevState,
        approved: data.approved
      }))
    }
  }, [data])

  const [commentData, setCommentData] = useState({
    senderId: "",
    receiverId: "",
    resourceId: "",
    resourceUrl: "",
    message: ""
  });
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

  useEffect(()=>{
    setCommentData( prevState =>({
      ...prevState,
      senderId: userData?.id,
      receiverId: data?.employee?.id,
      resourceId: id,
      resourceUrl: pathName
    }))
  },[data, userData])

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

  const postComment = (e)=>{
    e.preventDefault();
    if(!commentData?.message){
      return
    }
    commentMutation.mutate()
  }

 

  const listContactPersons = () =>{
    return data?.contactPersons?.map( (item, index) => {
      const {id, name, email, designation, phoneNumber } = item;
      return( 
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1 text-capitalize">{name}</h6>
          </td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1">{email}</h6>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal text-capitalize">{designation}</p>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal text-capitalize">{phoneNumber}</p>
          </td>
          {(userData?.id === item.employeeId && !data.approved) &&
          <td className="border-bottom-0">
            <button className="btn btn-link text-primary ms-auto" onClick={()=>{
              setCurrentlyEditedContactPerson(item);
              setCurrentForm("editContactPerson")
            }}>Edit</button>
            <a className="btn btn-link text-danger ms-2" onClick={() =>{
              setDeleteContactPersonId(id)
            }} data-bs-toggle="modal" data-bs-target="#deleteContactPerson">Delete</a>
          </td>}
        </tr>
    )
    })
  }


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Customer</h4>
        
        <span className="breadcrumb-item ms-3"><a href="/customers"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor" ) && <a className={`btn btn-link text-primary ms-auto`} onClick={()=>setCurrentForm("addContactPerson")}>Add Contact Person</a>}
        {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor" && !data?.approved ) && <a className="btn btn-link text-primary" href={`/customers/${id}/edit`}>Edit</a>}
        {userData?.staffCadre?.includes("admin")  && <a className="btn btn-link text-danger ms-auto" data-bs-toggle="modal" data-bs-target="#deleteCustomer">Delete</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex flex-column align-items-stretch">
          <div className="card w-100">
            {currentForm === "addContactPerson" &&
              <div className="card-body p-4"> 
              <AddContactPerson employeeId={data?.employee?.id} customerId={data?.id} refetchCustomer={refetchCustomerDetails} onClose={()=>setCurrentForm("")} />
            </div>}

            {currentForm === "editContactPerson" &&
              <div className="card-body p-4"> 
              <EditContactPerson data={currentlyEditedContactPerson} onClose = {()=>setCurrentForm("")} refetchCustomer={refetchCustomerDetails} />
            </div>}


            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
                <header className="d-flex align-items-center mb-4">
                  <h5 className="card-title fw-semibold m-0 p-0 opacity-75">Customer Details</h5>
                  {userData?.staffCadre?.includes("admin") && 
                  <>
                    {data?.approved ?
                      <button className="btn btn-muted ms-auto" disabled={disApproveCustomer.isLoading} onClick={disApproveCustomer.mutate}>
                        {disApproveCustomer?.isLoading ? "Loading..." : "Disapprove"}
                      </button> :
                      <button className="btn btn-success ms-auto" disabled={approveCustomer.isLoading} onClick={approveCustomer.mutate}>
                        {approveCustomer?.isLoading ? "Loading..." : "Approve"}
                      </button>
                    }
                  </>
                  }
                </header>

              {data ?
                <>
                  { (userData?.staffCadre?.includes("admin") && data.approved === false) && <div className="mb-4">
                    <label htmlFor="customerSearch" className="form-label">Verify Customer (<span className='fst-italic text-warning'>required</span>)</label>
                    <AppAutoComplete options={options} handleClickOption={()=>{}}  placeholder="Search Company Name" />
                  </div>}

                  <DataListItem title="Company Name" value={data.companyName} />
                  <DataListItem title="Company Website" value={data.companyWebsite} />
                  <DataListItem title="Industry" value={data.industry} />
                  <DataListItem title="Customer Type" value={data.customerType} />
                  <DataListItem title="Enquiry Source" value={data.enquirySource} />
                  <DataListItem title="Status" value={data.status} />
                  <DataListItem title="Approved" value={data.approved ? "Yes" : "Pending Approval"} />
                  <div className="row mb-3 d-flex align-items-center">
                    <div className="col-12 col-md-4">
                      <h6 className="m-0">Address</h6>
                    </div>
                    <div className="col-12 col-md-8">
                      <p className="m-0">{data.address}</p>
                      <p className="m-0">{data.city} {data.lga} {data.state}</p>
                    </div>
                  </div>
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />
              }
            </div>

            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-4 opacity-75">Contact Persons</h5>
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">#</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Contact Person Name</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Email</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Designation</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Phone Number</h6>
                      </th>
                      {(userData?.staffCadre?.includes("salesPerson") && userData?.accountType !== "Supervisor" ) &&
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Actions</h6>
                      </th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.contactPersons ? listContactPersons() : <ContactPersonLoadingFallBack />}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card w-100 p-3">
            <h5 className="mb-4">Comments</h5>
            <ul className="list-unstyled">
              {listComments()}
            </ul>
            <div className="mb-3 d-flex">
              <textarea rows={3} className="form-control" id="location" value={commentData.message} placeholder="Make Your Comments here" onChange={handleChangeComment}></textarea>
              <div className="d-flex align-items-center">
                <button className="btn nav-icon-hover" disabled={commentMutation.isLoading} onClick={postComment}><i className="fa-solid fa-paper-plane h1"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal title="Delete Customer" message="Are you sure your want to delete this customer?" isLoading={deleteCustomer.isLoading} onSubmit={deleteCustomer.mutate} id="deleteCustomer" btnColor="danger" closeButtonRef={closeDeleteCustomerModal} />

      <ConfirmationModal title="Delete Contact Person" message="Are you sure your want to delete this contact person?" isLoading={deleteContactPerson.isLoading} onSubmit={()=>deleteContactPerson.mutate(deleteContactPersonId)} id="deleteContactPerson" btnColor="danger"  closeButtonRef={closeDeleteContactPersonModal}/>
    </div>
  )
}

export default CustomerDetails