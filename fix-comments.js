import fs from 'fs';
import path from 'path';

const comments = [
  "// spacer",
  "// Real data for productivity trends (tasks created per day of week)",
  "// Reorder to start from Mon for the chart",
  "// Mon",
  "// Tue",
  "// Wed",
  "// Thu",
  "// Fri",
  "// Sat",
  "// Sun",
  "// Real data for team distribution (members by department)",
  "// Fallback if no users/departments yet",
  "// We don't actually delete, maybe just update status or let user send new one",
  "// For simplicity, let's allow deleting pending requests",
  "// deleteDoc(requestRef);",
  "// Need to import deleteDoc",
  "// @ts-ignore",
  "// Force white background for the PDF",
  "// THE RIGID FIX:",
  "// 1. Inject a pure, standard HEX stylesheet for the report to avoid oklch()",
  "// Map dark mode specific container to white for report",
  "// Rigid execution",
  "// Log the test email to Firestore so it shows up in the UI list",
  "// Real data for throughput (tasks completed per day for last 7 days)",
  "// Optionally switch to the new team immediately",
  "// Immediate check for < 24h deadline on creation",
  "// 1. Initial Assignment Email",
  "// 2. < 24 Hours Immediate Reminder Check",
  "// Test Firestore connection",
  "// Clear previous listeners",
  "// Listen to user profile",
  "// The next snapshot will have the updated role",
  "// The next snapshot will have the new profile",
  "// Listen to team data if teamId exists",
  "// Reset form",
  "// Try to parse our special JSON error",
  "// Not a JSON error",
  "// App opening animation duration",
  "// 3.2 seconds total splash for super smooth slower entrance",
  "// Much slower initial drop-in",
  "// Very slow, buttery ease-out",
  "// Stop listening if already active",
  "/// <reference types=\"vite/client\" />",
  "// Support both AI Studio's injected process.env AND standard local Vite import.meta.env",
  "// Build context for the AI",
  "// Replay previous messages for context",
  "// percentage",
  "// User IDs",
  "// Automated Email Trigger Check",
  "// We only want ONE person in the team doing this background check to prevent duplicate emails.",
  "// E.g. we only let the Team Lead do this check locally OR we check if we were the creator of the task.",
  "// For simplicity, we process tasks created by the current user so each creator manages their own automated emails",
  "// Check if there is an active reminder interval",
  "// Update the last sent time to reset the cooldown",
  "// One-time 24-hour reminder fallback if no interval set",
  "// Mark task as reminderSent",
  "// Run immediately when tasks changes, but also poll on an interval to sweep time drift accurately",
  "// Check every 30 seconds"
];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Some comments might have trailing spaces like "// Mon "
    comments.forEach(comment => {
      // Escape special regex chars
      let safeComment = comment.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      // Replace comment optionally followed by space
      let regex = new RegExp(safeComment + '\\s*', 'g');
      content = content.replace(regex, `/* ${comment.replace(/\/\//g, '').replace(/\/\*\*/g, '').trim()} */ `);
    });
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
