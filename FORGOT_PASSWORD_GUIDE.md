# 🔐 Complete Forgot Password System Documentation

## Overview
This is a production-ready password reset system with email integration, security best practices, and beautiful UI.

---

## 📋 Features

### ✅ **Security Features**
- ✓ Secure token generation (64-character crypto-random)
- ✓ Token expiration (1 hour)
- ✓ One-time use tokens (automatically invalidated after use)
- ✓ Password hashing with bcrypt (12 rounds)
- ✓ Email validation
- ✓ Input sanitization
- ✓ Account enumeration protection
- ✓ Automatic invalidation of old reset tokens

### ✅ **User Experience**
- ✓ Beautiful, responsive UI
- ✓ Real-time password strength indicator
- ✓ Password matching validation
- ✓ Clear error messages
- ✓ Success confirmations
- ✓ Loading states
- ✓ Auto-login after reset
- ✓ Demo mode for testing

### ✅ **Email Integration**
- ✓ Professional HTML email template
- ✓ Plain text fallback
- ✓ SMTP support (Gmail, SendGrid, etc.)
- ✓ Demo mode (console logging when email not configured)

---

## 🗄️ Database Structure

### **password_resets Table**
```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `user_id`: Reference to users table
- `token`: 64-character hex reset token
- `expires_at`: Token expiration timestamp (1 hour from creation)
- `used`: Flag (0 = unused, 1 = used)
- `created_at`: When the token was created

---

## 🔧 Configuration

### **Environment Variables (.env)**

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Database
DB_PATH=./data/typezone.sqlite

# Email Configuration (Optional - for production)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="TypeZone <noreply@typezone.com>"
APP_URL=http://localhost:3001
```

### **Email Setup Examples**

#### **Gmail SMTP**
```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password
EMAIL_FROM="TypeZone <your-email@gmail.com>"
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password at: https://myaccount.google.com/apppasswords

#### **SendGrid**
```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM="TypeZone <verify@yourdomain.com>"
```

---

## 📂 File Structure

```
project-root/
├── forgot.html                    # Forgot password page
├── reset.html                     # Reset password page
├── login.html                     # Login page (linked)
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   └── auth.js           # Auth endpoints (updated)
│   │   ├── services/
│   │   │   └── emailService.js   # Email sending service (NEW)
│   │   ├── lib/
│   │   │   └── db.js             # Database functions (already has password_resets)
│   │   └── config.js             # Config (updated with email settings)
│   └── package.json
└── FORGOT_PASSWORD_GUIDE.md      # This file
```

---

## 🚀 API Endpoints

### **1. POST /api/auth/forgot**

Request password reset link.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Password reset requested. Check your email for instructions.",
  "emailSent": true,
  "demoMode": true,
  "token": "abc123...",
  "resetUrl": "http://localhost:3001/reset.html?token=abc123..."
}
```

**Response (Production with email):**
```json
{
  "message": "Password reset requested. Check your email for instructions.",
  "emailSent": true,
  "demoMode": false
}
```

**Security:**
- Always returns success message (prevents account enumeration)
- Validates email format
- Invalidates existing tokens before creating new one
- Returns token only in demo mode

---

### **2. POST /api/auth/reset**

Reset password with token.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

**Validation:**
- Token must exist and be valid
- Token must not be expired
- Token must not be used
- Password minimum 6 characters

---

## 💻 Frontend Pages

### **1. forgot.html**

**Features:**
- Email input with validation
- Beautiful success message
- Demo mode displays reset link
- Loading states
- Back to login link
- Responsive design

**User Flow:**
1. User enters email
2. System validates email format
3. Server creates reset token
4. Email sent (or shown in console)
5. Success message displayed
6. In demo mode: clickable reset link shown

---

### **2. reset.html**

**Features:**
- Password strength indicator (weak/medium/strong)
- Real-time password matching
- Password requirements display
- Token validation
- Success confirmation
- Auto-redirect to login
- Beautiful UI with icons

**User Flow:**
1. User clicks reset link from email
2. Page validates token exists
3. User enters new password
4. Real-time strength feedback
5. Confirm password matching
6. Submit resets password
7. Auto-login and redirect

---

## 🔒 Security Best Practices

### **Token Security**
```javascript
// Strong token generation
const token = crypto.randomBytes(32).toString("hex"); // 64 chars

// Token expiration (1 hour)
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

// One-time use
markPasswordResetUsed(reset.id);

// Invalidate old tokens
existingResets.forEach(reset => {
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
});
```

### **Password Security**
```javascript
// Bcrypt hashing with 12 rounds
const passwordHash = await bcrypt.hash(password, 12);

// Minimum length validation
if (password.length < 6) {
  return res.status(400).json({ error: "Password must be at least 6 characters" });
}
```

