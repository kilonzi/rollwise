const { onValueCreated, onValueUpdated } = require("firebase-functions/v2/database");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const twilio = require("twilio");

// Set default region
setGlobalOptions({ region: "us-central1" });

admin.initializeApp();
const db = admin.database();

// Initialize Twilio
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(TWILIO_SID, TWILIO_TOKEN);

/**
 * Generates a 6-character alphanumeric Job ID (Uppercase)
 */
const generateJobId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Environment URL Configuration
const BASE_URLS = {
    production: "https://rollwise.app",
    development: "https://rollwise.web.app", // Update with your dev URL
    sandbox: "https://rollwise-sandbox.web.app",   // Update with your sandbox URL
    local: "http://localhost:5173" // For local testing
};

/**
 * 1. onJobCreate
 * Triggers when a new job is created in RTDB.
 * Path: {env}/jobs/{jobId} to match the multi-env structure.
 */
exports.onJobCreate = onValueCreated("/{env}/jobs/{jobId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot.exists()) {
        console.log("No data associated with the event");
        return;
    }
    const job = snapshot.val();
    const { env, jobId } = event.params;

    console.log(`[${env}] New Job Created: ${jobId}, Status: ${job.status}`);

    // 1. Send SMS to Client
    // Check for explicit consent (default to true if undefined for legacy, but frontend sends it now)
    const hasSmsConsent = job.smsConsent !== false;

    if (job.clientPhone && TWILIO_SID && hasSmsConsent) {
        try {
            // Dynamically select Base URL
            const baseUrl = BASE_URLS[env] || BASE_URLS.production;
            const magicLink = `${baseUrl}/q/${jobId}`;
            const message = `Rollwise: Received your request! Your Job ID is #${jobId}. View status & secure your dispatch here: ${magicLink}`;

            await client.messages.create({
                body: message,
                from: TWILIO_FROM,
                to: job.clientPhone
            });
            console.log(`SMS sent to ${job.clientPhone}`);
        } catch (err) {
            console.error(`Failed to send SMS for job ${jobId}:`, err);
        }
    } else {
        console.log(`Skipping SMS: Phone=${!!job.clientPhone}, Consent=${hasSmsConsent}`);
    }

    // 2. Create Admin Notification in RTDB
    try {
        const notificationRef = db.ref(`${env}/notifications`).push();
        await notificationRef.set({
            type: 'new_lead',
            title: 'New Service Request',
            body: `Job #${jobId} from ${job.clientName || 'Client'}`,
            jobId: jobId,
            createdAt: admin.database.ServerValue.TIMESTAMP,
            read: false,
            severity: 'info'
        });
    } catch (err) {
        console.error("Failed to create admin notification:", err);
    }
});

/**
 * 2. onJobUpdate
 * Triggers on job update in RTDB.
 */
exports.onJobUpdate = onValueUpdated("/{env}/jobs/{jobId}", async (event) => {
    const change = event.data;
    const newData = change.after.val();
    const oldData = change.before.val();
    const { env, jobId } = event.params;

    // Check if paymentSecured changed to true
    if (!oldData.paymentSecured && newData.paymentSecured) {
        console.log(`[${env}] Payment secured for Job ${jobId}. Checking status promotion.`);

        if (newData.status === 'lead') {
            const jobRef = change.after.ref;

            // Perform update
            await jobRef.update({
                status: 'new',
                // For RTDB, we can't easily do arrayUnion without a transaction or logic.
                // Assuming visibility is handled elsewhere or simpler logic for now.
                // We'll trust the client side implementation or simple update.
            });

            // Add history entry (push to list)
            const historyRef = jobRef.child('history').push();
            await historyRef.set({
                action: 'promoted',
                timestamp: Date.now(),
                note: 'Auto-promoted to NEW upon payment method addition.'
            });

            // Notify Admins of Secured Job
            const notificationRef = db.ref(`${env}/notifications`).push();
            await notificationRef.set({
                type: 'job_secured',
                title: 'Job Secured',
                body: `Payment method added for Job #${jobId}. Ready for dispatch.`,
                jobId: jobId,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                read: false,
                severity: 'success'
            });
        }
    }
});

/**
 * HTTP Function: createIntakeJob (Legacy/Bot)
 */
exports.createIntakeJob = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        const { clientName, clientPhone, address, issueDescription, clientType } = req.body;

        if (!clientName || !clientPhone || !address) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const jobId = generateJobId();
        // Default to 'development' for now as per previous assumption, or read from query
        const env = "development";

        const jobData = {
            id: jobId,
            clientName,
            clientPhone,
            address,
            description: issueDescription || "Reported via AI Bot",
            clientType: clientType || "residential",
            status: "intake_pending",
            createdAt: admin.database.ServerValue.TIMESTAMP,
            intakeSource: "ai_bot",
            photos: [],
            paymentSecured: false,
            smsConsent: req.body.smsConsent !== false
        };

        await db.ref(`${env}/jobs/${jobId}`).set(jobData);

        const baseUrl = BASE_URLS[env] || BASE_URLS.production;
        const magicLink = `${baseUrl}/q/${jobId}`;

        res.status(200).json({
            success: true,
            jobId: jobId,
            magicLink: magicLink,
            message: "Job created."
        });

    } catch (error) {
        console.error("Error creating intake job:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
