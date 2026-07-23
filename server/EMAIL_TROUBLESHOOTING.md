# 🔧 Email Delivery Troubleshooting Guide

## ⚠️ WHY YOU'RE NOT RECEIVING EMAILS

### **Current Status:**
```
EMAIL_ENABLED = false  ❌
EMAIL_USER = (empty)   ❌
EMAIL_PASS = (empty)   ❌
```

**Result:** System is in DEMO MODE - no emails are sent, only console logs!

---

## 🎯 STEP-BY-STEP FIX

### **Step 1: Get Gmail App Password (5 minutes)**

#### A. Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow setup instructions
4. ✅ Enable it

#### B. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **"Mail"**
3. Select device: **"Other (Custom name)"**
4. Enter name: **"TypeZone Server"**
5. Click **"Generate"**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

⚠️ **IMPORTANT:** This is NOT your regular Gmail password!

---

### **Step 2: Configure .env File**

Open: `server/.env`

Replace these lines:

```env
# BEFORE (Current state):
EMAIL_ENABLED=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM="TypeZone < >"

# AFTER (Your real configuration):
EMAIL_ENABLED=true
EMAIL_USER=your-email@gmail.com          # ← Your actual Gmail
EMAIL_PASS=abcdefghijklmnop             # ← 16-char App Password (no spaces)
EMAIL_FROM="TypeZone <your-email@gmail.com>"
```

**Example with real values:**
```env
EMAIL_ENABLED=true
EMAIL_USER=johndoe.test@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="TypeZone <johndoe.test@gmail.com>"
```

---

### **Step 3: Restart Server**

```bash
# In your server terminal:
# Press Ctrl+C to stop current server

npm start
```

You should see:
```
✅ Email configured: Sending via smtp.gmail.com:587
TypeZone API listening on http://localhost:3001
```

---

### **Step 4: Test Email Delivery**

1. Open: http://localhost:3001/forgot.html
2. Enter YOUR Gmail address
3. Click "Send Reset Link"
4. **Check your Gmail inbox!** 📬

You should receive an email within seconds!

---

## 🔍 DEBUGGING CHECKLIST

If still not receiving emails, check each item:

### ✅ Configuration Checks

- [ ] Is `EMAIL_ENABLED=true`? (not `false`)
- [ ] Does `EMAIL_USER` end with `@gmail.com`?
- [ ] Is `EMAIL_PASS` exactly 16 characters? (no spaces)
- [ ] Did you restart the server after changing .env?
- [ ] Is `EMAIL_FROM` using the same Gmail as `EMAIL_USER`?

### ✅ Gmail Account Checks

- [ ] Is 2-Factor Authentication enabled?
- [ ] Did you generate an App Password (not use regular password)?
- [ ] Can you log into Gmail web interface?
- [ ] Is your Gmail account in good standing?

### ✅ Network/Firewall Checks

```bash
# Test if port 587 is accessible
telnet smtp.gmail.com 587

# If that fails, try port 465
telnet smtp.gmail.com 465
```

If telnet doesn't connect, your firewall is blocking SMTP ports.

---

## 🐛 COMMON ERRORS & SOLUTIONS

### **Error: "Invalid Login"**

**Cause:** Wrong password or using regular Gmail password

**Solution:**
```env
# WRONG - Don't use your regular password:
EMAIL_PASS=myregularpassword123

# CORRECT - Use App Password only:
EMAIL_PASS=abcdefghijklmnop
```

---

### **Error: "Connection Timeout"**

**Cause:** Firewall blocking port 587

**Solution 1:** Try port 465 instead
```env
EMAIL_PORT=465  # SSL instead of STARTTLS
```

**Solution 2:** Allow outbound connections on ports 587/465

---

### **Error: "Authentication Required"**

**Cause:** Missing or incorrect credentials

**Solution:** Verify .env has all three:
```env
EMAIL_ENABLED=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=16-character-apppassword
```

---

### **Email Goes to Spam**

**Causes:**
1. Using suspicious sender address
2. Missing domain verification
3. Content triggers spam filters

**Solutions:**
1. Use your actual Gmail in `EMAIL_FROM`
2. Add SPF record to domain (if using custom domain)
3. Avoid spam trigger words in email subject

---

### **"Less Secure Apps" Error**

**Cause:** Google blocking old authentication methods

