const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { findUserByEmail, createPasswordReset, getPasswordResetByToken, updateUserPassword, markPasswordResetUsed, getPasswordHashByUsername } = require('../src/lib/db');

(async () => {
  const email = 'skumhar202o@gmail.com';
  const user = findUserByEmail(email);
  if (!user) {
    console.error('Test user not found');
    process.exit(1);
  }

  const token = crypto.randomBytes(12).toString('hex');
  const expiresAt = new Date(Date.now() + 60*60*1000).toISOString();

  const reset = createPasswordReset({ userId: user.id, token, expiresAt });
  console.log('Created reset:', reset);

  const fetched = getPasswordResetByToken(token);
  console.log('Fetched reset:', fetched);

  const newPassword = 'resetPass123';
  const hash = await bcrypt.hash(newPassword, 12);
  updateUserPassword(user.id, hash);
  markPasswordResetUsed(fetched.id);

  const record = getPasswordHashByUsername(user.username);
  const ok = await bcrypt.compare(newPassword, record.password_hash);
  console.log('Password updated and verified:', ok);
})();
