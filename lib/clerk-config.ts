export function getClerkKeys() {
  const environment = process.env.CLERK_ENVIRONMENT || 'production';
  
  if (environment === 'test') {
    return {
      publishableKey: process.env.CLERK_TEST_PUBLISHABLE_KEY!,
      secretKey: process.env.CLERK_TEST_SECRET_KEY!,
    };
  }
  
  return {
    publishableKey: process.env.CLERK_PRODUCTION_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_PRODUCTION_SECRET_KEY!,
  };
}