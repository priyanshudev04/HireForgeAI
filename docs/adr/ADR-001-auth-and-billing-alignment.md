# ADR-001 — Authentication and Billing Alignment

**Status:** Approved  
**Date:** 2026-08-08

## Context

The frozen architecture and API contract define Clerk as HireForge's identity
provider and Supabase as the Postgres and Storage platform. The product also
requires passwordless phone login where the user can choose SMS or WhatsApp,
plus India and global paid plans.

## Decisions

1. **Clerk owns authentication.** It manages phone OTP verification, browser
   sessions, and JWTs. Supabase Auth is not used.
2. **Users choose the OTP delivery channel.** The custom Clerk sign-in and
   sign-up screens offer SMS and WhatsApp, subject to provider configuration
   and country availability.
3. **Sign-up requires both a verified phone and verified email.** Phone OTP is
   the primary sign-in method. Email satisfies the existing required `User.email`
   field, supports receipts and recovery, and is verified before onboarding ends.
4. **Supabase remains the managed Postgres and Storage provider.** The app's
   database user mirrors Clerk using `User.clerkId`, as defined in the frozen
   schema.
5. **Billing supports two providers.** Razorpay serves India in INR (including
   UPI); Stripe serves other regions in USD. The initial catalog is Free, Pro
   Monthly, Pro Yearly, and Campus.
6. **Entitlements are webhook-driven.** Checkout redirects never grant access
   by themselves. Verified Stripe or Razorpay webhook events update the local
   subscription record, which is the only source for feature gating.
7. **Initial commercial defaults:** INR 499/month and INR 3,999/year; USD
   9/month and USD 79/year; a 7-day Pro trial. These are configuration values
   and may be changed later without altering the UI architecture.

## Consequences

- The backend implementation adds `Plan` and `Subscription` persistence plus
  Stripe and Razorpay webhook handlers as an additive extension to the frozen
  schema/API contract.
- The frontend is delivered first with all corresponding states and routes;
  provider calls are connected in the backend phase.
