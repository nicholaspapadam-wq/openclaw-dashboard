#!/usr/bin/env node
/**
 * Sync OpenClaw cron jobs to the dashboard
 * Run this periodically or after cron changes
 * 
 * Usage: node scripts/sync-cron.js
 */

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://openclaw-dashboard-azure.vercel.app';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || 'f3914cdd42ab3a87185750400fc2551b56e9c2389dc63521971282df4ad736ed';

async function syncCronJobs() {
  console.log('Fetching cron jobs from OpenClaw...');
  
  // Get cron jobs using the cron tool (via CLI or direct API)
  // For now, we'll use the openclaw CLI
  const { execSync } = require('child_process');
  
  try {
    // Get cron list as JSON
    const output = execSync('openclaw cron list --json', { 
      encoding: 'utf-8',
      timeout: 30000 
    });
    
    const jobs = JSON.parse(output);
    console.log(`Found ${jobs.length} cron jobs`);
    
    // Push to dashboard
    const response = await fetch(`${DASHBOARD_URL}/api/cron`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WEBHOOK_API_KEY,
      },
      body: JSON.stringify({ jobs }),
    });
    
    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Synced ${result.count} jobs to dashboard`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncCronJobs();
