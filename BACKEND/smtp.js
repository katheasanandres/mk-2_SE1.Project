export function sendClaimNotification(claimantName, claimantEmail, itemName, secretDetail, reporterEmail) {
    
    const templateParams = {
        claimant_name: claimantName,
        claimant_email: claimantEmail,
        item_name: itemName,
        secret_detail: secretDetail,
        to_email: reporterEmail 
    };

    const SERVICE_ID = "YOUR_SERVICE_ID"; 
    const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
    const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}