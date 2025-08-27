#!/usr/bin/env node

/**
 * Test script to verify Resend email integration
 * Usage: node scripts/send-test-email.ts
 *
 * Requires the following environment variables:
 * - RESEND_API_KEY
 * - BETA_NOTIFICATION_TO
 * - BETA_NOTIFICATION_FROM
 */

import { sendBetaRequestEmail } from '../api/services/email';
import type { EarlyAccessRequest } from '../api/handlers/early-access';

async function sendTestEmail() {
  try {
    // Check required environment variables
    const requiredVars = [
      'RESEND_API_KEY',
      'BETA_NOTIFICATION_TO',
      'BETA_NOTIFICATION_FROM',
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach((varName) => console.error(`   ${varName}`));
      process.exit(1);
    }

    console.log('📧 Sending test beta access notification email...\n');

    // Create a mock early access request for testing
    const testRequest: EarlyAccessRequest = {
      email: 'test-user@example.com',
      timestamp: new Date().toISOString(),
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ip: '192.168.1.100',
    };

    console.log('📋 Test request details:');
    console.log(`   Email: ${testRequest.email}`);
    console.log(`   Timestamp: ${testRequest.timestamp}`);
    console.log(`   IP: ${testRequest.ip}`);
    console.log(`   User Agent: ${testRequest.userAgent}\n`);

    // Send the test email
    const result = await sendBetaRequestEmail(testRequest);

    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`   Email ID: ${result.id}`);
      console.log(`   Recipient: ${process.env.BETA_NOTIFICATION_TO}`);
      console.log(`   Sender: ${process.env.BETA_NOTIFICATION_FROM}`);
    } else {
      console.error('❌ Failed to send test email:');
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      '❌ Test email script failed:',
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendTestEmail();
}

export { sendTestEmail };
