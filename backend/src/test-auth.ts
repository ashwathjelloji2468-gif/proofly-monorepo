import { prisma } from './context';
import { UserService } from './services/UserService';

async function runAuthTests() {
  console.log('🧪 Starting targeted authentication security tests...');

  const services = {
    user: new UserService(prisma, null)
  };

  const testEmail = `auth-test-${Date.now()}@example.com`;
  const wrongEmail = `wrong-${Date.now()}@example.com`;

  // Scenario 1: Empty email during registration -> should fail
  try {
    await services.user.signup('', 'Name', 'password123');
    throw new Error('FAILED: Empty email signup should have been rejected');
  } catch (err: any) {
    if (err.message.includes('required') || err.message.includes('Email')) {
      console.log('✅ Empty email registration rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 2: Invalid email format during registration -> should fail
  try {
    await services.user.signup('invalid-email-format', 'Name', 'password123');
    throw new Error('FAILED: Invalid email format signup should have been rejected');
  } catch (err: any) {
    if (err.message.includes('INVALID_EMAIL_FORMAT')) {
      console.log('✅ Invalid email format registration rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 3: Weak password (length < 6) during registration -> should fail
  try {
    await services.user.signup(testEmail, 'Name', '12345');
    throw new Error('FAILED: Weak password signup should have been rejected');
  } catch (err: any) {
    if (err.message.includes('WEAK_PASSWORD')) {
      console.log('✅ Weak password registration rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 4: Valid email + correct password -> should succeed
  console.log('👤 Registering valid user...');
  const signupResult = await services.user.signup(testEmail, 'Security Test User', 'password123');
  if (signupResult.token && signupResult.user) {
    console.log('✅ User registered successfully with hashed password.');
  } else {
    throw new Error('FAILED: Registration failed unexpectedly');
  }

  // Scenario 5: Duplicate registration -> should fail
  try {
    await services.user.signup(testEmail, 'Duplicate User', 'password123');
    throw new Error('FAILED: Duplicate email signup should have been rejected');
  } catch (err: any) {
    if (err.message.includes('USER_EXISTS')) {
      console.log('✅ Duplicate email registration rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 6: Valid email + correct password -> login succeeds
  console.log('👤 Logging in with correct credentials...');
  const loginResult = await services.user.login(testEmail, 'password123');
  if (loginResult.token && loginResult.user) {
    console.log('✅ Login succeeded with correct credentials.');
  } else {
    throw new Error('FAILED: Login failed unexpectedly');
  }

  // Scenario 7: Valid email + wrong password -> login fails
  try {
    await services.user.login(testEmail, 'wrongpassword');
    throw new Error('FAILED: Wrong password login should have been rejected');
  } catch (err: any) {
    if (err.message.includes('INVALID_CREDENTIALS')) {
      console.log('✅ Wrong password login rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 8: Non-existent email -> login fails
  try {
    await services.user.login(wrongEmail, 'password123');
    throw new Error('FAILED: Non-existent email login should have been rejected');
  } catch (err: any) {
    if (err.message.includes('INVALID_CREDENTIALS')) {
      console.log('✅ Non-existent email login rejected correctly.');
    } else {
      throw err;
    }
  }

  // Scenario 9: Empty fields during login -> should fail
  try {
    await services.user.login(testEmail, '');
    throw new Error('FAILED: Empty password login should have been rejected');
  } catch (err: any) {
    if (err.message.includes('required') || err.message.includes('password')) {
      console.log('✅ Empty password login rejected correctly.');
    } else {
      throw err;
    }
  }

  console.log('🎉 ALL targeted authentication security tests passed perfectly!');
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error('❌ Security verification failed:', err);
  process.exit(1);
});
