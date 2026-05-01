/**
 * Sends a claim notification to the person who reported the item.
 * @param {string} claimantName - Name of the person claiming the item.
 * @param {string} itemName - Name of the item being claimed.
 * @param {string} secretDetail - The "Proof of Ownership" provided by the claimant.
 * @param {string} reporterEmail - The email address of the original finder/reporter.
 */
export function sendClaimNotification(claimantName, itemName, secretDetail, reporterEmail) {
    
    // These keys must match the {{variable_names}} in your EmailJS Template
    const templateParams = {
        claimant_name: claimantName,
        item_name: itemName,
        secret_detail: secretDetail,
        to_email: reporterEmail 
    };

    // Replace with your actual IDs from the EmailJS Dashboard
    const SERVICE_ID = "your_service_id"; 
    const TEMPLATE_ID = "your_template_id";

    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then((response) => {
           console.log("Email sent successfully!", response.status, response.text);
           return { success: true };
        })
        .catch((error) => {
           console.error("Email failed to send:", error);
           throw error;
        });
}