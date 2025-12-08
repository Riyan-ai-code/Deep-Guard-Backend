const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { supabase } = require("../config/supabase");

const TRIAL_DURATION_MS = 60 * 60 * 1000; // 1 hour
const MAX_SESSIONS_PER_DAY = 100;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "trialAccess";

const COOKIE_OPTS = {
    httpOnly: true,
    secure: true,
    sameSite: "none", // User requested setting
    path: "/",
};

// -----------------------------------------
// Fingerprint (binds trial to device)
// -----------------------------------------
const getDeviceFingerprint = (req) => {
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        "unknown-ip";

    const ua = req.headers["user-agent"] || "unknown-ua";

    return crypto.createHash("sha256").update(ip + "|" + ua).digest("hex");
};

// -----------------------------------------
// JOIN TRIAL (Create Session)
// -----------------------------------------
exports.joinTrial = async (req, res) => {
    try {
        const fingerprint = getDeviceFingerprint(req);

        // 1. Check daily limit
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count, error: countError } = await supabase
            .from("trial_sessions")
            .select("*", { count: "exact", head: true })
            .eq("client_id", fingerprint)
            .gte("created_at", oneDayAgo);

        if (countError) {
            console.error("Trial count check failed", countError);
            return res.status(500).json({ message: "System error checking eligibility" });
        }

        if (count >= MAX_SESSIONS_PER_DAY) {
            return res.status(429).json({
                message: "Daily trial limit reached (3 sessions/day). Please sign up for unlimited access.",
            });
        }

        // 2. Create new session
        const expiresAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

        const { data: session, error: insertError } = await supabase
            .from("trial_sessions")
            .insert({
                client_id: fingerprint,
                ip_address: req.ip,
                user_agent: req.headers["user-agent"],
                expires_at: expiresAt,
                analysis_count: 0,
            })
            .select("*")
            .single();

        if (insertError) {
            console.error("Trial session create failed", insertError);
            return res.status(500).json({ message: "Failed to create trial session" });
        }

        // 3. Generate Token (1 Hour)
        const token = jwt.sign({ sessionId: session.id }, JWT_SECRET, {
            expiresIn: "1h",
        });

        // 4. Set Cookie & Respond
        res.cookie(COOKIE_NAME, token, {
            ...COOKIE_OPTS,
            maxAge: TRIAL_DURATION_MS,
        });

        return res.json({
            success: true,
            message: "Trial started",
            expiresAt: expiresAt,
            accessToken: token
        });

    } catch (err) {
        console.error("Join trial error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
