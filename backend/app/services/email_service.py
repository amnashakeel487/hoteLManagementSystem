import os
import threading
import logging
from flask import current_app, render_template

logger = logging.getLogger(__name__)

def _send_async_task(app, to, subject, body_text, body_html):
    """Background worker to send email without blocking the HTTP request."""
    with app.app_context():
        try:
            # 1. Try Resend if API key is provided
            resend_api_key = os.environ.get('RESEND_API_KEY') or app.config.get('RESEND_API_KEY')
            if resend_api_key:
                try:
                    import urllib.request
                    import json
                    
                    sender = app.config.get('MAIL_DEFAULT_SENDER') or 'Stayfolio <noreply@stayfolio.com>'
                    payload = {
                        "from": sender,
                        "to": [to] if isinstance(to, str) else to,
                        "subject": subject,
                        "html": body_html,
                        "text": body_text
                    }
                    req = urllib.request.Request(
                        "https://api.resend.com/emails",
                        data=json.dumps(payload).encode('utf-8'),
                        headers={
                            "Authorization": f"Bearer {resend_api_key}",
                            "Content-Type": "application/json",
                            "User-Agent": "Stayfolio-Flask/1.0"
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        if resp.status in (200, 201):
                            logger.info(f"Email sent via Resend to {to}")
                            return True
                except Exception as resend_err:
                    logger.warning(f"Resend send failed, falling back to Flask-Mail: {resend_err}")

            # 2. Try Flask-Mail / SMTP
            from app import mail
            from flask_mail import Message

            msg = Message(
                subject=subject,
                recipients=[to] if isinstance(to, str) else to,
                sender=app.config.get('MAIL_DEFAULT_SENDER', 'noreply@stayfolio.com')
            )
            if body_text:
                msg.body = body_text
            if body_html:
                msg.html = body_html

            mail.send(msg)
            logger.info(f"Email sent successfully via Flask-Mail to {to}")
            return True
        except Exception as e:
            # Always catch and log so failures NEVER break the user's workflow
            logger.error(f"Email delivery failed to {to} ({subject}): {str(e)}")
            return False

def send_email_async(to, subject, body_text=None, body_html=None):
    """
    Non-blocking email dispatcher.
    Spawns a background thread with the current Flask app context.
    """
    if not to:
        return False

    try:
        app = current_app._get_current_object()
        thread = threading.Thread(
            target=_send_async_task,
            args=(app, to, subject, body_text or "", body_html or body_text or "")
        )
        thread.daemon = True
        thread.start()
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch async email to {to}: {str(e)}")
        return False

def _get_base_url():
    """Resolve base frontend URL from environment or configuration."""
    return os.environ.get('FRONTEND_URL') or os.environ.get('APP_URL') or 'https://hotel-management-system.vercel.app'

# ============================================================================
# EVENT 1: Admin creates a hotel + owner account directly (Option 1 onboarding)
# ============================================================================
def send_owner_welcome_email(email, temp_password, hotel_name, login_url=None):
    """
    Trigger: After admin successfully creates a hotel and generates an owner account.
    Recipient: New hotel owner.
    """
    base_url = _get_base_url()
    login_url = login_url or f"{base_url}/login"
    subject = f"Welcome to Stayfolio — Account Created for '{hotel_name}'"

    body_text = f"""Welcome to Stayfolio!

An account has been created for you to manage '{hotel_name}'.

Your Login Credentials:
Email: {email}
Temporary Password: {temp_password}

Please log in and update your password immediately:
{login_url}

The Stayfolio Team
"""

    try:
        body_html = render_template(
            'emails/owner_welcome.html',
            email=email,
            temp_password=temp_password,
            hotel_name=hotel_name,
            login_url=login_url
        )
    except Exception as render_err:
        logger.warning(f"Template rendering failed, using fallback HTML: {render_err}")
        body_html = f"""<h2>Welcome to Stayfolio!</h2>
<p>An account has been created for you to manage <strong>{hotel_name}</strong>.</p>
<p><strong>Email:</strong> {email}<br><strong>Temporary Password:</strong> <code>{temp_password}</code></p>
<p><a href="{login_url}">Log in to Owner Dashboard</a></p>"""

    return send_email_async(email, subject, body_text, body_html)

# ============================================================================
# EVENT 2: New hotel registration request submitted (Option 2 — self-registration)
# ============================================================================
def send_admin_new_registration_notification(hotel_data, review_url=None):
    """
    Trigger: After hotel registration endpoint creates a hotel with status='pending'.
    Recipient: Admin email address (MAIL_ADMIN_ADDRESS or ADMIN_EMAIL).
    """
    base_url = _get_base_url()
    review_url = review_url or f"{base_url}/admin"
    admin_email = os.environ.get('MAIL_ADMIN_ADDRESS') or os.environ.get('ADMIN_EMAIL') or 'admin@stayfolio.com'
    
    hotel_name = hotel_data.get('name', 'New Property')
    owner_email = hotel_data.get('email', 'N/A')
    city = hotel_data.get('city', 'N/A')
    country = hotel_data.get('country', 'N/A')
    business_name = hotel_data.get('business_name', '')
    category = hotel_data.get('category', 'Hotel')
    room_count = hotel_data.get('room_count', '')

    subject = f"🔔 New Hotel Registration: {hotel_name} ({city}, {country})"

    body_text = f"""New Hotel Registration Request Submitted

Hotel Name: {hotel_name}
Business: {business_name}
Owner Email: {owner_email}
Location: {city}, {country}
Category: {category} ({room_count} rooms)

Review this application in the Admin Console:
{review_url}
"""

    try:
        body_html = render_template(
            'emails/admin_new_registration.html',
            hotel_name=hotel_name,
            business_name=business_name,
            owner_email=owner_email,
            city=city,
            country=country,
            category=category,
            room_count=room_count,
            review_url=review_url
        )
    except Exception as render_err:
        logger.warning(f"Template rendering failed, using fallback HTML: {render_err}")
        body_html = f"""<h2>New Hotel Registration</h2>
<p><strong>Hotel:</strong> {hotel_name}<br><strong>Location:</strong> {city}, {country}<br><strong>Contact:</strong> {owner_email}</p>
<p><a href="{review_url}">Open Admin Review Panel</a></p>"""

    return send_email_async(admin_email, subject, body_text, body_html)

# ============================================================================
# EVENT 3: Hotel approved
# ============================================================================
def send_hotel_approved_email(email, hotel_name, dashboard_url=None):
    """
    Trigger: After admin approves a hotel (status -> 'approved').
    Recipient: Hotel owner.
    """
    base_url = _get_base_url()
    dashboard_url = dashboard_url or f"{base_url}/owner"
    subject = f"✅ Your hotel '{hotel_name}' has been approved on Stayfolio!"

    body_text = f"""Congratulations!

Your hotel '{hotel_name}' has been approved and is now live on Stayfolio.
Your rooms, pricing, and guest bookings are now active.

Access your dashboard:
{dashboard_url}

The Stayfolio Team
"""

    try:
        body_html = render_template(
            'emails/hotel_approved.html',
            hotel_name=hotel_name,
            dashboard_url=dashboard_url
        )
    except Exception as render_err:
        logger.warning(f"Template rendering failed, using fallback HTML: {render_err}")
        body_html = f"""<h2>🎉 Congratulations!</h2>
<p>Your hotel <strong>{hotel_name}</strong> has been approved and is now live on Stayfolio.</p>
<p><a href="{dashboard_url}">Open Owner Dashboard</a></p>"""

    return send_email_async(email, subject, body_text, body_html)

# ============================================================================
# EVENT 4: Hotel rejected
# ============================================================================
def send_hotel_rejected_email(email, hotel_name, reason, edit_url=None):
    """
    Trigger: After admin rejects a hotel (status -> 'rejected').
    Recipient: Hotel owner.
    """
    base_url = _get_base_url()
    edit_url = edit_url or f"{base_url}/owner"
    subject = f"Update on your Stayfolio application for '{hotel_name}'"

    body_text = f"""Hotel Application Status Update

Thank you for submitting '{hotel_name}' to Stayfolio.
Our verification team reviewed your submission and requires the following updates:

Reason:
{reason}

You can update your application and resubmit by visiting:
{edit_url}

The Stayfolio Team
"""

    try:
        body_html = render_template(
            'emails/hotel_rejected.html',
            hotel_name=hotel_name,
            reason=reason,
            edit_url=edit_url
        )
    except Exception as render_err:
        logger.warning(f"Template rendering failed, using fallback HTML: {render_err}")
        body_html = f"""<h2>Application Update for {hotel_name}</h2>
<p>Updates required: {reason}</p>
<p><a href="{edit_url}">Edit & Resubmit Application</a></p>"""

    return send_email_async(email, subject, body_text, body_html)

# ============================================================================
# EVENT 5: Admin sends an ad-hoc notification to a hotel owner
# ============================================================================
def send_owner_adhoc_notification(email, hotel_name, message_text, subject=None, dashboard_url=None):
    """
    Trigger: After admin sends an ad-hoc notification to an owner.
    Recipient: Relevant hotel owner.
    """
    base_url = _get_base_url()
    dashboard_url = dashboard_url or f"{base_url}/owner"
    subject = subject or f"Important Notice regarding '{hotel_name}' — Stayfolio"

    body_text = f"""Notice from Stayfolio Administration regarding '{hotel_name}'

{message_text}

View in Owner Dashboard:
{dashboard_url}

The Stayfolio Team
"""

    try:
        body_html = render_template(
            'emails/owner_adhoc_notification.html',
            hotel_name=hotel_name,
            message_text=message_text,
            subject=subject,
            dashboard_url=dashboard_url
        )
    except Exception as render_err:
        logger.warning(f"Template rendering failed, using fallback HTML: {render_err}")
        body_html = f"""<h2>Notice regarding {hotel_name}</h2>
<p>{message_text}</p>
<p><a href="{dashboard_url}">Open Owner Dashboard</a></p>"""

    return send_email_async(email, subject, body_text, body_html)

# ============================================================================
# BACKWARD COMPATIBILITY ALIASES
# ============================================================================
send_email = send_email_async
send_approval_email = send_hotel_approved_email
send_rejection_email = send_hotel_rejected_email
send_owner_credentials = send_owner_welcome_email