"use client"

import Skeleton from '@mui/material/Skeleton';
import { getDecodedToken } from "@/services/localStorageService";
import CommentItem from "@/components/commentItem";
import { usePathname } from "next/navigation";
import useGetComments from "@/hooks/useGetComments";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useSelector } from 'react-redux';
import ConfirmationModal from '@/components/confirmationModal';
import DeleteFollowUpButton from '@/components/deleteFollowUpButton';
import moment from 'moment';
import useGetUserData from "@/hooks/useGetUserData";
import VisitReportItem from "./visitReportItem";


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

const VisitReportDetails = () => {
  const params = useParams();
  const { id } = params;
  const dispatchMessage = useDispatchMessage();
  const pathName = usePathname();
  const {userData} = useGetUserData();

  const { data, isFetching, refetch: refetchVisitReport } = useQuery({
    queryKey: ["allVisitReports"],
    queryFn: () => apiGet({ url: `/visitReport/${id}` })
      .then(res => {
        console.log(res.data)
        return res.data
      })
      .catch(error => {
        console.log(error.message)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      staleTime: Infinity,
      retry: 3
  })

  const customerQuery = useQuery({
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

  const listProductsDiscussed = (data) => {
    console.log(data)
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

  const [followUpVisits, setFollowUpVisits] = useState([]);
  const [followUpVisit, setFollowUpVisit] = useState({
    id: "",
    meetingDate: "",
    meetingDuration: "",
    meetingOutcome: ""
  })

  useEffect(() => {
    if (data) {
      setFollowUpVisits(data.followUpVisits)
    }
  }, [data])
  const [showFollowUpVisitForm, setShowFollowUpVisitForm] = useState(false)

  const [errors, setErrors] = useState({})
  /* const { refetch, comments, listComments } = useGetComments(id); */
  
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

  const followUpVisitMutation = useMutation({
    mutationFn: (data) => apiPatch({ url: `/visitReport/${id}`, data: { followUpVisits: data } })
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

  const handleChangeFollowUp = (prop) => (event) => {
    setFollowUpVisit(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const handleSubmitFollowUp = (e) => {
    e.preventDefault();
    let id = new Date().getTime();
    let followUpData = [
      ...data.followUpVisits,
      {...followUpVisit, id }
    ]
    followUpVisitMutation.mutate(followUpData);

    setFollowUpVisit(prevState => ({
      id: "",
      meetingDate: "",
      meetingDuration: "",
      meetingOutcome: ""
    }))
  }

  const handleChangeComment = (event) => {
    setCommentData(prevState => ({
      ...prevState,
      message: event.target.value
    }))
  }



  const handleSubmit = (e) => {
    e.preventDefault();
    return console.log(commentData)
    commentMutation.mutate()
  }

  useEffect(() => {
    setCommentData(prevState => ({
      ...prevState,
      senderId: userData?.id,
      receiverId: data?.employeeId,
      resourceId: id,
      resourceUrl: pathName
    }))
  }, [data, userData])

  const listFollowUpVisits = (followUpVisits) => {
    return followUpVisits.map((item, index) => {
      const { id, meetingDate, meetingDuration, meetingOutcome } = item;
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
          {(userData?.staffCadre?.includes("salesPerson") && !userData?.staffCadre?.includes("supervisor")) &&
          <td className="border-bottom-0">
            <DeleteFollowUpButton isLoading={followUpVisitMutation.isLoading} deleteFunc={()=>deleteFollowUpVisit(id)} />
          </td>}
        </tr>
      )
    })
  }

  const deleteFollowUpVisit = (id) =>{
    let followUpData = data.followUpVisits
    followUpData = followUpData.filter( item => item.id !== id);
    console.log(followUpData)
    followUpVisitMutation.mutate(followUpData);
  }

  const listVisitReports = () =>{
    return data.map( item =>{
      return (
        <VisitReportItem key={item.id} item={item} refetchVisitReport={refetchVisitReport} />
      )
    })
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Visit Reports</h4>
        <span className="breadcrumb-item ms-3"><a href="/visits"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>

      <div className="row">
        <div className="col-12 d-flex flex-column flex-column align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" >
              <h5 className="card-title fw-semibold mb-4 opacity-75">All Visit Reports for <strong className='fw-bold'>{customerQuery?.data?.companyName}</strong></h5>
              <div className="accordion" id="accordionExample">
                {data && listVisitReports()}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  )
}

export default VisitReportDetails