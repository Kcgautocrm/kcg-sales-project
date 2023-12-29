
import { Avatar, List } from "@mui/material";
import useGetUserData from "@/hooks/useGetUserData";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useEffect } from "react";

const SubordinateItem = ({firstName="Daniel", lastName="Nwokocha", email="daniel@email.com", }) =>{

  return(
    <li className="card1 d-flex align-items-center py-2">
      <Avatar />
      <div className="d-flex flex-column ms-3">
        <h6 className="mb-0">{firstName} {lastName}</h6>
        <span className="text-muted">{email}</span>
      </div>
      <i className="fa-solid fa-arrow-right-long ms-auto"></i>
    </li>
  )
}
const ListOfSubordinates = ({title, pathname}) =>{
  const {userData} = useGetUserData();
  const dispatchMessage = useDispatchMessage();

  const subordinateQuery = useQuery({
    queryKey: ["allSubordinates"],
    queryFn: () => apiGet({ url: `/employee/subordinates/${userData?.id}` })
      .then(res => {
        console.log(res)
        return res.data
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
        return []
      }),
      enabled: false,
  })

  useEffect(()=>{
    if(userData?.id){
      subordinateQuery.refetch()
    }
  }, [userData])


  const listOfSubordinateItems = () =>{
    if(subordinateQuery.data){
      return subordinateQuery.data.map( item => {
        return <a key={item.id} href={`?employeeId=${item.id}`} className="card px-3 mb-2"  style={{maxWidth: "700px"}}>
          <SubordinateItem firstName={item.firstName} lastName={item.lastName} email={item.email} />
        </a>
      })
    }
  }

  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0 text-capitalize">{title}</h4>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <p className="fw-semibold mb-4 opacity-75">Click on a subordinate to view his/her <span className="text-lowercase">{title} </span></p>

              <ul className="list-unstyled">
                {listOfSubordinateItems()}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListOfSubordinates;