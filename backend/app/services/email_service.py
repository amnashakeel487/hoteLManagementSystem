from flask import current_app
from flask_mail import Message
from app import mail
import logging

logger = logging.getLogger(__name__)

def send_email(to, subject, body_text=None, body_html=None):
    """Send email using Flask-Mail"""
    try:
        msg = Message(
            subject=subject,
            recipients=[to],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        if body_text:
            msg.body = body_text
        if body_html:
            msg.html = body_html
        
        mail.send(msg)
        logger.info(f"Email sent successfully to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {str(e)}")
        return False

def send_approval_email(email, hotel_name):
    """Send hotel approval notification"""
    subject = f"✅ Your hotel '{hotel_name}' has been approved!"
    
    body_text = f"""
Congratulations! Your hotel '{hotel_name}' has been approved and is now live on Stayfolio.

You can now:
- Manage your hotel profile
- Add room categories and pricing
- Upload gallery images
- Accept booking requests
- View analytics and revenue

Log in to your dashboard to get started: [DASHBOARD_URL]

Welcome to Stayfolio!

The Stayfolio Team
"""
    
    body_html = f"""
<h2>🎉 Congratulations!</h2>
<p>Your hotel <strong>{hotel_name}</strong> has been approved and is now live on Stayfolio.</p>

<h3>What you can do now:</h3>
<ul>
    <li>✅ Manage your hotel profile</li>
    <li>🏨 Add room categories and pricing</li>
    <li>📸 Upload gallery images</li>
    <li>📅 Accept booking requests</li>
    <li>📈 View analytics and revenue</li>
</ul>

<p><a href="[DASHBOARD_URL]" style="background: #c8860d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>

<p>Welcome to Stayfolio!</p>
<p><em>The Stayfolio Team</em></p>
"""
    
    return send_email(email, subject, body_text, body_html)

def send_rejection_email(email, hotel_name, reason):
    """Send hotel rejection notification"""
    subject = f"Hotel Registration Update - '{hotel_name}'"
    
    body_text = f"""
Thank you for submitting your hotel '{hotel_name}' to Stayfolio.

Unfortunately, we need some additional information before we can approve your application:

{reason}

You can update your application and resubmit it by logging in to your account: [LOGIN_URL]

If you have any questions, please contact our support team.

The Stayfolio Team
"""
    
    body_html = f"""
<h2>Hotel Registration Update</h2>
<p>Thank you for submitting your hotel <strong>{hotel_name}</strong> to Stayfolio.</p>

<p>Unfortunately, we need some additional information before we can approve your application:</p>

<div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p style="color: #991b1b; margin: 0;"><strong>Required updates:</strong></p>
    <p style="color: #991b1b; margin: 8px 0 0;">{reason}</p>
</div>

<p>You can update your application and resubmit it by logging in to your account.</p>

<p><a href="[LOGIN_URL]" style="background: #c8860d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Update Application</a></p>

<p>If you have any questions, please contact our support team.</p>
<p><em>The Stayfolio Team</em></p>
"""
    
    return send_email(email, subject, body_text, body_html)

def send_owner_credentials(email, password, hotel_name):
    """Send login credentials to new hotel owner"""
    subject = f"Welcome to Stayfolio - Hotel '{hotel_name}' Account Created"
    
    body_text = f"""
Welcome to Stayfolio!

An account has been created for you to manage '{hotel_name}'. Here are your login credentials:

Email: {email}
Temporary Password: {password}

Please log in and change your password immediately: [LOGIN_URL]

Once logged in, you can:
- Complete your hotel profile
- Add room categories and pricing
- Upload images
- Manage bookings

If you have any questions, please contact our support team.

The Stayfolio Team
"""
    
    body_html = f"""
<h2>Welcome to Stayfolio! 🏨</h2>
<p>An account has been created for you to manage <strong>{hotel_name}</strong>.</p>

<div style="background: #f9fafb; border: 1px solid #d1d5db; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p><strong>Login Credentials:</strong></p>
    <p><strong>Email:</strong> {email}<br>
    <strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">{password}</code></p>
</div>

<p><strong>⚠️ Please log in and change your password immediately.</strong></p>

<p><a href="[LOGIN_URL]" style="background: #c8860d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In Now</a></p>

<h3>Once logged in, you can:</h3>
<ul>
    <li>✅ Complete your hotel profile</li>
    <li>🏨 Add room categories and pricing</li>
    <li>📸 Upload images</li>
    <li>📅 Manage bookings</li>
</ul>

<p>If you have any questions, please contact our support team.</p>
<p><em>The Stayfolio Team</em></p>
"""
    
    return send_email(email, subject, body_text, body_html)

def send_cleaning_request_confirmation(email, hotel_name, request_id):
    """Send cleaning request confirmation"""
    subject = f"Cleaning Request Confirmed - {hotel_name}"
    
    body_text = f"""
Your cleaning request for '{hotel_name}' has been received and confirmed.

Request ID: {request_id}
Status: Approved

A cleaning team will be assigned shortly and you will receive further details.

The Stayfolio Team
"""
    
    body_html = f"""
<h2>🧹 Cleaning Request Confirmed</h2>
<p>Your cleaning request for <strong>{hotel_name}</strong> has been received and confirmed.</p>

<div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin: 16px 0;">
    <p><strong>Request ID:</strong> {request_id}<br>
    <strong>Status:</strong> ✅ Approved</p>
</div>

<p>A cleaning team will be assigned shortly and you will receive further details.</p>

<p><em>The Stayfolio Team</em></p>
"""
    
    return send_email(email, subject, body_text, body_html)