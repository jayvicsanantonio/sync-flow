#!/usr/bin/env node

/**
 * Simple script to retrieve early access emails from Redis
 * Usage: node scripts/get-early-access.js
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to be set
 */

const { Redis } = require('@upstash/redis');

async function getEarlyAccessEmails() {
  try {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      console.error('❌ Missing Redis environment variables:');
      console.error('   UPSTASH_REDIS_REST_URL');
      console.error('   UPSTASH_REDIS_REST_TOKEN');
      process.exit(1);
    }

    const redis = Redis.fromEnv();

    console.log('🔍 Fetching early access requests...\n');

    // Get all emails
    const emails = await redis.smembers('early-access:list');
    const count = (await redis.get('early-access:count')) || 0;

    console.log(`📊 Summary:`);
    console.log(`   Total requests: ${count}`);
    console.log(`   Unique emails: ${emails.length}\n`);

    if (emails.length === 0) {
      console.log('📭 No early access requests found.');
      return;
    }

    console.log('📧 Early Access Requests:');
    console.log('========================');

    // Get detailed info for each email
    for (const email of emails) {
      const data = await redis.get(`early-access:${email}`);
      if (data) {
        try {
          const request = typeof data === 'string' ? JSON.parse(data) : data;
          const timestamp = new Date(request.timestamp).toLocaleString();
          console.log(`   ${request.email}`);
          console.log(`   └── Submitted: ${timestamp}`);
          console.log(`   └── IP: ${request.ip || 'unknown'}`);
          console.log(
            `   └── User Agent: ${request.userAgent ? request.userAgent.substring(0, 50) + '...' : 'unknown'}`
          );
          console.log('');
        } catch (parseError) {
          console.error(
            `   ❌ Failed to parse data for ${email}:`,
            parseError.message
          );
        }
      }
    }

    // Export as CSV-like format
    console.log('\n📋 Email list (CSV format):');
    console.log('email,timestamp,ip');
    for (const email of emails) {
      const data = await redis.get(`early-access:${email}`);
      if (data) {
        try {
          const request = typeof data === 'string' ? JSON.parse(data) : data;
          console.log(
            `${request.email},${request.timestamp},${request.ip || 'unknown'}`
          );
        } catch (parseError) {
          console.error(
            `❌ Failed to parse CSV data for ${email}:`,
            parseError.message
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Error fetching early access data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  getEarlyAccessEmails();
}

module.exports = { getEarlyAccessEmails };
