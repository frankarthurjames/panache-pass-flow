# Stripe Integration Setup

## Issue Identified
The 500 errors in your Stripe Edge Functions are caused by missing environment variables.

## Required Environment Variables

You need to set the following environment variables for your Supabase Edge Functions:

### 1. Stripe Secret Key
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

### 2. Supabase Service Role Key
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How to Set Environment Variables

### Option 1: Using Supabase CLI (Recommended)
1. Install Supabase CLI if not already installed
2. Run: `supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here`
3. Run: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add the environment variables in the secrets section

### Option 3: Local Development
Create a `.env.local` file in the `supabase/` directory with:
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_URL=https://wlxbydzshqijlfejqafp.supabase.co
```

## Where to Get These Keys

### Stripe Secret Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API Keys
3. Copy the "Secret key" (starts with `sk_test_` for test mode)

### Supabase Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the "service_role" key (starts with `eyJ...`)

## Changes Made

I've updated all your Stripe Edge Functions to:
1. Use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY` for database operations
2. Use a stable Stripe API version (`2024-12-18.acacia`)

## Next Steps

1. Set the environment variables using one of the methods above
2. Redeploy your Edge Functions
3. Test the Stripe integration again

The functions should now work properly once the environment variables are configured.

