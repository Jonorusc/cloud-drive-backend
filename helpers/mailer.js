const nodemailer = require('nodemailer'),
    { google } = require('googleapis'),
    { OAuth2 } = google.auth,
    Oauth_link = 'https://developers.google.com/oauthplayground',
    { EMAIL, MAILING_ID, MAILING_SECRET, MAILING_REFRESH } = process.env,
    auth = new OAuth2(MAILING_ID, MAILING_SECRET, MAILING_REFRESH, Oauth_link)

exports.sendEmailVerification = (email, name, url) => {
    auth.setCredentials({
        refresh_token: MAILING_REFRESH,
    })
    const accessToken = auth.getAccessToken(),
        stmp = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: EMAIL,
                clientId: MAILING_ID,
                clientSecret: MAILING_SECRET,
                refreshToken: MAILING_REFRESH,
                accessToken,
            }
        }),
        mailOptions = {
            form: EMAIL,
            to: email,
            subject: 'Cloud Drive email verification',
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cloud Drive Mailing</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"><style>body{background-color:#eee;display:grid;place-items:center}.wrap{width:300px;background-color:#fff;padding:1rem;box-sizing:border-box;display:grid;row-gap:2rem;justify-content:center;place-items:center;border-radius:10px}h1>i{color:#6986a5;font-weight:600}h1{letter-spacing:-1px;color:#6986a5}p{font-size:24px}a{background-color:#6986a5;border:none;border-radius:5px;height:54px;width:100%;font-size:16px;text-transform:uppercase;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;column-gap:1rem;text-decoration:none;margin-bottom:2rem}a:active{background-color:#6986A590}</style></head><body><h1><i class="fa-solid fa-envelope"></i>Cloud Drive<div class="wrap"><div><h2>Hello! ${name}</h2><p>Your account was created. Now we need you to activate it and enjoy everything about<strong>Cloud Drive</strong>.<br><br><small>Click on the link below to activate</small></p></div><i class="fa-solid fa-caret-down"></i><a href="${url}">Activate my account</a></div></body></html>`, 
            //mail.html.min
        }
    stmp.sendMail(mailOptions, (err, res) => {
        if(err) return err
        ;return res
    })    
}