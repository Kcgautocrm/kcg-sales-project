import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/services/apiService";
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";


const ChangePassword = () =>{
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const {isLoading, mutate} = useMutation({
    mutationFn: ()=>apiPost({ url: "/auth/newPassword", data: formData})
    .then( res =>{
      console.log(res)
      dispatchMessage({ message: res.message})
    })
    .catch(error =>{
      console.log(error)
      dispatchMessage({severity: "error", message: error.message})
    }),
  })

  const handleChange = (prop) => (event) => {
    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    mutate();
  }

  return(
    <div>
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Change Password</h4>
        <div className="close-btn d-block sidebartoggler cursor-pointer ms-auto" id="sidebarCollapse" data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="ti ti-x fs-6"></i>
        </div>
      </header>

      <form>
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">Password</label>
          <input type="text" className="form-control" id="oldPassword" value={formData.oldPassword} onChange={handleChange("oldPassword")} />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input type="text" className="form-control" id="newPassword" value={formData.newPassword} onChange={handleChange("newPassword")} />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input type="text" className="form-control" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} />
        </div>

        <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isLoading} onClick={handleSubmit}>{isLoading ? "Loading..." : "Submit"}</button>
      </form>
    </div>
  )
}

export default ChangePassword