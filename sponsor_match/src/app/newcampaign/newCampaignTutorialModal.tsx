"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";

type NewCampaignTutorialModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewCampaignTutorialModal({
  open,
  onClose,
}: NewCampaignTutorialModalProps) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

   return (
     <div className="nc-tutorial-modal-overlay" role="dialog" aria-modal="true">
       <div className="nc-tutorial-modal">
         <div className="nc-tutorial-modal-top">
           <h2 className="nc-tutorial-modal-title">How to create your campaign</h2>
           <button
                type="button"
                className="nc-tutorial-modal-close"
                aria-label="Close tutorial"
                onClick={onClose}
           >
             <FontAwesomeIcon
               icon={faXmark}
               className="nc-tutorial-modal-close-icon"
             />
           </button>
         </div>

         <div className="nc-tutorial-modal-content">
           <div className="nc-tutorial-video">
             <div className="nc-tutorial-video-placeholder">
               Tutorial video will appear here (future upload/embed)
             </div>
           </div>

           <div className="nc-tutorial-transcript">
             <h3 className="nc-tutorial-transcript-title">Transcript (optional)</h3>
             <div className="nc-tutorial-transcript-box">
               Text/transcript will appear here when available.
             </div>
           </div>
         </div>

         <div className="nc-tutorial-modal-actions">
           <button type="button" className="nc-btn nc-btn-primary" onClick={onClose}>
             Got it, start creating
           </button>
         </div>
       </div>
     </div>
   );
 }