### **Account Enumeration Protection**
```javascript
// Always return success message
if (!user) {
  return res.json({ 
    message: "If an account exists, a reset link was sent to your email",
    emailSent: true 
  });
}
```

---

## 🧪 Testing the System

### **Test Scenario 1: Forgot Password Flow**

1. **Open forgot.html**
   ```
   http://localhost:3001/forgot.html
   ```

2. **Enter email** (e.g., test@example.com)

3. **Check server console** for reset link (demo mode)

4. **Click reset link** or copy to browser

5. **Enter new password** (watch strength indicator)

6. **Confirm password**

7. **Submit** → Auto-login and redirect

---

### **Test Scenario 2: Email Delivery (Production)**

1. **Configure .env** with real SMTP credentials

2. **Restart server**

3. **Request reset** with real email

4. **Check inbox** for professional HTML email

5. **Click button** in email

6. **Reset password**

---

### **Test Scenario 3: Security Tests**

1. **Expired token**: Wait 1+ hour, try to use token
   - Expected: "Reset token has expired"

2. **Used token**: Use same token twice
   - Expected: "Invalid or expired reset token"

3. **Invalid token**: Modify token string
   - Expected: "Invalid or expired reset token"

4. **Short password**: Enter 5 characters
   - Expected: "Password must be at least 6 characters"

5. **Non-existent email**: Use fake email
   - Expected: Generic success message (security)

---

## 📧 Email Template Preview

The system sends a beautiful HTML email with:
- ✅ Branded header with gradient
- ✅ Personalized greeting
- ✅ Large "Reset Password" button
- ✅ Fallback plain text link
- ✅ Security warnings
- ✅ Expiration notice
- ✅ Professional footer

---

## 🎨 UI Customization

### **Change Colors**
Edit the CSS in forgot.html and reset.html:

```css
/* Primary green color */
background: linear-gradient(135deg, #22c55e, #4ade80);

/* Info boxes */
border-left: 4px solid #0ea5e9;

/* Success messages */
border-left: 4px solid #22c55e;

/* Warning boxes */
border-left: 4px solid #f59e0b;
```

### **Change Icons**
Replace emoji icons with FontAwesome or SVG:

```html
<!-- Current emoji -->
<div class="icon-lock">🔐</div>

<!-- Replace with FontAwesome -->
<i class="fas fa-lock icon-lock"></i>
```

---

## 🐛 Troubleshooting

### **Problem: Email not sending**

**Solution:**
1. Check if EMAIL_ENABLED=true in .env
2. Verify SMTP credentials
3. Check firewall (port 587 or 465)
4. For Gmail: Use App Password, not regular password
5. Check server console for errors

---

### **Problem: Token invalid on first use**

**Possible causes:**
1. URL encoding issue - ensure token is properly encoded
2. Token modified in transit - check email client
3. Already used - check database `used` column

**Debug:**
```sql
SELECT * FROM password_resets WHERE token = 'your-token';
```

---

### **Problem: Password reset doesn't auto-login**

**Check:**
1. Server returns token in response
2. Frontend calls `api.saveSession()`
3. Browser localStorage enabled
4. No CORS issues

---

## 📊 Monitoring & Logging

The system logs:
- Password reset requests (email, token, URL)
- Email send attempts (success/failure)
- Failed reset attempts (invalid/expired tokens)
- Successful password changes

**Example log output:**
```
============================================================
PASSWORD RESET REQUESTED (Email not configured)
============================================================
To: user@example.com
Token: abc123def456...
Reset URL: http://localhost:3001/reset.html?token=abc123...
============================================================

Password reset email sent to user@example.com: <message-id>
```

---

## 🔄 Production Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure EMAIL_* environment variables
- [ ] Test email delivery with real SMTP
- [ ] Set APP_URL to production domain
- [ ] Enable HTTPS (required for email links)
- [ ] Test forgot → email → reset flow
- [ ] Verify token expiration works
- [ ] Test account enumeration protection
- [ ] Review error messages
- [ ] Set up monitoring/logging
- [ ] Add rate limiting (prevent spam)

---

## 📞 Support

For issues or questions:
1. Check server console logs
2. Review this documentation
3. Inspect browser console (F12)
4. Verify database entries
5. Test with different email providers

---

## 🎯 Summary

This Forgot Password System provides:
- ✅ **Enterprise-grade security** with crypto tokens and bcrypt
- ✅ **Beautiful UX** with real-time feedback
- ✅ **Production-ready email** with professional templates
- ✅ **Flexible deployment** with demo mode
- ✅ **Comprehensive validation** and error handling
- ✅ **Full documentation** for easy maintenance

**Next Steps:**
1. Configure email settings in .env
2. Test the complete flow
3. Customize branding/colors
4. Deploy to production
5. Monitor usage and adjust as needed

---

*Last Updated: March 12, 2026*
*Version: 1.0.0*
