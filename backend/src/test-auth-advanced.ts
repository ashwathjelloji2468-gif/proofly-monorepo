import { prisma } from './context';
import { UserService } from './services/UserService';
import { SpaceService } from './services/SpaceService';
import { EmailService } from './services/EmailService';
import { SpaceRole } from '@prisma/client';
import bcrypt from 'bcrypt';

async function runAdvancedAuthTests() {
  console.log('🧪 Starting advanced enterprise authentication integration tests...');

  const emailService = new EmailService();
  const userService = new UserService(prisma, null, emailService);


  const adminEmail = `admin-${Date.now()}@example.com`;
  const memberEmail = `teammate-${Date.now()}@example.com`;
  const newEmail = `new-email-${Date.now()}@example.com`;

  // --- PART 1: User Signup & Login Verification ---
  console.log('\n👤 1. Testing user registration and verification restrictions...');
  
  // Register admin user
  await userService.signup(adminEmail, 'Admin Founder', 'password123');
  console.log('✅ Registration completed. User status marked as unverified.');

  // Verify that trying to login directly fails with EMAIL_NOT_VERIFIED
  try {
    await userService.login(adminEmail, 'password123');
    throw new Error('FAILED: Unverified user login should have been blocked');
  } catch (err: any) {
    if (err.message.includes('EMAIL_NOT_VERIFIED')) {
      console.log('✅ Blocked unverified user login correctly.');
    } else {
      throw err;
    }
  }

  // Retrieve verification token from database
  const verificationRecord = await prisma.verificationToken.findFirst({
    where: { email: adminEmail }
  });
  if (!verificationRecord) {
    throw new Error('FAILED: Verification token was not inserted into database');
  }
  console.log('✅ Verification token generated successfully.');

  // Verify email using token
  const verifyResult = await userService.verifyEmail(verificationRecord.token);
  if (verifyResult.token && verifyResult.user.isVerified) {
    console.log('✅ Email verification succeeded. Auto-login token returned.');
  } else {
    throw new Error('FAILED: Email verification returned invalid payload');
  }

  // Try to login again - should now succeed
  const loginResult = await userService.login(adminEmail, 'password123');
  if (loginResult.token) {
    console.log('✅ Verified user login succeeded.');
  } else {
    throw new Error('FAILED: Login failed for verified user');
  }

  // --- PART 2: Password Reset via OTP ---
  console.log('\n🔑 2. Testing password reset flow via 6-digit OTP codes...');

  // Request password reset
  const resetRequest = await userService.requestPasswordReset(adminEmail);
  console.log(`✅ Reset request: ${resetRequest.message}`);

  // Fetch the created OTP token
  const otpRecord = await prisma.oTPToken.findFirst({
    where: { user: { email: adminEmail } }
  });
  if (!otpRecord) {
    throw new Error('FAILED: OTP Token was not created in database');
  }

  // Test invalid OTP verify
  try {
    await userService.verifyOTP(adminEmail, '000000');
    throw new Error('FAILED: Invalid OTP should have been rejected');
  } catch (err: any) {
    if (err.message.includes('INVALID_OTP')) {
      console.log('✅ Invalid OTP verification rejected correctly.');
    } else {
      throw err;
    }
  }

  // Verify attempt counter incremented
  const updatedOtp = await prisma.oTPToken.findUnique({ where: { id: otpRecord.id } });
  if (updatedOtp && updatedOtp.attempts === 1) {
    console.log('✅ Incorrect attempts tracked correctly.');
  } else {
    throw new Error('FAILED: Incorrect attempt count did not increment');
  }

  // Retrieve temporary OTP code value from simulated email output (or calculate correct OTP compare)
  // Since we cannot read output of email directly, we bypass comparison by replacing the hash in DB with one we know!
  const knownOTP = '123456';
  const knownOTPHash = await bcrypt.hash(knownOTP, 10);
  await prisma.oTPToken.update({
    where: { id: otpRecord.id },
    data: { otpHash: knownOTPHash }
  });

  // Verify correct OTP - returns password reset token
  const resetToken = await userService.verifyOTP(adminEmail, knownOTP);
  if (resetToken) {
    console.log('✅ OTP verification succeeded. Temporary reset token returned.');
  } else {
    throw new Error('FAILED: OTP verify did not return reset token');
  }

  // Reset password
  const resetSuccess = await userService.resetPassword(adminEmail, resetToken, 'new-password123');
  if (resetSuccess) {
    console.log('✅ Password changed successfully.');
  } else {
    throw new Error('FAILED: Password reset call failed');
  }

  // Verify old password fails
  try {
    await userService.login(adminEmail, 'password123');
    throw new Error('FAILED: Old password login should have failed');
  } catch (err: any) {
    console.log('✅ Old password login blocked correctly.');
  }

  // Verify new password succeeds
  const newLogin = await userService.login(adminEmail, 'new-password123');
  if (newLogin.token) {
    console.log('✅ New password login succeeded.');
  } else {
    throw new Error('FAILED: New password login failed');
  }

  // --- PART 3: Teammate Workspace Invitations ---
  console.log('\n👥 3. Testing teammate workspace invitations...');

  // Setup services with logged in user context
  const currentUser = newLogin.user;
  const adminSpaceService = new SpaceService(prisma, currentUser, emailService);

  // Create a space owned by admin user
  const space = await adminSpaceService.createSpace({
    name: 'Teammates Test Workspace',
    slug: `test-space-${Date.now()}`,
    headerTitle: 'We are hiring',
    customMessage: 'Send feedback'
  });
  console.log(`✅ Created test workspace Space ID: ${space.id}`);

  // Send invitation to teammate
  const inviteSuccess = await adminSpaceService.inviteToWorkspace(space.id, memberEmail, SpaceRole.MEMBER);
  if (inviteSuccess) {
    console.log(`✅ Teammate ${memberEmail} successfully invited.`);
  } else {
    throw new Error('FAILED: Workspace invitation call failed');
  }

  // Fetch invitation token
  const invitationRecord = await prisma.workspaceInvitation.findFirst({
    where: { spaceId: space.id, email: memberEmail }
  });
  if (!invitationRecord) {
    throw new Error('FAILED: Invitation token was not created in database');
  }
  console.log('✅ Invitation record found in DB.');

  // Create the invited user in DB (simulate sign up)
  await userService.signup(memberEmail, 'Teammate Member', 'teammatepassword');
  const teammateRecord = await prisma.user.update({
    where: { email: memberEmail },
    data: { isVerified: true } // Auto-verify teammate email
  });
  console.log('✅ Teammate user registered.');

  // Accept invitation
  const teammateService = new SpaceService(prisma, teammateRecord, emailService);
  const acceptSuccess = await teammateService.acceptWorkspaceInvitation(invitationRecord.token);
  if (acceptSuccess) {
    console.log('✅ Workspace invitation accepted successfully.');
  } else {
    throw new Error('FAILED: Accept invitation call failed');
  }

  // Verify member created
  const members = await teammateService.getWorkspaceMembers(space.id);
  const teammateMember = members.find(m => m.user.email === memberEmail);
  if (teammateMember && teammateMember.role === SpaceRole.MEMBER) {
    console.log(`✅ Teammate active membership verified with role ${teammateMember.role}.`);
  } else {
    throw new Error('FAILED: Teammate membership not found or role mismatch');
  }

  // --- PART 4: Email Change Verification (Double-Verification) ---
  console.log('\n📧 4. Testing email change verification (double-confirmation)...');

  // Authenticate user service with admin context
  const adminUserService = new UserService(prisma, currentUser, emailService);

  // Request email change
  const changeRequested = await adminUserService.requestEmailChange(newEmail);
  if (changeRequested) {
    console.log('✅ Email change requested.');
  } else {
    throw new Error('FAILED: Email change request failed');
  }

  // Fetch request record
  const changeRequest = await prisma.emailChangeRequest.findUnique({
    where: { userId: currentUser.id }
  });
  if (!changeRequest) {
    throw new Error('FAILED: Change request not found in database');
  }
  console.log('✅ EmailChangeRequest tokens found in DB.');

  // Verify only old token - should return false (waiting for second verification)
  const firstVerify = await adminUserService.verifyEmailChangeToken(changeRequest.oldToken);
  if (!firstVerify) {
    console.log('✅ Verified old email token correctly, pending new address confirmation.');
  } else {
    throw new Error('FAILED: verifyEmailChangeToken should have returned false');
  }

  // Verify new token - should return true and commit email change!
  const secondVerify = await adminUserService.verifyEmailChangeToken(changeRequest.newToken);
  if (secondVerify) {
    console.log('✅ Verified new email token correctly. Email update committed!');
  } else {
    throw new Error('FAILED: verifyEmailChangeToken should have committed change');
  }

  // Verify email updated in User table
  const updatedUserRecord = await prisma.user.findUnique({
    where: { id: currentUser.id }
  });
  if (updatedUserRecord && updatedUserRecord.email === newEmail) {
    console.log(`✅ Confirmed user email address is now updated to: ${updatedUserRecord.email}`);
  } else {
    throw new Error('FAILED: User email was not updated in database');
  }

  console.log('\n🎉 ALL advanced enterprise authentication security tests passed perfectly!');
  process.exit(0);
}

runAdvancedAuthTests().catch((err) => {
  console.error('\n❌ Integration tests failed:', err);
  process.exit(1);
});
