# 📧 How to Configure Email for Password Reset

## Current Status

✅ **System is working in DEMO MODE**  
❌ **Email sending is DISABLED** (no credentials configured)

When you request a password reset, the link appears in:
- ✅ Server console logs
- ✅ Browser success message (clickable)
- ❌ NOT sent to your email (yet)

---

## 🔧 Option 1: Enable Real Email (Gmail)

### **Step 1: Get Gmail App Password**

1. **Enable 2-Factor Authentication** on your Google account:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "TypeZone Server"
   - Click "Generate"
   - **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### **Step 2: Update .env File**

Open: `server/.env`

Change these lines:

```env
# Change this from false to true
EMAIL_ENABLED=true

# Add YOUR Gmail address
EMAIL_USER=your-email@gmail.com

# Paste the 16-char App Password (remove spaces)
EMAIL_PASS=abcdefghijklmnop

# Optional: Change sender name
EMAIL_FROM="TypeZone <your-email@gmail.com>"
```

### **Step 3: Restart Server**

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd server
npm start
```

You should see:
```
Email configuration loaded
TypeZone API listening on http://localhost:3001
```

### **Step 4: Test It!**

1. Go to: http://localhost:3001/forgot.html
2. Enter YOUR Gmail address
3. Click "Send Reset Link"
4. **Check your Gmail inbox!** 📬

---

## 🎯 Option 2: Keep Using Demo Mode (No Setup Required)

The system works perfectly without email! Just:

1. Request password reset at: http://localhost:3001/forgot.html
2. Check the **server console** for the reset link
3. Copy the link or click it directly in the browser
4. Reset your password

**Example console output:**
```
============================================================
PASSWORD RESET REQUESTED (Email not configured)
============================================================
To: user@example.com
Token: abc123def456...
Reset URL: http://localhost:3001/reset.html?token=abc123...
============================================================
```

This is perfect for:
- ✅ Local development
- ✅ Testing
- ✅ Demo purposes
- ✅ Privacy (no real emails sent)

---

## 🚀 Option 3: Use Other Email Providers

### **SendGrid (Free Tier Available)**

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM="TypeZone <verify@yourdomain.com>"
```

Get API key: https://app.sendgrid.com/settings/api_keys

### **Outlook/Hotmail**

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM="TypeZone <your-email@outlook.com>"
```

### **Yahoo Mail**

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password  # Generate at: https://login.yahoo.com/account/security
EMAIL_FROM="TypeZone <your-email@yahoo.com>"
```

---

## 🐛 Troubleshooting

### **"Authentication Failed"**

**Problem:** Wrong email or password

**Solution:**
- For Gmail: Use **App Password**, not your regular password
- Double-check for typos in .env file
- Make sure 2FA is enabled for Gmail

---

### **"Connection Timeout"**

**Problem:** Firewall blocking port 587

**Solution:**
```env
# Try port 465 with SSL instead
EMAIL_PORT=465
```

Or check your firewall settings.

---

### **"Email Not Sending" Even After Configuration**

**Check:**
1. Is `EMAIL_ENABLED=true`? (not `false`)
2. Did you restart the server after changing .env?
3. Check server console for errors
4. Verify email credentials work by logging into webmail

---

### **Still Not Working?**

**Debug Steps:**
1. Open `server/src/services/emailService.js`
2. Look for error messages in console
3. Check if SMTP credentials are loaded correctly
4. Test with a different email provider

---

## 📊 Compare Options

| Feature | Demo Mode | Gmail SMTP | SendGrid |
|---------|-----------|------------|----------|
| **Setup Time** | 0 min | 5 min | 10 min |
| **Cost** | Free | Free | Free (100/day) |
| **Real Emails** | ❌ No | ✅ Yes | ✅ Yes |
| **Best For** | Development | Testing | Production |
| **Privacy** | ✅ High | Medium | Medium |

---

## ✅ Quick Test

After configuring email, run this test:

```bash
cd server
node test-forgot-password.js
```

If email is configured correctly, you'll see:
```
📧 Test 3: Valid email - Demo mode
   ✅ Request successful
   Message: Password reset requested. Check your email for instructions.
```

And you should receive an actual email!

---

## 🎨 What the Email Looks Like

When email is enabled, recipients get a beautiful HTML email with:

- ✅ Branded header with green gradient
- ✅ Personalized greeting
- ✅ Large "Reset Password" button
- ✅ Plain text link as fallback
- ✅ Security warnings
- ✅ Professional design

---

## 🔒 Security Notes

- ✅ App Passwords are safer than regular passwords
- ✅ Never commit `.env` to Git (it's in .gitignore)
- ✅ Change JWT_SECRET for production
- ✅ Use HTTPS in production for email links
- ✅ Tokens expire after 1 hour automatically

---

## 📞 Need Help?

If you're still having issues:

1. **Check server logs** - Most errors appear there
2. **Verify .env syntax** - No quotes around values
3. **Test with demo mode** - At least the flow works
4. **Try different provider** - Some have stricter security

---

## ✨ Recommendation

**For Development:** Keep using demo mode - it's fast and private!

**For Production:** Set up Gmail or SendGrid for real emails

**For Testing:** Demo mode is perfect - no spam, instant results!

---

*Last Updated: March 12, 2026*  
*Works with: TypeZone v1.0.0*
