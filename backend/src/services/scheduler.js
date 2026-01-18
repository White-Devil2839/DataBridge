/**
 * Scheduler Service
 * Manages automated sync jobs based on connector schedules
 */

import { prisma } from '../utils/prisma.js';
import { triggerSync } from './syncService.js';

// Store active timers
const activeTimers = new Map();

// Parse cron-like schedule string to interval in milliseconds
// Supported formats: '*/5 * * * *' (every 5 minutes), '0 */6 * * *' (every 6 hours), etc.
const parseScheduleToInterval = (schedule) => {
    if (!schedule) return null;

    // Simple interval formats
    if (schedule.match(/^\d+[smhd]$/)) {
        const value = parseInt(schedule.slice(0, -1));
        const unit = schedule.slice(-1);
        const multipliers = {
            's': 1000,           // seconds
            'm': 60 * 1000,      // minutes
            'h': 60 * 60 * 1000, // hours
            'd': 24 * 60 * 60 * 1000, // days
        };
        return value * (multipliers[unit] || multipliers.m);
    }

    // Cron-like format (simplified parsing)
    const parts = schedule.split(' ');
    if (parts.length >= 5) {
        // Check for */X patterns (every X units)
        const minute = parts[0];
        const hour = parts[1];

        // Every X minutes
        if (minute.startsWith('*/')) {
            const minutes = parseInt(minute.slice(2));
            return minutes * 60 * 1000;
        }

        // Every X hours (minute is 0, hour is */X)
        if (minute === '0' && hour.startsWith('*/')) {
            const hours = parseInt(hour.slice(2));
            return hours * 60 * 60 * 1000;
        }

        // Default to hourly if we can't parse
        return 60 * 60 * 1000;
    }

    // Default to 1 hour
    return 60 * 60 * 1000;
};

/**
 * Execute scheduled sync for a connector
 */
const executeScheduledSync = async (connector) => {
    console.log(`⏰ [Scheduler] Running scheduled sync for connector: ${connector.name}`);

    try {
        // Get the first admin user as the job owner
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!adminUser) {
            console.error(`❌ [Scheduler] No admin user found for scheduled sync`);
            return;
        }

        // Trigger the sync
        const job = await triggerSync(connector.id, adminUser.id);
        console.log(`✅ [Scheduler] Scheduled sync started - Job ID: ${job.id}`);

        // Update lastSyncAt
        await prisma.connector.update({
            where: { id: connector.id },
            data: { updatedAt: new Date() },
        });
    } catch (error) {
        console.error(`❌ [Scheduler] Failed to run scheduled sync for ${connector.name}:`, error.message);
    }
};

/**
 * Schedule syncs for a specific connector
 */
const scheduleConnector = (connector) => {
    // Clear existing timer if any
    if (activeTimers.has(connector.id)) {
        clearInterval(activeTimers.get(connector.id));
        activeTimers.delete(connector.id);
    }

    // Check if connector has a schedule
    const schedule = connector.rateLimitConfig?.syncSchedule;
    if (!schedule) return;

    const interval = parseScheduleToInterval(schedule);
    if (!interval) return;

    console.log(`📅 [Scheduler] Scheduling connector "${connector.name}" every ${interval / 1000}s`);

    // Set up the interval
    const timer = setInterval(
        () => executeScheduledSync(connector),
        interval
    );

    activeTimers.set(connector.id, timer);
};

/**
 * Remove schedule for a connector
 */
export const unscheduleConnector = (connectorId) => {
    if (activeTimers.has(connectorId)) {
        clearInterval(activeTimers.get(connectorId));
        activeTimers.delete(connectorId);
        console.log(`🛑 [Scheduler] Removed schedule for connector: ${connectorId}`);
    }
};

/**
 * Refresh schedules (call when connector is updated)
 */
export const refreshSchedule = async (connectorId) => {
    try {
        const connector = await prisma.connector.findUnique({
            where: { id: connectorId },
        });

        if (connector && connector.isShared) {
            scheduleConnector(connector);
        } else {
            unscheduleConnector(connectorId);
        }
    } catch (error) {
        console.error(`❌ [Scheduler] Failed to refresh schedule for ${connectorId}:`, error.message);
    }
};

/**
 * Start the scheduler
 * Loads all connectors with schedules and sets up recurring syncs
 */
export const startScheduler = async () => {
    console.log('🚀 [Scheduler] Starting scheduler service...');

    try {
        // Load only shared connectors
        const connectors = await prisma.connector.findMany({
            where: { isShared: true }
        });

        let scheduledCount = 0;
        for (const connector of connectors) {
            const schedule = connector.rateLimitConfig?.syncSchedule;
            if (schedule) {
                scheduleConnector(connector);
                scheduledCount++;
            }
        }

        console.log(`✅ [Scheduler] Started with ${scheduledCount} scheduled connector(s)`);
    } catch (error) {
        console.error('❌ [Scheduler] Failed to start scheduler:', error.message);
    }
};

/**
 * Stop the scheduler
 * Clears all active timers
 */
export const stopScheduler = () => {
    console.log('🛑 [Scheduler] Stopping scheduler service...');

    for (const [connectorId, timer] of activeTimers) {
        clearInterval(timer);
    }
    activeTimers.clear();

    console.log('✅ [Scheduler] All scheduled tasks stopped');
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = () => {
    return {
        active: true,
        scheduledConnectors: activeTimers.size,
        connectorIds: Array.from(activeTimers.keys()),
    };
};
