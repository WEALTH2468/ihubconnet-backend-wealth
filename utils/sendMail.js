const nodemailer = require("nodemailer");
// const transporter=require("../websocket");

async function sendMail(option) {
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            // secure: true,
            auth: {
              user: "izone5.media@gmail.com",
              pass: "niwlnbyxupfhcpmm"
            },
            tls: {
                rejectUnauthorized: false
            }
          });

        await transporter.sendMail({
            from: "izone5.media@gmail.com",
            to: option.email,
            subject: option.subject,
            text: option.message
        });

        console.log("Email sent to user successfully")

    }
    catch (err) {
        console.log(err)
        console.log("Email not sent")

    }
};

module.exports = {sendMail};