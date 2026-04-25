const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin"); // Required to look up other documents
admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gordoncollege.edu.ph',
        pass: 'your-16-character-app-password'
    }
});

exports.notifyReporterOfClaim = onDocumentCreated("claims/{claimId}", async (event) => {
    const claimData = event.data.data(); // This is the Claimant's info
    const itemId = claimData.itemId;

    // 1. Look up the original item to find the Reporter's email
    const itemRef = admin.firestore().doc(`items/${itemId}`);
    const itemSnap = await itemRef.get();
    const itemData = itemSnap.data();

    if (!itemSnap.exists) return; // Item doesn't exist? Exit.

    // 2. Prepare the Email
    const mailOptions = {
        from: 'CEAS Find System <no-reply@ceasfind.com>',
        to: itemData.reporterEmail, // The email of the person who posted the item
        subject: `New Claim Attempt for: ${itemData.title}`,
        text: `A user is trying to claim your item!
               
               User: ${claimData.claimantName}
               Secret Detail Verification Guess: "${claimData.claimantSecretGuess}"
               
               If this matches your secret detail, please contact them!`
    };

    // 3. Send
    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to reporter.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
});