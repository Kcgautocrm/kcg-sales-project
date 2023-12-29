"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/services/apiService";
import { useParams } from 'next/navigation';
import useDispatchMessage from "@/hooks/useDispatchMessage";
import { useRouter } from "next/navigation";
import Compress from "react-image-file-resizer";
import generateRandomId from "@/services/generateRandomId";
import formValidator from "@/services/validation";
import useGetUserData from "@/hooks/useGetUserData";
import formatAsCurrency from "@/services/formatAsCurrency";

const EditMarketingActivity = () => {
  const params = useParams();
  const { id } = params;
  console.log(id);
  const {userData} = useGetUserData();
  const dispatchMessage = useDispatchMessage();
  const router = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["allMarketingActivities", id],
    queryFn: () => apiGet({ url: `/marketingActivity/${id}` })
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
      staleTime: Infinity
  })

  useEffect(() => {
    if (data) {
      let { employeeId, activityName, activityDate, participants, location, objective, targetResult, briefReport, images, costIncurred, pdfDetails, documents } = data;
      setFormData(prevState => ({
        ...prevState,
        employeeId, activityName, activityDate, participants, location, objective, targetResult, briefReport, images, costIncurred, pdfDetails, documents
      }))
    }
  }, [data])

  useEffect(() => {
    if (userData?.id && data) {
      if ((userData?.id !== data.employeeId) || data.approved) {
        router.push(`/marketingActivities/${id}`)
      }
    }
  }, [userData, data])


  const [formData, setFormData] = useState({
    employeeId: "",
    activityName: "",
    activityDate: "",
    participants: "",
    location: "",
    objective: "",
    targetResult: "",
    briefReport: "",
    images: [],
    documents: [],
    costIncurred: "",
    pdfDetails: ""
  })

  const [errors, setErrors] = useState({});

  const [isSendingImage, setIsSendingImage] = useState(false);
  const inputFileRef = useRef(null);
  const documentFileRef = useRef(null);
  const [ imageUrls, setImageUrls] = useState([]);


  const deleteExistingImages = (image) => (e) => {
    e.preventDefault();
    let existingImages = formData.images;
    existingImages = existingImages.filter(function (item) { return image !== item });
    setFormData(prevState => ({
      ...prevState,
      images: existingImages
    }));
  }


  const listExistingImages = () => {
    if (formData.images.length > 0) {
      return formData.images.map((img) => <li key={img} className='m-2 d-flex align-items-start'>
        <img src={img} alt="Marketing Activity Image" height="150px" />
        <button onClick={deleteExistingImages(img)} style={{ width: "20px", height: "20px", borderRadius: "14px", background: "rgba(0, 0, 0, 0.693)", position: "relative", top: "-15px", left: "-8px" }}
          className='btn d-flex align-items-center justify-content-center text-white'><i className="fa-solid fa-xmark"></i></button>
      </li>)
    }
  }

  const listExistingDocuments = ()=>{
    return formData.documents.map( (file) => <li className="my-3" key={file}> <span>{file.slice(56, file.length).replaceAll("%20", "-")}</span> <br />
      <span> 
        <a className="btn btn-link px-0" href={file} target="_blank">download</a>
        <button className="btn btn-link text-danger ms-3" onClick={()=>deleteBrochure(file)}>delete</button>
      </span> 
    </li>)
  }

  const deleteBrochure = (file) =>{
    let data = {...formData};
    data.documents = data.documents.filter(function(item){ return file !== item});
    setFormData(data);
  }




  const listNewImages = () => {
    if (imageUrls.length > 0) {
      return imageUrls.map((img) => <li key={img.id} className='m-2 d-flex align-items-start'>
        <img src={img.url} alt="Marketing Activity Image" height="150px" />
      </li>)
    }
  }

  const createImageUrls = () =>{
    const files = inputFileRef.current.files;
    if(files.length){
      const filesArray = Array.from(files);
      let urls = [];
      filesArray.forEach( file =>{
        urls.push({ id: generateRandomId(24), url: URL.createObjectURL(file) })
        setImageUrls(urls);
      })
    }else{
      setImageUrls([])
    }
  }


  const handleChange = (prop) => (event) => {
    const onlyNumbersRegex = new RegExp("^[0-9]*$");
    if((prop === "costIncurred") && !onlyNumbersRegex.exec(event.target.value)){
      return;
    }


    setFormData(prevState => ({
      ...prevState,
      [prop]: event.target.value
    }))
  }

  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMutation({
    mutationFn: (data) => apiPatch({ url: `/marketingActivity/${id}`, data })
      .then(res => {
        console.log(res.data)
        dispatchMessage({ message: res.message })
        queryClient.invalidateQueries(["allMarketingActivities", id])
        router.push(`/marketingActivities/${id}`)
      })
      .catch(error => {
        console.log(error)
        dispatchMessage({ severity: "error", message: error.message })
      }),
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors = formValidator(["activityName", "activityDate", "participants"], formData);
    if(Object.keys(errors).length){
      if(Object.keys(errors).length == 1 && errors.images && inputFileRef.current?.files.length){
        // do nothing
      }else{
        dispatchMessage({ severity: "error", message: "Some required fields are empty" })
        return setErrors(errors);
      }
    }
    let allImages = []
    if (inputFileRef.current?.files.length) {
      console.log(inputFileRef.current?.files)
      const files = inputFileRef.current.files;
      const filesArray = Array.from(files);
      setIsSendingImage(true)
      allImages = await Promise.all(
        filesArray.map( async file => await postImage(file.name.replaceAll(" ", "-"), file))
      )
    }
    let allFiles = []
    if (documentFileRef.current?.files.length) {
      console.log(documentFileRef.current.files)
      const files = documentFileRef.current.files;
      const filesArray = Array.from(files);
      allFiles = await Promise.all(
        filesArray.map( async file => await postImage(file.name.replaceAll(" ", "-"), file))
      )
    }
    setIsSendingImage(false)
    let data = {...formData};
    data.images = [...data.images, ...allImages]
    data.documents = [...data.documents, ...allFiles]
    mutate(data);
  }

  const postImage = async (filename, file) =>{
    const response = await fetch(
      `/api/v1/uploadImages?filename=${filename}`,
      {
        method: 'POST',
        body: file,
      },
    );
    const newBlob = await response.json();
    console.log(newBlob.url);
    return newBlob.url
  }




  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Marketing Activity</h4>
        <span className="breadcrumb-item ms-3"><a href="/marketingActivities"><i className="fa-solid fa-arrow-left me-1"></i> Back</a></span>
      </header>


      <div className="row">
        <div className="col-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4" style={{ maxWidth: "700px" }}>
              <h5 className="card-title fw-semibold mb-4 opacity-75">Edit Marketing Activity</h5>
              <form>
                <div className="mb-3">
                  <label htmlFor="activityName" className="form-label">Activity Name (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="text" className="form-control" id="activityName" value={formData.activityName} onChange={handleChange("activityName")} />
                  <span className='text-danger font-monospace small'>{errors.activityName}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="activityDate" className="form-label">Activity Date (<span className='fst-italic text-warning'>required</span>)</label>
                  <input type="date" className="form-control" id="activityDate" value={formData.activityDate} onChange={handleChange("activityDate")} />
                  <span className='text-danger font-monospace small'>{errors.activityDate}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="participants" className="form-label">Participants (<span className='fst-italic text-warning'>required</span>)</label>
                  <textarea rows={4} className="form-control" id="participants" value={formData.participants} onChange={handleChange("participants")}></textarea>
                  <span className='text-danger font-monospace small'>{errors.participants}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <textarea rows={4} className="form-control" id="location" value={formData.location} onChange={handleChange("location")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="objective" className="form-label">Objective</label>
                  <textarea rows={4} className="form-control" id="objective" value={formData.objective} onChange={handleChange("objective")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="targetResult" className="form-label">Target Result</label>
                  <textarea rows={4} className="form-control" id="targetResult" value={formData.targetResult} onChange={handleChange("targetResult")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="briefReport" className="form-label">Brief Report</label>
                  <textarea rows={4} className="form-control" id="briefReport" value={formData.briefReport} onChange={handleChange("briefReport")}></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="costIncurred" className="form-label">Cost Incurred <span className='ms-3 fw-bold'>{formatAsCurrency(formData.costIncurred)}</span></label>
                  <input type="text" className="form-control" id="costIncurred" value={formData.costIncurred} onChange={handleChange("costIncurred")} />
                </div>

                <div className="mb-3">
                  <label htmlFor="images" className="form-label"> Images <span className='fst-italic text-warning ms-4'>required (less than 4mb)</span></label>
                  <input className="form-control" id="images" accept="image/*" onChange={createImageUrls} ref={inputFileRef} type="file" multiple />
                  <span className='text-danger font-monospace small'>{errors.images}</span>
                  {(imageUrls.length > 0 || formData.images.length > 0) &&
                    <div>
                      <h6 className='small fw-bold mt-3'>Images</h6>
                      <div className="d-flex flex-wrap">
                        {listExistingImages()}
                        {listNewImages()}
                      </div>
                    </div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="documents" className="form-label">Documents <span className='fst-italic text-warning ms-4'>(less than 4mb)</span></label>
                  <input className="form-control" id="documents" accept=".pdf, .xlsx, .docx" ref={documentFileRef} type="file" multiple />

                  {formData.documents.length > 0 &&
                    <ul className="d-flex flex-wrap list-unstyled">
                      {listExistingDocuments()}
                    </ul>}
                </div>

                <button type="submit" className="btn btn-primary mt-3 px-5 py-2" disabled={isSendingImage || isLoading} onClick={handleSubmit}>{(isSendingImage || isLoading) ? "Loading..." : "Submit"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMarketingActivity