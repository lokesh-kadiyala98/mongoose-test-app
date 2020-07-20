const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'lokesh.pandu1998@gmail.com',
        subject: 'Welcome to byteBlog',
        text: `Welcome to byteBlog: A byte sized blog. ${name} hope you have a nice experience.`
    })
}

const sendExitEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'lokesh.pandu1998@gmail.com',
        subject: 'Bye! Bye!',
        text: `We are sorry to see you leave byteBlog: A byte sized blog. ${name} is there anything to make your experience better.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendExitEmail
}