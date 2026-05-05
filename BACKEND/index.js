const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin"); 
admin.initializeApp();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gordoncollege.edu.ph', 
        pass: 'your-16-character-app-password' // Still required to "prove" who is sending
    }
});

// Trigger: When a claim is submitted
exports.notifyReporterOfClaim = onDocumentCreated("claims/{claimId}", async (event) => {
    const claimData = event.data.data(); // This has the claimant's secret guess
    const itemId = claimData.itemId; 

    // 1. Fetch the original item post to get the reporter's contact email
    const itemRef = admin.firestore().doc(`items/${itemId}`);
    const itemSnap = await itemRef.get();
    
    if (!itemSnap.exists) {
        console.log("Item not found");
        return;
    }

    const itemData = itemSnap.data();

    // 2. Send the SMTP email to the REPORTER
    const mailOptions = {
        from: 'CEAS Find System <no-reply@ceasfind.com>',
        to: itemData.reporterEmail, // This email comes from the item post
        subject: `Verification Request: Someone is claiming your item!`,
        text: `Hello! A user named ${claimData.claimantName} is trying to claim your missing item.
               
               They provided the following secret detail: "${claimData.claimantSecretGuess}"
               
               Please log in to the portal to verify if this matches your records.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to reporter.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
});