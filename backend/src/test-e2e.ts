import { TestimonialType, ImportedFrom } from '@prisma/client';

const GRAPHQL_URL = 'http://localhost:4000/graphql';

async function graphqlRequest(query: string, variables: any = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const body = (await res.json()) as any;
  if (body.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(body.errors, null, 2)}`);
  }
  return body.data;
}

async function runE2E() {
  console.log('⏳ Starting End-to-End backend verification...');
  
  // 1. Wait for server health
  let healthy = false;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch('http://localhost:4000/health');
      if (res.status === 200) {
        healthy = true;
        break;
      }
    } catch (e) {}
    console.log('Waiting for server to start...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (!healthy) {
    throw new Error('Server is not responding at http://localhost:4000/health');
  }
  console.log('✅ Server is healthy!');

  const testEmail = `test-${Date.now()}@example.com`;

  // 2. Register a new user
  console.log('👤 Registering test user...');
  const signupMutation = `
    mutation Signup($email: String!, $name: String!, $password: String!) {
      signup(email: $email, name: $name, password: $password) {
        token
        user {
          id
          email
          name
          tier
        }
      }
    }
  `;
  const signupData = await graphqlRequest(signupMutation, {
    email: testEmail,
    name: 'Test Admin User',
    password: 'password123',
  });
  const token = signupData.signup.token;
  console.log(`✅ Registered successfully.`);

  // 3. Create a space
  console.log('📁 Creating a new space...');
  const createSpaceMutation = `
    mutation CreateSpace($input: CreateSpaceInput!) {
      createSpace(input: $input) {
        id
        name
        slug
      }
    }
  `;
  const spaceSlug = `space-${Date.now()}`;
  const spaceData = await graphqlRequest(createSpaceMutation, {
    input: {
      name: 'E2E Reward Space',
      slug: spaceSlug,
      headerTitle: 'Love our Product?',
      customMessage: 'Tell us how we did!',
    },
  }, token);
  const spaceId = spaceData.createSpace.id;
  console.log(`✅ Created space: ${spaceSlug}`);

  // 4. Create a Reward for this space
  console.log('🎁 Creating a reward incentive for the space...');
  const createRewardMutation = `
    mutation CreateOrUpdateReward($input: CreateOrUpdateRewardInput!) {
      createOrUpdateReward(input: $input) {
        id
        discountCode
        message
        isActive
      }
    }
  `;
  const rewardData = await graphqlRequest(createRewardMutation, {
    input: {
      spaceId,
      discountCode: 'THANKYOU20',
      message: 'Thanks for your feedback! Here is 20% off your next order.',
    },
  }, token);
  console.log(`✅ Reward configured with discount code: ${rewardData.createOrUpdateReward.discountCode}`);

  // 5. Submit positive testimonial (public) - should return the reward!
  console.log('✍️ Submitting testimonial & checking reward delivery...');
  const createTestimonialMutation = `
    mutation CreateTestimonial($input: CreateTestimonialInput!) {
      createTestimonial(input: $input) {
        testimonial {
          id
          reviewerName
          sentiment
        }
        reward {
          discountCode
          message
        }
      }
    }
  `;
  const submitData = await graphqlRequest(createTestimonialMutation, {
    input: {
      spaceId,
      type: TestimonialType.TEXT,
      textContent: 'I love this tool! Extremely clean and easy to use.',
      rating: 5,
      reviewerName: 'Charlie Brown',
      reviewerEmail: 'charlie@snoopy.org',
    },
  });
  console.log(`✅ Submission response:`);
  console.log(`   - Sentiment: ${submitData.createTestimonial.testimonial.sentiment}`);
  console.log(`   - Received Discount Code: ${submitData.createTestimonial.reward.discountCode}`);
  console.log(`   - Received Message: "${submitData.createTestimonial.reward.message}"`);

  // 6. Test Third-Party Imports (Twitter)
  console.log('🐦 Mock importing a testimonial from Twitter...');
  const importTestimonialMutation = `
    mutation ImportTestimonial($input: ImportTestimonialInput!) {
      importTestimonial(input: $input) {
        id
        reviewerName
        importedFrom
        externalLink
        sentiment
        isApproved
      }
    }
  `;
  const importData = await graphqlRequest(importTestimonialMutation, {
    input: {
      spaceId,
      importedFrom: ImportedFrom.TWITTER,
      externalLink: 'https://twitter.com/elonmusk/status/123456789',
      textContent: 'This product is absolutely amazing! Saved my business.',
      rating: 5,
      reviewerName: 'Elon Musk',
      reviewerEmail: 'elon@x.com',
    },
  }, token);
  console.log(`✅ Import response:`);
  console.log(`   - Source: ${importData.importTestimonial.importedFrom}`);
  console.log(`   - Reviewer: ${importData.importTestimonial.reviewerName}`);
  console.log(`   - Pre-Approved: ${importData.importTestimonial.isApproved}`);
  console.log(`   - Auto-Sentiment: ${importData.importTestimonial.sentiment}`);

  console.log('\n🌟 SUCCESS: Reward and Third-Party Import verification passed perfectly!');
}

runE2E().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
