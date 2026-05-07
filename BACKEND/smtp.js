const EMAILJS_SERVICE_ID  = "service_4e5rf77";   // replace
const EMAILJS_TEMPLATE_ID = "template_t8kx3lc";  // replace
const EMAILJS_PUBLIC_KEY  = "yx44_aLwNAioaVDdM";   // replace

/**
 * Sends a claim notification email to the item reporter.
 *
 * @param {string} claimantName   - Full name of the person claiming the item
 * @param {string} claimantEmail  - Email of the claimant (used for Reply-To)
 * @param {string} itemName       - Name/title of the item being claimed
 * @param {string} secretDetail   - The proof of ownership description
 * @param {string} toEmail        - Reporter's email (recipient)
 * @returns {Promise}
 */

export async function sendClaimNotification(
  claimantName,
  claimantEmail,
  itemName,
  secretDetail,
  toEmail
) {
  const templateParams = {
    to_email:       toEmail,
    claimant_name:  claimantName,
    claimant_email: claimantEmail,
    item_name:      itemName,
    secret_detail:  secretDetail,
  };

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY
  );
}