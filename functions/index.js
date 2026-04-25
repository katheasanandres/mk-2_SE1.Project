const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");

// 1. Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gordoncollege.edu.ph', // Your official email
        pass: 'your-16-character-app-password'   // Use an App Password, NOT your normal password
    }
});

// 2. The Trigger: This function runs automatically whenever a new 'items' document is created
exports.sendEmailNotification = onDocumentCreated("items/{itemId}", async (event) => {
    const snapshot = event.data;
    const itemData = snapshot.data();

    // 3. Define the email content
    const mailOptions = {
        from: 'CEAS Find System <no-reply@ceasfind.com>',
        to: 'admin@gordoncollege.edu.ph', 
        subject: `New Posting: ${itemData.title || 'Unknown Item'}`,
        text: `A new item has been posted! 
               Category: ${itemData.category || 'N/A'}
               Description: ${itemData.description || 'No description provided.'}
               Please check the portal to review the listing.`
    };

    // 4. Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email notification sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
});