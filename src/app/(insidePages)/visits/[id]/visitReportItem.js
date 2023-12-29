import useGetUserData from "@/hooks/useGetUserData";
import Skeleton from '@mui/material/Skeleton';
import useGetComments from '@/hooks/useGetComments';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useSelector } from 'react-redux';
import ConfirmationModal from '@/components/confirmationModal';
import DeleteFollowUpButton from '@/components/deleteFollowUpButton';
import moment from 'moment';
import formValidator from "@/services/validation";


const DataListItem = ({ title, value }) => {
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

const FollowUpLoadingFallBack = () =>{
  return (
    <>
      <tr sx={{ width: "100%" }}>
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
      </tr>
      <tr sx={{ width: "100%" }}>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
        <td><Skeleton height={50} animation="wave" /></td>
      </tr>
    </>
  );
}

const VisitReportItem = ({item, refetchVisitReport}) => {
  const {userData} = useGetUserData();
  const pathName = usePathname();
  const dispatchMessage = useDispatchMessage();
  const nextVisitDateRef = useRef();
  const nextVisitTimeRef = useRef();
  

  const followUpVisitMutation = useMutation({
    mutationFn: (data) => apiPatch({ url: `/visitReport/${item.id}`, data: {nextVisitDate: data.nextVisitDate, followUpVisits: data } })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        refetchVisitReport()
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const visitReportMutation = useMutation({
    mutationFn: () => apiPatch({ url: `/visitReport/${item.id}`, data: {isActive: false}})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Visit Report deleted successfully"})
      refetchVisitReport();
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
    })
  }) 

  const handleChangeFollowUp = (prop) => (event) => {
    setFollowUpVisit(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const handleSubmitFollowUp = (e) => {
    e.preventDefault();
    let id = new Date().getTime();
    let newFollowUpVisit = { ...followUpVisit }
    newFollowUpVisit.nextVisitDate = `${newFollowUpVisit.nextVisitDate}T${newFollowUpVisit.nextVisitTime}`;
    delete newFollowUpVisit.nextVisitTime;
    let followUpData = [
      ...item.followUpVisits,
      {...newFollowUpVisit, id }
    ]
    // return console.log(followUpData)
    followUpVisitMutation.mutate(followUpData);
    setFollowUpVisit(prevState => ({
      ...prevState,
      id: "",
      meetingDate: "",
      meetingDuration: "",
      meetingOutcome: "",
      nextVisitDate: "",
      nextVisitTime: ""
    }))
  }
  
  //const [followUpVisits, setFollowUpVisits] = useState([]);
  const [followUpVisit, setFollowUpVisit] = useState({
    id: "",
    meetingDate: "",
    meetingDuration: "",
    meetingOutcome: "",
    nextVisitDate: "",
    nextVisitTime: "",
  })
  const [editFollowUpVisitData, setEditFollowUpVisitData] = useState({})

  /* useEffect(() => {
    if (item) {
      setFollowUpVisits(item.followUpVisits)
    }
  }, [item]) */
  const [showFollowUpVisitForm, setShowFollowUpVisitForm] = useState(false)
  const [errors, setErrors] = useState({})

  const listFollowUpVisits = (followUpVisits) => {
    return followUpVisits.map((item, index) => {
      const { id, meetingDate, meetingDuration, meetingOutcome, nextVisitDate } = item;
      return (
        <tr key={id} className="hover">
          <td className="border-bottom-0"><h6 className="fw-semibold mb-0">{index + 1}</h6></td>
          <td className="border-bottom-0">
            <h6 className="fw-semibold mb-1">{new Date(meetingDate).toDateString()}</h6>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{meetingDuration}</p>
          </td>
          <td className="border-bottom-0">
            <div className="d-flex align-items-center gap-2">
              <p className="fw-semibold m-0">{meetingOutcome}</p>
            </div>
          </td>
          <td className="border-bottom-0">
            <p className="mb-0 fw-normal">{moment(nextVisitDate).format('MMMM Do YYYY, h:mm:ss a')}</p>
          </td>
          {(userData?.staffCadre?.includes("salesPerson") && !userData?.staffCadre?.includes("supervisor")) &&
          <td className="border-bottom-0">
            <DeleteFollowUpButton isLoading={followUpVisitMutation.isLoading} deleteFunc={()=>deleteFollowUpVisit(id)} id={id} />
          </td>}
        </tr>
      )
    })
  }

  const deleteFollowUpVisit = (id) =>{
    let followUpData = item.followUpVisits
    followUpData = followUpData.filter( x => x.id !== id);
    console.log(followUpData)
    followUpVisitMutation.mutate(followUpData);
  }







  const { refetch, comments, listComments } = useGetComments(item.id);

  const [commentData, setCommentData] = useState({
    senderId: "",
    receiverId: "",
    resourceId: "",
    resourceUrl: "",
    message: ""
  });
  const clearComment = () => {
    setCommentData(prevState => ({
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

  const handleChangeComment = (event) => {
    setCommentData(prevState => ({
      ...prevState,
      message: event.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!commentData?.message){
      return
    }
    commentMutation.mutate()
  }

  useEffect(() => {
    setCommentData(prevState => ({
      ...prevState,
      senderId: userData?.id,
      receiverId: item?.employeeId,
      resourceId: item.id,
      resourceUrl: pathName
    }))
  }, [item, userData])

  const listProductsDiscussed = (data) => {
    let products = ""
    if(data){
      data.forEach(item => {
        if (products === "") {
          products += `${item}`
        } else {
          products += ` | ${item}`
        }
      })
    }
    return products;
  }

  const nextVisitDateMutation = useMutation({
    mutationFn: (data) => apiPatch({ url: `/visitReport/${item?.id}`, data: data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        refetchVisitReport()
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmitNextVisitDate = (event) => {
    event.preventDefault();
    let date = nextVisitDateRef.current.value;
    let time = nextVisitTimeRef.current.value;
    let data = {
      ...item,
      nextVisitDate: `${date}T${time}`
    }
    delete data.customer;
    delete data.contactPerson;
    nextVisitDateMutation.mutate(data)
  }

  const sendEmailReminderMutation = useMutation({
    mutationFn: (data) => apiPost({ url: `/sendEmail/visitReminder`, data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const sendEmailReminder = () =>{
    let data = {
      customerName: item.customer.companyName,
      contactPersonName: item.contactPerson.name,
      email: item.contactPerson.email,
      employeeName: `${userData.firstName} ${userData.lastName}`,
      visitDate: moment(item?.nextVisitDate).format('MMMM Do YYYY, h:mm:ss a'),
      message: ""
    }
    //return console.log(data)
    sendEmailReminderMutation.mutate(data);
  }


  return (
    <div className="accordion-item my-3">
      <h2 className="accordion-header">
        <button className="accordion-button border" type="button" data-bs-toggle="collapse" data-bs-target={`#${item.id}`} aria-expanded="true" aria-controls={item.id}>
          {new Date(item.visitDate).toDateString()}
        </button>
      </h2>
      <div id={item.id} className="accordion-collapse collapse" data-bs-parent="#accordionExample">
        <div className="accordion-body">
          <div className="d-flex">
            {(userData?.id === item?.employeeId ) && 
            <button className="btn btn-link text-primary ms-auto" onClick={() => setShowFollowUpVisitForm(prevState => !prevState)} >Add Follow-up visit</button>}
            {userData?.id === item.employeeId && <a className="btn btn-link text-primary ms-2" href={`/visits/${item.id}/edit`}>Edit</a>}
            {userData?.id === item.employeeId && <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteVisitReport">Delete</a>}
          </div>

          {showFollowUpVisitForm && <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Add Follow-up Visit</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="meetingDate" className="form-label">Meeting Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control shadow-none" value={followUpVisit.meetingDate} onChange={handleChangeFollowUp("meetingDate")} id="meetingDate" />
                  <span className='text-danger font-monospace small'>{errors.meetingDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="meetingDuration" className="form-label">Duration Of Meeting (<span className='fst-italic text-warning'>required</span>)</label>
                  <select className="form-select shadow-none" id="meetingDuration" onChange={handleChangeFollowUp("meetingDuration")} value={followUpVisit.meetingDuration} aria-label="Default select example">
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
                  </select>
                  <span className='text-danger font-monospace small'>{errors.meetingDuration}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="meetingOutcome" className="form-label">Meeting Outcome (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea className="form-control shadow-none" value={followUpVisit.meetingOutcome} onChange={handleChangeFollowUp("meetingOutcome")} id="meetingOutcome" ></textarea>
                  <span className='text-danger font-monospace small'>{errors.meetingOutcome}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="nextVisitDate" className="form-label">Next Visit Date</label>
                  <div className="d-flex">
                    <input type="date" className="form-control shadow-none" value={followUpVisit.nextVisitDate} onChange={handleChangeFollowUp("nextVisitDate")} id="nextVisitDate" />
                    <input type="time" className="form-control shadow-none ms-1" value={followUpVisit.nextVisitTime} onChange={handleChangeFollowUp("nextVisitTime")} id="nextVisitTime" />
                  </div>
                  <span className='text-danger font-monospace small'>{errors.nextVisitDate}</span>
                </div>

                <div>
                  <button className="btn btn-secondary me-3" onClick={(e) => {
                    e.preventDefault();
                    setShowFollowUpVisitForm(false);
                  }}>Cancel</button>
                  {(userData?.id === item?.employeeId ) && <button className="btn btn-primary" disabled={followUpVisitMutation.isLoading} onClick={handleSubmitFollowUp}>Add Follow-up Visit</button>}
                </div>

              </form>
            </div>
          </div>}
          <>
            <DataListItem title="Company Name" value={item?.customer?.companyName} />
            <DataListItem title="Contact Person" value={item?.contactPerson?.name} />
            <DataListItem title="Call Type" value={item.callType} />
            <DataListItem title="Status" value={item?.status} />
            <DataListItem title="Products Discussed" value={listProductsDiscussed(item?.productsDiscussed)} />
            <DataListItem title="Quantity" value={item?.quantity} />
            <DataListItem title="Duration Of Meeting" value={item?.durationOfMeeting} />
            <DataListItem title="Meeting Outcome" value={item?.meetingOutcome} />
            <DataListItem title="Initial Visit Date" value={moment(item?.visitDate).format('MMMM Do YYYY, h:mm:ss a')} />
            <DataListItem title="Pfi Request" value={item?.pfiRequest ? "Yes" : "No"} />
            <DataListItem title="Next Visit Date" value={moment(item?.nextVisitDate).format('MMMM Do YYYY, h:mm:ss a')} />
            <DataListItem title="Created On" value={moment(item?.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
            <DataListItem title="Last Updated" value={moment(item?.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />

            {userData?.id === item?.employeeId &&
            <div className="mb-3" style={{maxWidth: "600px"}}>
              <label htmlFor="nextVisitDate" className="form-label">Next Visit Date</label>
              <div className="d-flex">
                <input type="date" className="form-control" id="nextVisitDate" ref={nextVisitDateRef} defaultValue={item?.nextVisitDate.split("T")[0]} />
                <input type="time" className="form-control ms-1" id="nextVisitTime" ref={nextVisitTimeRef} defaultValue={item?.nextVisitDate.split("T")[1]} />
                <button className="btn btn-sm btn-primary ms-3" disabled={nextVisitDateMutation.isLoading} onClick={handleSubmitNextVisitDate} > {nextVisitDateMutation.isLoading ? "Saving..." : "Save"}</button>
              </div>
              <button className="btn btn-primary mt-3" disabled={sendEmailReminderMutation.isLoading} onClick={sendEmailReminder} > {sendEmailReminderMutation.isLoading ? "Sending..." : "Send Email Reminder"}</button>
            </div>}
          </>

          <div className="card w-100">
            <div className="card-body p-4">
              <h6 className="card-title fw-semibold mb-4 opacity-75">Follow Up Visits</h6>

              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">

                  <thead className="text-dark fs-4">
                    <tr>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">#</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Meeting Date</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Meeting Duration</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Meeting Outcome</h6>
                      </th>
                      <th className="border-bottom-0">
                        <h6 className="fw-semibold mb-0">Next Visit Date</h6>
                      </th>
                      {(userData?.staffCadre?.includes("salesPerson") && !userData?.staffCadre?.includes("supervisor")) &&
                        <th className="border-bottom-0">
                          <h6 className="fw-semibold mb-0">Actions</h6>
                        </th>}
                    </tr>
                  </thead>
                  <tbody>
                    {item.followUpVisits ? listFollowUpVisits(item.followUpVisits) : <FollowUpLoadingFallBack />}
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
                <button className="btn nav-icon-hover" disabled={commentMutation.isLoading} onClick={handleSubmit}><i className="fa-solid fa-paper-plane h1"></i></button>
              </div>
            </div>
          </div> 
        </div>
      </div>

      <ConfirmationModal title="Delete Visit Report" message="Are you sure your want to delete this visit report? This action cannot be reversed." isLoading={visitReportMutation.isLoading} onSubmit={visitReportMutation.mutate} id="deleteVisitReport" btnColor="danger" />
    </div>
  )
}

export default VisitReportItem;