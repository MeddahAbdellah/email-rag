const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const { OpenAI } = require('openai');
const nodemailer = require('nodemailer');
const sendmail = require('sendmail')({
    smtpPort: 587,
    logger: {
      debug: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    }
});

const client = new OpenAI({
    apiKey: "",
});
// Storage for CC'd emails
let storedEmails = [];

console.log("SMTP Server Started");

// Create SMTP server
const server = new SMTPServer({
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(async (parsed) => {
        console.log('Email parsed:', parsed);
        const { to, cc, text, from, subject } = parsed;
        const isDirect = to.value.some(address => address.address === 'ai@ylliops.com');
        const isCC = cc && cc.value.some(address => address.address === 'ai@ylliops.com');
        console.log({ isDirect, isCC });
        if (isCC && !isDirect) {
            storedEmails.push({
                text,
                from: from.value[0].address,
                cc: cc ? cc.value.map(address => address.address) : [],
                subject
              });
          console.log('Email stored:', text);
        } else if (isDirect) {
            const query = `Given all these previous interactions \\n ${storedEmails.map(email => `From: ${email.from}, CC: ${email.cc.join(', ')}, Subject: ${email.subject}, Text: ${email.text}`).join('\\n')}\\n\\n answer the following question ${text}`;
            const response = getChatGPTResponse(query).then(async (response) => {        
            // Setup response email
            let mailOptions = {
                from: '"AI Assistant" <ai@ylliops.com>',
                to: parsed.from.value[0].address,
                subject: `Re: ${parsed.subject}`,
                text: response
            };

            console.log('Sending response email:', mailOptions);
            // sendmail(mailOptions, (err, info) => {
            //     console.log({err, info});
            // });

            let transporter = nodemailer.createTransport({
              service: 'gmail', // e.g., 'gmail'
              auth: {
                user: 'meddah.abdellah.tcfso@gmail.com',
                pass: 'mdfx sxqe djdg ysbq',
              },
            });
          
            let info = await transporter.sendMail(mailOptions);

            console.log("Message sent: ", { info });
        

            storedEmails = [];
            });

        }
      })
      .catch(err => console.error('Error parsing email:', err))
      .finally(() => callback());
  },
  onAuth(auth, session, callback) {
    // Accept all authentications
    callback(null, { user: 'user' });
  },
  disabledCommands: ['STARTTLS', 'AUTH']
});


// Start the server
server.listen(25, () => {
  console.log('SMTP server is listening on port 25');
});

// Function to get response from ChatGPT
async function getChatGPTResponse(query) {
  try {
    const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: query }],
        model: 'gpt-4o',
      });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error getting response from ChatGPT:', error);
    return 'Error processing request';
  }
}
