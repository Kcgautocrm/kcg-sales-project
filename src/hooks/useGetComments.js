import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/apiService";
import { getDecodedToken } from "@/services/localStorageService";
import CommentItem from "@/components/commentItem";


const useGetComments = (id) =>{
  
  const commentQuery = useQuery({
    queryKey: ["allComments", id],
    queryFn: () => apiGet({ url: `/comment?resourceId=${id}` })
      .then(res => {
        return res.data
      })
      .catch(error => {
        console.log(error)
        return []
      }),
      refetchInterval: 5000,
      refetchIntervalInBackground: true
  })

  const listComments = ()=>{
    if(commentQuery?.data){
      return commentQuery.data.map( item =>{
        return (
          <CommentItem key={item.id} message={item.message} sender={item.sender} date={item.createdAt} />
        )
      })
    }
  }

  return {comments: commentQuery.data, refetch: commentQuery.refetch, listComments}
}

export default useGetComments;