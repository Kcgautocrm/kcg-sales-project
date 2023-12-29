import { getDecodedToken } from "@/services/localStorageService";
import { apiDelete, apiGet, apiPatch } from "@/services/apiService";
import { useRouter } from "next/navigation";
import useGetNotifications from "@/hooks/useGetNotifications";
import { useRef } from "react";
import moment from "moment";
import useGetUserData from "@/hooks/useGetUserData";


const styles = {
  notificationItem: {
    padding: "15px",
    borderRadius: "15px",
    background: "#767676b6",
    cursor: "pointer",
  },
  notificationIcon: {
    fontSize: ".7rem", 
    position: "relative", 
    left: "-10px", 
    top: "-10px",
    height: "15px",
    width: "15px"
  }
}


const NotificationItem = ({ title, message, onClose, onClick, createdAt }) => {  
  return (
    <div style={styles.notificationItem} className="my-2 text-white" onClick={onClick}>
      <div className="d-flex align-items-center">
        <h6 className="m-0">{title}</h6>
        <span className="ms-auto small fst-italic">{moment(createdAt).fromNow()}</span>
        <a className="ms-3 text-danger p-2 py-1 rounded-circle" onClick={onClose} ><i className="fa-solid fa-xmark"></i></a>
      </div>
      <p className="m-0">
        {message}
      </p>
    </div>
  )
}


const AppNotifications = () => {
  const {userData} = useGetUserData()
  const {data, refetch} = useGetNotifications();
  const closeOffCanvas = useRef();
  const router = useRouter()

  const closeNotification = (notification) =>{
    let patchData = {viewed: true}
    
    if(notification?.staffCadre === "salesPerson" && notification.receiverId === null){
      let viewedBy = [...notification.viewedBy, userData?.id]
      patchData = {viewedBy}
    }
    //return console.log(patchData)
    /* apiDelete({ url: `/notification/${notification.id}`})
    .then( res => {
      console.log(res)
      refetch()
    })
    .catch( error =>{
      console.log(error)
    }) */


    apiPatch({ url: `/notification/${notification.id}`, data: patchData})
    .then( res => {
      console.log(res)
      refetch()
    })
    .catch( error =>{
      console.log(error)
    })
  }

  const listNotifications = () => {
    if (data) {
      return data.map(notification => {
        return <NotificationItem key={notification.id} message={notification.message} title={notification.title} createdAt={notification.createdAt}
          onClose={(e) => {
            e.stopPropagation()
            closeNotification(notification)
          }}

          onClick={() => {
            router.push(notification.resourceUrl);
            closeOffCanvas.current.click();
          }}
        />
      })
    }
  }

  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasExample22" aria-labelledby="offcanvasExampleLabel22">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasExampleLabel">Notifications</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" ref={closeOffCanvas}></button>
      </div>
      <div className="offcanvas-body">
        {listNotifications()}
      </div>
    </div>
  )
}


export default AppNotifications;