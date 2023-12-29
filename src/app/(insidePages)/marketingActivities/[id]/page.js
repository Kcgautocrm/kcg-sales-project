"use client"

import useDispatchMessage from "@/hooks/useDispatchMessage";
import Skeleton from '@mui/material/Skeleton';
import { getDecodedToken } from "@/services/localStorageService";
import CommentItem from "@/components/commentItem";
import { usePathname } from "next/navigation";
import useGetComments from "@/hooks/useGetComments";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/services/apiService";
import { useParams, useRouter } from 'next/navigation';
import moment from "moment";
import useGetUserData from "@/hooks/useGetUserData";
import ConfirmationModal from "@/components/confirmationModal";
import { Modal, ClickAwayListener } from "@mui/material";
import formatAsCurrency from "@/services/formatAsCurrency";


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

const MarketingActivityDetails = () => {
  const params = useParams();
  const {id} = params;
  const router = useRouter();
  const closeDeleteMarketingActivityModal = useRef();
  console.log(id);
  const dispatchMessage = useDispatchMessage();
  const {userData} = useGetUserData();
  const pathName = usePathname();
  const {refetch, comments, listComments} = useGetComments(id);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {data, isFetching} = useQuery({
    queryKey: ["allMarketingActivities", id],
    queryFn: () => apiGet({ url: `/marketingActivity/${id}`})
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

  const deleteMarketingActivity = useMutation({
    mutationFn: () => apiDelete({ url: `/marketingActivity/${id}`})
    .then(res =>{
      console.log(res.data)
      dispatchMessage({ message: "Marketing Activity deleted successfully"})
      closeDeleteMarketingActivityModal.current.click();
      router.push("/marketingActivities")
    })
    .catch(error =>{
      console.log(error.message)
      dispatchMessage({ severity: "error", message: error.message})
      closeDeleteMarketingActivityModal.current.click();
    })
  }) 

  const listImages = () => {
    return data.images.map(image => {
      return <img key={image} src={image} onClick={handleOpen} style={{cursor: "pointer"}} height="150px" className="p-3 rounded-3" alt="Product Image" />
    })
  }

  const listDocuments = () =>{
    return data.documents.map(file => {
      return <li className=" my-3" key={file}> <span>{file.slice(56, file.length).replaceAll("%20", "-")}</span> <br /> <a className="btn btn-link px-0" href={file} target="_blank">download</a></li>
    })
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
            aria-current={`${index === 0 ? "true" : ""}`}
            aria-label={`Slide ${index}`}
          />
        )
      })
    }
  }



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

  const handleSubmit = (e)=>{
    e.preventDefault();
    // return console.log(commentData)
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
  },[data])


  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Marketing Activity</h4>
        <span className="breadcrumb-item ms-3"><a href="/marketingActivities"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
        {userData?.id === data?.employeeId && <a className="btn btn-link text-primary ms-auto" href={`/marketingActivities/${id}/edit`}>Edit</a>}
        {userData?.id === data?.employeeId && <a className="btn btn-link text-danger ms-2" data-bs-toggle="modal" data-bs-target="#deleteMarketingActivity">Delete</a>}
      </header>


      <div className="row">
        <div className="col-12 d-flex flex-column align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Marketing Activity Details</h5>

              {data ?
                <>
                  <DataListItem title="Employee Name" value={`${data.employee.firstName} ${data.employee.lastName}`} />
                  <DataListItem title="Activity Name" value={data.activityName} />
                  <DataListItem title="Activity Date" value={data.activityDate} />
                  <DataListItem title="Participants" value={data.participants} />
                  <DataListItem title="Location" value={data.location} />
                  <DataListItem title="Objective" value={data.objective} />
                  <DataListItem title="Target Result" value={data.targetResult} />
                  <DataListItem title="Brief Report" value={data.briefReport} />
                  <DataListItem title="Cost Incurred" value={formatAsCurrency(data.costIncurred)} />
                  <DataListItem title="Approved" value={data.approved ? "Yes" : "No"} />
                  <div className="mb-3 d-flex flex-column">
                    <h6 className="m-0 me-3">Pictures</h6>
                    <figure>
                      {listImages()}
                    </figure>
                  </div>
                  <div className="mb-3 d-flex flex-column">
                    <h6 className="m-0 me-3 mb-2">Documents</h6>
                    <ul>
                      {listDocuments()}
                    </ul>
                  </div>
                  <DataListItem title="Created On" value={moment(data.createdAt).format('MMMM Do YYYY, h:mm:ss a')} />
                  <DataListItem title="Last Updated" value={moment(data.updatedAt).format('MMMM Do YYYY, h:mm:ss a')} />
                </> :
                <LoadingFallBack />
              }
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

      <ConfirmationModal title="Delete Marketing Activity" message="Are you sure your want to delete this marketing activity?" isLoading={deleteMarketingActivity.isLoading} onSubmit={deleteMarketingActivity.mutate} id="deleteMarketingActivity" btnColor="danger" closeButtonRef={closeDeleteMarketingActivityModal} />
    </div>
  )
}

export default MarketingActivityDetails