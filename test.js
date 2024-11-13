const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
let transporter = nodemailer.createTransport({
  host: 'localhost', // Assuming your SMTP server is running locally
  port: 25,          // The port your SMTP server is listening on
  secure: false,     // Use TLS (true) or not (false)
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Setup email data
let mailOptions1 = {
  from: '"Test Sender" <sender@example.com>', // Sender address
  to: 'ddsd@qsd.com',         // List of receivers
  cc: 'ai@ylliops.com',                       // CC address
  subject: 'Test Email',                      // Subject line
  text: `
  Here is a list of names and emails:
    - Alice (alice@example.com)
    - Bob (bob@example.com)
    - Charlie (charlie@example.com)
`
};

let mailOptions2 = {
    from: '"Test Sender" <sender@example.com>', // Sender address
    to: 'ai@ylliops.com',         // List of receivers
    subject: 'Test Email',                      // Subject line
    text: 'Create an excel from the pervious names and emails list'        // Plain text body
  };
  

// Send mail with defined transport object
transporter.sendMail(mailOptions1, (error, info) => {
  if (error) {
    return console.log('Error sending email:', error);
  }
  console.log('Message sent:', info.messageId);
  transporter.sendMail(mailOptions2, (error, info) => {
    if (error) {
      return console.log('Error sending email:', error);
    }
    console.log('Message sent:', info.messageId);
  });
});