**Solution:** You MUST use App Password (regular password won't work)

Get App Password: https://myaccount.google.com/apppasswords

---

## 🔬 ADVANCED TESTING

### **Test 1: Console Output Check**

After requesting reset, server console should show:

```
✅ Email configured: Sending via smtp.gmail.com:587

📤 Attempting to send email to: test@gmail.com
From: TypeZone <test@gmail.com>
Subject: Password Reset Request

✅ SUCCESS! Email sent to test@gmail.com
Message ID: <abc123@mail.gmail.com>
```

If you see this but no email arrives → Check spam folder or Gmail delivery issues.

---

### **Test 2: Nodemailer Debug Mode**

The updated code already enables debug logging. Watch for:

```
[2026-03-12 12:00:00] DEBUG: Sending mail...
[2026-03-12 12:00:01] DEBUG: Connection established
[2026-03-12 12:00:02] DEBUG: User authenticated
[2026-03-12 12:00:03] DEBUG: Message accepted
```

Any errors here will show detailed messages.

---

### **Test 3: Alternative Email Provider**

If Gmail doesn't work, try Outlook:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
EMAIL_FROM="TypeZone <your-email@outlook.com>"
```

No app password needed for Outlook!

---

## 📊 ALTERNATIVE: Keep Using Demo Mode

If you don't want to set up email, demo mode works perfectly!

**How it works:**
1. Request password reset
2. Check server console
3. Copy the reset link shown there
4. Paste in browser or click directly

**Console output:**
```
============================================================
📧 PASSWORD RESET REQUESTED (Demo Mode)
============================================================
⚠️  Email service NOT configured - showing reset link here:
To: user@example.com
Token: abc123def456...
Reset URL: http://localhost:3001/reset.html?token=abc123...

💡 To receive real emails:
   1. Edit server/.env
   2. Set EMAIL_ENABLED=true
   3. Add your Gmail credentials
   4. Restart server
============================================================
```

**Pros:**
- ✅ No setup required
- ✅ Instant results
- ✅ Privacy (no real emails)
- ✅ Perfect for development

**Cons:**
- ❌ Not realistic user experience
- ❌ Manual copy/paste required

---

## 🎯 PRODUCTION DEPLOYMENT

When deploying to production:

### **1. Environment Variables**

Use real environment variables (not .env file):

```bash
# On hosting provider (Heroku, Vercel, Railway, etc.)
# Add these in dashboard:
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=${GMAIL_ADDRESS}
EMAIL_PASS=${GMAIL_APP_PASSWORD}
EMAIL_FROM="TypeZone <${GMAIL_ADDRESS}>"
APP_URL=https://yourdomain.com
```

### **2. Domain Verification (For Custom Domains)**

Add DNS records:

```dns
# SPF Record (allows your server to send email)
TXT @ "v=spf1 include:_spf.google.com ~all"

# DKIM Record (signs emails cryptographically)
# Generate at: https://app.sendgrid.com/settings/sender_auth
TXT google._domainkey "v=DKIM1; k=rsa; p=MIGfMA0GCSq..."

# DMARC Record (tells receivers how to handle failures)
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com"
```

### **3. Use Professional Email Service**

For production, consider:

| Service | Free Tier | Best For |
|---------|-----------|----------|
| **SendGrid** | 100 emails/day | Production apps |
| **Mailgun** | 5,000 emails/month | High volume |
| **AWS SES** | 62,000 emails/month (from EC2) | AWS deployments |
| **Gmail SMTP** | 500 emails/day | Small apps/testing |

---

## 📞 STILL HAVING ISSUES?

### **Diagnostic Commands:**

```bash
# Check if .env is loaded correctly
cd server
node -e "require('dotenv').config(); console.log(process.env.EMAIL_USER)"

# Test SMTP connection manually
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.error('❌ Failed:', error);
  else console.log('✅ Success:', success);
});
"
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] Server shows "✅ Email configured" on startup
- [ ] Requesting reset shows "📤 Attempting to send email"
- [ ] Console shows "✅ SUCCESS! Email sent"
- [ ] Email arrives in inbox within 30 seconds
- [ ] Reset link works when clicked
- [ ] Password can be changed successfully

---

## 🎉 SUMMARY

**Problem:** Email says "sent" but not received  
**Root Cause:** EMAIL_ENABLED=false + empty credentials  
**Solution:** Configure Gmail App Password in .env  

**Quick Fix:**
1. Get App Password from Google
2. Edit server/.env
3. Add credentials
4. Restart server
5. Test!

**Time Required:** 5-10 minutes  
**Difficulty:** Easy  

---

*Last Updated: March 12, 2026*  
*Tested With: Gmail SMTP, Node.js, Nodemailer*
