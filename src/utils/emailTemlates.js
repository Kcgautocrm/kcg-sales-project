
export function accountCreationTemp ({firstName, middleName, lastName, email, password = "password1234"}) {
  return  `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
      <h1>${process.env.COMPANY_NAME} Account Creation Notification</h1>
      <p>
        Hello <b>${firstName} ${middleName} ${lastName}</b> <br /> <br />
        This is to hereby inform you that an employee account has been opened in your name.
      </p>
      <p>
          <h5>The login details are found below</h5>
          <span>Email: <b>${email}</b> </span> <br />
          <span>Password: <b>${password}</b> </span> <br />
      </p>
      <a
      href="${process.env.BASE_URL}/login"
      target="_blank"
      style="display: block; width: 250px; border-radius: 25px; border: 1px solid #1942D8; background: #1942D8; color: white; margin: 30px auto; text-align: center; padding: 15px 0px">
      Login
      </a>
      <p style="line-height: 1.3rem;">
      Thanks <br />
      <em>${process.env.COMPANY_NAME}</em>
      </p>
  </div>
  `
}

export function resetPasswordTemp ({token, firstName, middleName, lastName,}) {
  return  `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
      <h1>${process.env.COMPANY_NAME} Reset Password Email</h1>
      <p>
        Hello <b>${firstName} ${middleName} ${lastName}</b> <br /> <br />
        This is a reset password email. If you did not initiate this please ignore it and do not forward to anyone <br />
      </p>
      <p>
          Click on the reset password button to reset your password
      </p>
      <a
      href="${process.env.BASE_URL}/resetPassword?token=${token}"
      target="_blank"
      style="display: block; width: 250px; border-radius: 25px; border: 1px solid #1942D8; background: #1942D8; color: white; margin: 30px auto; text-align: center; padding: 15px 0px">
      Reset Password
      </a>
      <p style="line-height: 1.3rem;">
      Thanks <br />
      <em>${process.env.COMPANY_NAME}</em>
      </p>
  </div>
  `
}

export function customerMeetingReminderTemp ({customerName, contactPersonName, employeeName, visitDate, message}) {
  return  `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
      <h1>${process.env.COMPANY_NAME} Visit Appointment Reminder Email</h1>
      <p>
        Hello <b>${contactPersonName} of ${customerName} </b> <br /> <br />
        This is to remind you of your visit with ${employeeName} on ${visitDate} <br />
      </p>
      <p>
          ${message}
      </p>
      <p style="line-height: 1.3rem;">
      Thanks <br />
      <em>${process.env.COMPANY_NAME}</em>
      </p>
  </div>
  `
}