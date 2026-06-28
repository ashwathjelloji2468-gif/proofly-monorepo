import { prisma } from './context';
import { UserService } from './services/UserService';
import { EmailService } from './services/EmailService';
import { BillingTier } from '@prisma/client';
import bcrypt from 'bcrypt';

async function runOAuthSetPasswordTests() {
  console.log('🧪 Starting OAuth registration and Set Password flow integration tests...');

  const emailService = new EmailService();
  const userService = new UserService(prisma, null, emailService);

  const googleUserEmail = `google-user-${Date.now()}@example.com`;
  
  // --- PART 1: Google OAuth User Registration ---
  console.log('\n👤 1. Simulating Google OAuth user registration...');
  
  // Directly insert Google-created user in database to simulate googleLogin registration
  const randomPass = Math.random().toString(36).substring(2, 15);
  const passwordHash = await bcrypt.hash(randomPass, 12);
  
  const user = await prisma.user.create({
    data: {
      email: googleUserEmail,
      name: 'Google Test User',
      passwordHash,
      tier: BillingTier.FREE,
      isVerified: true,
      provider: 'GOOGLE',
      hasPassword: false
    }
  });

  if (user.provider === 'GOOGLE' && user.hasPassword === false) {
    console.log('✅ Registered Google OAuth-only user (hasPassword = false, provider = GOOGLE).');
  } else {
    throw new Error('FAILED: Provider flags not set correctly');
  }

  // --- PART 2: Email & Password Login Block ---
  console.log('\n🔑 2. Verifying password login block on OAuth-only account...');
  
  try {
    await userService.login(googleUserEmail, 'any-password');
    throw new Error('FAILED: Password login should have been blocked');
  } catch (err: any) {
    if (err.message.includes('OAUTH_ACCOUNT') && err.message.includes('GOOGLE')) {
      console.log(`✅ Login blocked successfully with explanation: "${err.message}"`);
    } else {
      throw err;
    }
  }

  // --- PART 3: Establish Password Flow ---
  console.log('\n🔐 3. Establishing password for OAuth-only account...');

  // Setup service context with authenticated OAuth user
  const authenticatedUserService = new UserService(prisma, user, emailService);
  
  // Call setPassword
  const setSuccess = await authenticatedUserService.setPassword('new-secure-password123');
  if (setSuccess) {
    console.log('✅ Password set mutation completed.');
  } else {
    throw new Error('FAILED: setPassword returned false');
  }

  // Check updated flags in DB
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (updatedUser && updatedUser.hasPassword === true) {
    console.log('✅ DB updated correctly: hasPassword is now true.');
  } else {
    throw new Error('FAILED: hasPassword flag was not updated to true in DB');
  }

  // --- PART 4: Email/Password Login ---
  console.log('\n🔓 4. Verifying email/password login succeeds after establishing password...');
  
  const loginResult = await userService.login(googleUserEmail, 'new-secure-password123');
  if (loginResult.token && loginResult.user.hasPassword === true) {
    console.log('✅ Email/password login succeeded post-password establishment.');
  } else {
    throw new Error('FAILED: Login failed after establishing password');
  }

  console.log('\n🎉 ALL OAuth callback and setPassword integration tests passed perfectly!');
  process.exit(0);
}

runOAuthSetPasswordTests().catch((err) => {
  console.error('\n❌ OAuth Set Password tests failed:', err);
  process.exit(1);
});
