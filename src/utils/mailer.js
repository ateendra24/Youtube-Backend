import nodemailer from "nodemailer";

export const sendEmail = async ({ email, otp }) => {
    const date = new Date();
    try {

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: "aps@aps.com",
            to: email,
            subject:
                "Verify your email",
            html:
                `
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding-bottom: 20px;">
            <h2>OTP Verification</h2>
        </div>
        <div style="font-size: 16px; line-height: 1.5;">
            <p>Dear ${email},</p>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>
            <p>Please enter this code to verify your account. The OTP is valid for the next 5 minutes only.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
            <p>&copy;  ${date.getFullYear()} Video. All Rights Reserved.</p>
        </div>
    </div>
</body>    `,
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;
    } catch (error) {
        throw new error.message;
    }
};
