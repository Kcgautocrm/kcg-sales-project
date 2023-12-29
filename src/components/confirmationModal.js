
import { useRef } from "react";

const ConfirmationModal = ({title, message, onSubmit, isLoading, id, btnColor="primary", closeButtonRef}) => {

  return (
    <div className="modal fade" id={id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">{title}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {message}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" ref={closeButtonRef} data-bs-dismiss="modal">Close</button>
            <button type="button" className={`btn btn-${btnColor}`} disabled={isLoading} onClick={() => {
              onSubmit();
              }}>{isLoading ? "Loading..." : "Proceed"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default ConfirmationModal