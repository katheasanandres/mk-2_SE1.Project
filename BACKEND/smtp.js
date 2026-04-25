// BACKEND/smtp.js
export function sendClaimNotification(claimantName, itemName, secretDetail, reporterEmail) {
    const templateParams = {
        claimant_name: claimantName,
        item_name: itemName,
        secret_detail: secretDetail,
        to_email: reporterEmail 
    };

    // Use your Service ID and Template ID from the EmailJS dashboard
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
        .then(function(response) {
           console.log("SUCCESS!", response.status);
           alert("Notification sent to the reporter!");
        }, function(error) {
           console.log("FAILED...", error);
        });
}