import { useSelector } from "react-redux";
import { getDecodedToken } from "@/services/localStorageService";
import moment from "moment";
import useGetUserData from "@/hooks/useGetUserData";



const styles = {
  item: {
    width: "clamp(250px, 75%, 500px)",
  }
}

const CommentItem = ({message, sender, date }) =>{
  const {userData} = useGetUserData();
  return (
    <li style={styles.item} className={`${sender?.id === userData?.id ? "bg-primary ms-auto rounded-start rounded-top" : "bg-secondary me-auto rounded-end rounded-top"} p-3 text-white my-2`}>
      
      <span className="d-flex small">
        <span className="me-auto">{sender.firstName} {sender.lastName}</span>
        <span>{moment(date).format('lll')}</span>
      </span>
      {message}
    </li>
  )
}

export default CommentItem;