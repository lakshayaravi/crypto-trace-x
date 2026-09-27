const API_BASE_URL = "http://127.0.0.1:5000/api";

// ============================================================
// COMMON REQUEST FUNCTION
// ============================================================

async function request(endpoint, options = {}) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Request failed"
            );
        }

        return data;

    } catch (error) {
        console.error(
            `API Error: ${endpoint}`,
            error
        );

        throw error;
    }
}


// ============================================================
// HEALTH
// ============================================================

export async function getHealth() {
    return request("/health");
}


// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboard() {
    return request("/dashboard");
}


// ============================================================
// TRANSACTIONS
// ============================================================

export async function getTransactions() {
    return request("/transactions");
}

export async function getTransaction(
    transactionId
) {
    return request(
        `/transactions/${encodeURIComponent(
            transactionId
        )}`
    );
}

export async function createTransaction(
    transaction
) {
    return request("/transactions", {
        method: "POST",
        body: JSON.stringify(transaction)
    });
}


// ============================================================
// BLOCKS
// ============================================================

export async function getBlock(blockId) {
    return request(
        `/blocks/${blockId}`
    );
}


// ============================================================
// BLOCKCHAIN
// ============================================================

export async function verifyBlockchain() {
    return request(
        "/blockchain/verify"
    );
}

export async function tamperBlock(
    blockId
) {
    return request(
        `/blockchain/tamper/${blockId}`,
        {
            method: "POST"
        }
    );
}

export async function restoreBlock(
    blockId
) {
    return request(
        `/blockchain/restore/${blockId}`,
        {
            method: "POST"
        }
    );
}


// ============================================================
// THREAT DETECTION
// ============================================================

export async function getThreats() {
    return request("/threats");
}

export async function getThreatSummary() {
    return request(
        "/threats/summary"
    );
}

export async function updateThreatStatus(
    threatId,
    status
) {
    return request(
        `/threats/${encodeURIComponent(
            threatId
        )}/status`,
        {
            method: "PUT",
            body: JSON.stringify({
                status
            })
        }
    );
}


// ============================================================
// EVIDENCE VAULT
// ============================================================

export async function getEvidence() {
    return request("/evidence");
}

export async function addEvidence(
    evidence
) {
    return request("/evidence", {
        method: "POST",
        body: JSON.stringify(evidence)
    });
}

export async function getEvidenceDetails(
    evidenceId
) {
    return request(
        `/evidence/${encodeURIComponent(
            evidenceId
        )}`
    );
}

export async function verifyEvidence(
    evidenceId
) {
    return request(
        `/evidence/${encodeURIComponent(
            evidenceId
        )}/verify`
    );
}


// ============================================================
// TRANSACTION NETWORK
// ============================================================

export async function getNetwork() {
    return request("/network");
}


// ============================================================
// SECURITY ANALYTICS
// ============================================================

export async function getAnalytics() {
    return request("/analytics");
}


// ============================================================
// INVESTIGATION NOTES
// ============================================================

export async function getInvestigationNotes(
    transactionId = null
) {
    const endpoint =
        transactionId
            ? `/investigations/notes?transaction_id=${encodeURIComponent(
                  transactionId
              )}`
            : "/investigations/notes";

    return request(endpoint);
}

export async function addInvestigationNote(
    note
) {
    return request(
        "/investigations/notes",
        {
            method: "POST",
            body: JSON.stringify(note)
        }
    );
}


// ============================================================
// ACTIVITY
// ============================================================

export async function getActivity() {
    return request("/activity");
}


// ============================================================
// DEMO DATA
// ============================================================

export async function seedDemoData() {
    return request(
        "/demo/seed",
        {
            method: "POST"
        }
    );
}

export async function resetDemoData() {
    return request(
        "/demo/reset",
        {
            method: "POST"
        }
    );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const api = {
    getHealth,
    getDashboard,

    getTransactions,
    getTransaction,
    createTransaction,

    getBlock,

    verifyBlockchain,
    tamperBlock,
    restoreBlock,

    getThreats,
    getThreatSummary,
    updateThreatStatus,

    getEvidence,
    addEvidence,
    getEvidenceDetails,
    verifyEvidence,

    getNetwork,

    getAnalytics,

    getInvestigationNotes,
    addInvestigationNote,

    getActivity,

    seedDemoData,
    resetDemoData
};

export default api;