/**
 * OTP Email Template
 */
exports.otpEmailTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .otp-box {
                background: white;
                border: 2px dashed #667eea;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
                border-radius: 8px;
            }
            .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛒 Shopping Cart</h1>
            </div>
            <div class="content">
                <h2>Hello ${name}! 👋</h2>
                <p>Thank you for registering with Shopping Cart. To complete your registration, please verify your email address.</p>
                
                <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code:</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">This code will expire in 10 minutes</p>
                </div>
                
                <p><strong>Security Tips:</strong></p>
                <ul>
                    <li>Never share this OTP with anyone</li>
                    <li>Our team will never ask for your OTP</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
                
                <p>Best regards,<br>Shopping Cart Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Welcome Email Template
 */
exports.welcomeEmailTemplate = (name) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Shopping Cart!</h1>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Your account has been successfully created and verified. You can now enjoy shopping with us!</p>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>Browse our amazing products</li>
                    <li>Add items to your cart</li>
                    <li>Complete your profile</li>
                    <li>Start shopping!</li>
                </ul>
                
                <p>Happy Shopping! 🛍️</p>
                <p>Best regards,<br>Shopping Cart Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
};