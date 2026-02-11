#!/usr/bin/env node
/**
 * Log an activity event to the dashboard
 * 
 * Usage: node scripts/log-activity.js <type> <title> [description] [metadata-json]
 * 
 * Example:
 *   node scripts/log-activity.js cron "Cron: nick-health-check" "Completed successfully" '{"duration":"15s"}'
 */

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://openclaw-dashboard-azure.vercel.app';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || 'f3914cdd42ab3a87185750400fc2551b56e9c2389dc63521971282df4ad736ed';

async function logActivity() {
  const [,, type, title, description, metadataJson] = process.argv;
  
  if (!type || !title) {
    console.error('Usage: node log-activity.js <type> <title> [description] [metadata-json]');
    console.error('Types: message, tool, cron, heartbeat, error');
    process.exit(1);
  }
  
  let metadata = {};
  if (metadataJson) {
    try {
      metadata = JSON.parse(metadataJson);
    } catch (e) {
      console.error('Invalid metadata JSON');
      process.exit(1);
    }
  }
  
  try {
    const response = await fetch(`${DASHBOARD_URL}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': WEBHOOK_API_KEY,
      },
      body: JSON.stringify({ type, title, description, metadata }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    console.log('✅ Activity logged');
  } catch (error) {
    console.error('❌ Failed to log activity:', error.message);
    process.exit(1);
  }
}

logActivity();
