// Utility functions for notifications

// Function to send a confirmation email
function sendConfirmationEmail(to, subject, message) {
    // Simulate sending an email
    console.log(`Sending confirmation email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    // Add your email sending logic here
}

// Function to send a cancellation notice
function sendCancellationNotice(to, subject, message) {
    // Simulate sending a cancellation notice
    console.log(`Sending cancellation notice to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    // Add your email sending logic here
}

// Function to send an SMS
function sendSMS(phoneNumber, message) {
    // Simulate sending an SMS
    console.log(`Sending SMS to: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    // Add your SMS sending logic here
}

// Export the functions
export {
    sendConfirmationEmail,
    sendCancellationNotice,
    sendSMS
};