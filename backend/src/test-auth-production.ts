import { PrismaClient } from '@prisma/client';
import { UserService } from './services/UserService';
import { SessionService } from './services/SessionService';
import { EmailService } from './services/EmailService';
import { verifyAccessToken, verifyRefreshToken } from './utils/jwt';

const prisma = new PrismaClient();
const emailService = new EmailService();

async function runTests() {
  console.log('🏁 Starting production-grade authentication refactor validation suite...\n');

  const testEmail = `sec-audit-${Date.now()}@useproofly.com`;
  const weakPassword = '123';
  const strongPassword = 'Password123!';

  // Clean up any test accounts
  await prisma.user.deleteMany({
    where: { email: testEmail }
  });

  const sessionService = new SessionService(prisma, null);
  const userService = new UserService(prisma, null, emailService, sessionService);

  // 1. Password Strength signup validation
  try {
    console.log('🧪 Test 1: Signup with weak password (expect rejection)...');
    await userService.signup(testEmail, 'Security Audit', weakPassword);
    console.error('❌ FAIL: Allowed signup with weak password.');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('WEAK_PASSWORD')) {
      console.log('✅ PASS: Weak password rejected successfully.');
    } else {
      console.error('❌ FAIL: Unexpected error message:', err.message);
      process.exit(1);
    }
  }

  // 2. Strong password signup
  console.log('🧪 Test 2: Signup with strong password (expect success)...');
  const signupResult = await userService.signup(testEmail, 'Security Audit', strongPassword);
  if (signupResult.user.email === testEmail && !signupResult.user.isVerified) {
    console.log('✅ PASS: Account created successfully in unverified state.');
  } else {
    console.error('❌ FAIL: Signup result was unexpected:', signupResult);
    process.exit(1);
  }

  // 3. Prevent login for unverified account
  try {
    console.log('🧪 Test 3: Log in before email is verified (expect rejection)...');
    await userService.login(testEmail, strongPassword);
    console.error('❌ FAIL: Login succeeded before email verification.');
    process.exit(1);
  } catch (err: any) {
    if (err.message.includes('EMAIL_NOT_VERIFIED')) {
      console.log('✅ PASS: Unverified login blocked successfully.');
    } else {
      console.error('❌ FAIL: Unexpected login failure message:', err.message);
      process.exit(1);
    }
  }

  // Verify email manual simulation
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: { email: testEmail }
  });
  if (!tokenRecord) {
    console.error('❌ FAIL: Verification token was not saved to database.');
    process.exit(1);
  }

  console.log('🧪 Test 4: Confirm email verification link...');
  const verifyResult = await userService.verifyEmail(tokenRecord.token, 'TestAgent', '127.0.0.1');
  if (verifyResult.user.isVerified && verifyResult.accessToken && verifyResult.refreshToken) {
    console.log('✅ PASS: Email verified and cookies generated successfully.');
  } else {
    console.error('❌ FAIL: Verification return values were incorrect:', verifyResult);
    process.exit(1);
  }

  // 4. Test Lockout policy
  console.log('🧪 Test 5: Verify lockout protection (5 failed attempts)...');
  let lockoutHit = false;
  for (let i = 0; i < 6; i++) {
    try {
      await userService.login(testEmail, 'WrongPassword123!');
    } catch (err: any) {
      if (err.message.includes('ACCOUNT_LOCKED')) {
        lockoutHit = true;
        console.log(`✅ PASS: Account locked after ${i + 1} attempts.`);
        break;
      }
    }
  }
  if (!lockoutHit) {
    console.error('❌ FAIL: Lockout policy was not triggered after repeated failures.');
    process.exit(1);
  }

  // Manual reset of lockout for next tests
  await prisma.user.update({
    where: { email: testEmail },
    data: { lockoutUntil: null, failedLoginAttempts: 0 }
  });

  // 5. Session token checks
  console.log('🧪 Test 6: Verify successful login session token properties...');
  const loginResult = await userService.login(testEmail, strongPassword, 'TestAgent', '127.0.0.1');
  const payloadAccess = verifyAccessToken(loginResult.accessToken);
  const payloadRefresh = verifyRefreshToken(loginResult.refreshToken);

  if (payloadAccess.email === testEmail && payloadRefresh.email === testEmail) {
    console.log('✅ PASS: Access and Refresh tokens successfully signed and verified.');
  } else {
    console.error('❌ FAIL: JWT payload values were invalid.');
    process.exit(1);
  }

  // 6. Session listing & Revocation
  console.log('🧪 Test 7: Multi-device session listing and individual revocation...');
  // Create another session (different device simulation)
  const sessionServiceAuth = new SessionService(prisma, verifyResult.user);
  await sessionServiceAuth.createSession(verifyResult.user.id, 'MobileAgent', '192.168.1.1');

  const activeSessions = await sessionServiceAuth.getActiveSessions();
  if (activeSessions.length >= 2) {
    console.log(`✅ PASS: Listed ${activeSessions.length} active sessions.`);
  } else {
    console.error('❌ FAIL: Active sessions listing did not return all logins.');
    process.exit(1);
  }

  // Revoke one session
  const targetRevokeSession = activeSessions.find(s => s.userAgent === 'MobileAgent');
  if (targetRevokeSession) {
    await sessionServiceAuth.revokeSession(targetRevokeSession.id);
    const updatedSessions = await sessionServiceAuth.getActiveSessions();
    if (!updatedSessions.some(s => s.id === targetRevokeSession.id)) {
      console.log('✅ PASS: Individual session successfully revoked.');
    } else {
      console.error('❌ FAIL: Revoked session was still active.');
      process.exit(1);
    }
  }

  // Clean up
  await prisma.user.delete({
    where: { email: testEmail }
  });

  console.log('\n🎉 ALL PRODUCTION-GRADE AUTHENTICATION TESTS PASSED SUCCESSFULLY! 🎉');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test runner encountered a fatal error:', err);
  process.exit(1);
});
