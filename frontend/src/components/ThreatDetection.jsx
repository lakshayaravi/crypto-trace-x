import React, { useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    ShieldAlert,
    ShieldCheck,
    Search,
    RefreshCw,
    Eye,
    X,
    Activity,
    Clock3,
    Globe,
    Smartphone,
    WalletCards,
    CheckCircle2,
    Ban,
    Zap,
    Filter
} from "lucide-react";

import {
    getThreats,
    getThreatSummary,
    updateThreatStatus
} from "../services/api";


function ThreatDetection() {

    const [threats, setThreats] = useState([]);

    const [summary, setSummary] = useState({
        total: 0,
        high: 0,
        medium: 0,
        low: 0,
        active: 0,
        resolved: 0,
        blocked: 0
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");

    const [selectedThreat, setSelectedThreat] =
        useState(null);

    const [updating, setUpdating] =
        useState(null);

    const [message, setMessage] =
        useState(null);


    // =====================================================
    // LOAD THREATS
    // =====================================================

    async function loadThreats(showLoading = true) {

        try {

            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const [
                threatResponse,
                summaryResponse
            ] = await Promise.all([
                getThreats(),
                getThreatSummary()
            ]);


            const threatList =
                Array.isArray(threatResponse)
                    ? threatResponse
                    : (
                        threatResponse.threats ||
                        threatResponse.items ||
                        []
                    );


            setThreats(threatList);


            const summaryData =
                summaryResponse.summary ||
                summaryResponse;


            setSummary({
                total:
                    Number(
                        summaryData.total ??
                        summaryData.total_threats ??
                        threatList.length
                    ),

                high:
                    Number(
                        summaryData.high ??
                        summaryData.high_risk ??
                        threatList.filter(
                            item =>
                                String(
                                    item.severity ||
                                    item.risk_level ||
                                    ""
                                ).toUpperCase() === "HIGH"
                        ).length
                    ),

                medium:
                    Number(
                        summaryData.medium ??
                        summaryData.medium_risk ??
                        threatList.filter(
                            item =>
                                String(
                                    item.severity ||
                                    item.risk_level ||
                                    ""
                                ).toUpperCase() === "MEDIUM"
                        ).length
                    ),

                low:
                    Number(
                        summaryData.low ??
                        summaryData.low_risk ??
                        threatList.filter(
                            item =>
                                String(
                                    item.severity ||
                                    item.risk_level ||
                                    ""
                                ).toUpperCase() === "LOW"
                        ).length
                    ),

                active:
                    Number(
                        summaryData.active ??
                        threatList.filter(
                            item =>
                                String(
                                    item.status || "ACTIVE"
                                ).toUpperCase() === "ACTIVE"
                        ).length
                    ),

                resolved:
                    Number(
                        summaryData.resolved ??
                        threatList.filter(
                            item =>
                                String(
                                    item.status || ""
                                ).toUpperCase() === "RESOLVED"
                        ).length
                    ),

                blocked:
                    Number(
                        summaryData.blocked ??
                        threatList.filter(
                            item =>
                                String(
                                    item.status || ""
                                ).toUpperCase() === "BLOCKED"
                        ).length
                    )
            });

        } catch (error) {

            console.error(
                "Threat detection loading error:",
                error
            );

            setMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to load threat intelligence."
            });

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    }


    useEffect(() => {
        loadThreats();
    }, []);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredThreats = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();

        return threats.filter((threat) => {

            const severity =
                String(
                    threat.severity ||
                    threat.risk_level ||
                    ""
                ).toUpperCase();

            const status =
                String(
                    threat.status ||
                    "ACTIVE"
                ).toUpperCase();


            const matchesFilter =
                filter === "ALL" ||
                (
                    filter === "ACTIVE" &&
                    status === "ACTIVE"
                ) ||
                (
                    filter === "HIGH" &&
                    severity === "HIGH"
                ) ||
                (
                    filter === "MEDIUM" &&
                    severity === "MEDIUM"
                ) ||
                (
                    filter === "RESOLVED" &&
                    status === "RESOLVED"
                ) ||
                (
                    filter === "BLOCKED" &&
                    status === "BLOCKED"
                );


            const text = [
                threat.threat_id,
                threat.id,
                threat.transaction_id,
                threat.threat_type,
                threat.type,
                threat.severity,
                threat.risk_level,
                threat.status,
                threat.ip_address,
                threat.device,
                threat.description,
                threat.reason
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !keyword ||
                text.includes(keyword);


            return (
                matchesFilter &&
                matchesSearch
            );
        });

    }, [
        threats,
        search,
        filter
    ]);


    // =====================================================
    // STATUS UPDATE
    // =====================================================

    async function changeThreatStatus(
        threat,
        status
    ) {

        const threatId =
            threat.threat_id ||
            threat.id;

        if (!threatId) {
            return;
        }

        try {

            setUpdating(threatId);

            const result =
                await updateThreatStatus(
                    threatId,
                    status
                );


            setMessage({
                type: "success",
                text:
                    result.message ||
                    `Threat marked as ${status}.`
            });


            setSelectedThreat(
                previous =>
                    previous
                        ? {
                            ...previous,
                            status
                        }
                        : previous
            );


            await loadThreats(false);

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to update threat status."
            });

        } finally {

            setUpdating(null);
        }
    }


    // =====================================================
    // HELPERS
    // =====================================================

    function severityOf(threat) {

        return String(
            threat.severity ||
            threat.risk_level ||
            "LOW"
        ).toUpperCase();
    }


    function statusOf(threat) {

        return String(
            threat.status ||
            "ACTIVE"
        ).toUpperCase();
    }


    function getThreatId(threat, index) {

        return (
            threat.threat_id ||
            threat.id ||
            `THREAT-${index + 1}`
        );
    }


    function getRiskScore(threat) {

        return (
            threat.risk_score ??
            threat.score ??
            0
        );
    }


    function formatDate(value) {

        if (!value) {
            return "Unknown";
        }

        try {

            return new Date(value)
                .toLocaleString();

        } catch {

            return value;
        }
    }


    function severityIcon(severity) {

        if (severity === "HIGH") {

            return (
                <ShieldAlert
                    size={15}
                />
            );
        }

        if (severity === "MEDIUM") {

            return (
                <AlertTriangle
                    size={15}
                />
            );
        }

        return (
            <ShieldCheck
                size={15}
            />
        );
    }


    function severityClass(severity) {

        if (severity === "HIGH") {
            return "high";
        }

        if (severity === "MEDIUM") {
            return "medium";
        }

        return "low";
    }


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="threat-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="module-header">

                <div>

                    <div className="eyebrow">

                        <span></span>

                        LIVE THREAT INTELLIGENCE

                    </div>


                    <h1>
                        Threat Detection
                    </h1>


                    <p>
                        Detect suspicious blockchain
                        activity, analyze transaction
                        risk and investigate active
                        security threats.
                    </p>

                </div>


                <div className="module-header-actions">

                    <button
                        className="secondary-action"
                        onClick={() =>
                            loadThreats(false)
                        }
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={13}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </div>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (

                <div
                    className={
                        `threat-message ${message.type}`
                    }
                >

                    {message.type === "success" ? (

                        <CheckCircle2
                            size={14}
                        />

                    ) : (

                        <AlertTriangle
                            size={14}
                        />

                    )}


                    <span>
                        {message.text}
                    </span>


                    <button
                        onClick={() =>
                            setMessage(null)
                        }
                    >

                        <X size={13} />

                    </button>

                </div>

            )}


            {/* =================================================
                THREAT STATS
            ================================================= */}

            <div className="threat-stats">


                <div className="threat-stat">

                    <div className="threat-stat-icon cyan">

                        <Activity size={17} />

                    </div>

                    <div>

                        <span>
                            TOTAL THREATS
                        </span>

                        <strong>
                            {summary.total}
                        </strong>

                    </div>

                </div>


                <div className="threat-stat">

                    <div className="threat-stat-icon red">

                        <ShieldAlert size={17} />

                    </div>

                    <div>

                        <span>
                            HIGH RISK
                        </span>

                        <strong>
                            {summary.high}
                        </strong>

                    </div>

                </div>


                <div className="threat-stat">

                    <div className="threat-stat-icon orange">

                        <AlertTriangle size={17} />

                    </div>

                    <div>

                        <span>
                            MEDIUM RISK
                        </span>

                        <strong>
                            {summary.medium}
                        </strong>

                    </div>

                </div>


                <div className="threat-stat">

                    <div className="threat-stat-icon purple">

                        <Zap size={17} />

                    </div>

                    <div>

                        <span>
                            ACTIVE THREATS
                        </span>

                        <strong>
                            {summary.active}
                        </strong>

                    </div>

                </div>


                <div className="threat-stat">

                    <div className="threat-stat-icon green">

                        <ShieldCheck size={17} />

                    </div>

                    <div>

                        <span>
                            RESOLVED
                        </span>

                        <strong>
                            {summary.resolved}
                        </strong>

                    </div>

                </div>


            </div>


            {/* =================================================
                THREAT CONTROL BAR
            ================================================= */}

            <div className="threat-toolbar">


                <div className="threat-search">

                    <Search size={14} />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search threat, transaction, IP, device..."
                    />

                    {search && (

                        <button
                            onClick={() =>
                                setSearch("")
                            }
                        >

                            <X size={13} />

                        </button>

                    )}

                </div>


                <div className="threat-filter">

                    <Filter size={13} />

                    <select
                        value={filter}
                        onChange={(event) =>
                            setFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Threats
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="HIGH">
                            High Risk
                        </option>

                        <option value="MEDIUM">
                            Medium Risk
                        </option>

                        <option value="RESOLVED">
                            Resolved
                        </option>

                        <option value="BLOCKED">
                            Blocked
                        </option>

                    </select>

                </div>


                <div className="engine-status">

                    <span></span>

                    AI RISK ENGINE ONLINE

                </div>

            </div>


            {/* =================================================
                THREAT LIST
            ================================================= */}

            <div className="threat-panel">


                <div className="panel-header">

                    <div>

                        <div className="panel-label">
                            SECURITY OPERATIONS
                        </div>

                        <h3>
                            Threat Monitor
                        </h3>

                    </div>


                    <div className="record-count">

                        {filteredThreats.length}
                        {" "}
                        EVENTS

                    </div>

                </div>


                {loading ? (

                    <div className="threat-loading">

                        <RefreshCw
                            size={23}
                            className="spin"
                        />

                        <p>
                            Running threat intelligence...
                        </p>

                    </div>

                ) : filteredThreats.length === 0 ? (

                    <div className="threat-empty">

                        <div className="threat-empty-icon">

                            <ShieldCheck
                                size={27}
                            />

                        </div>


                        <h3>
                            No matching threats
                        </h3>


                        <p>
                            The threat monitor has no
                            records matching the current
                            filter.
                        </p>


                        {filter !== "ALL" && (

                            <button
                                className="secondary-action"
                                onClick={() =>
                                    setFilter("ALL")
                                }
                            >

                                Show All Threats

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="threat-list">

                        {filteredThreats.map(
                            (threat, index) => {

                                const severity =
                                    severityOf(
                                        threat
                                    );

                                const status =
                                    statusOf(
                                        threat
                                    );

                                const risk =
                                    getRiskScore(
                                        threat
                                    );

                                const threatId =
                                    getThreatId(
                                        threat,
                                        index
                                    );


                                return (

                                    <div
                                        className={
                                            `threat-row ${severityClass(
                                                severity
                                            )}`
                                        }
                                        key={threatId}
                                    >


                                        <div
                                            className={
                                                `threat-severity ${severityClass(
                                                    severity
                                                )}`
                                            }
                                        >

                                            {severityIcon(
                                                severity
                                            )}

                                            <span>
                                                {severity}
                                            </span>

                                        </div>


                                        <div className="threat-main">

                                            <div className="threat-title">

                                                <strong>
                                                    {threat.threat_type ||
                                                        threat.type ||
                                                        "Suspicious Activity"}
                                                </strong>

                                                <span>
                                                    {threatId}
                                                </span>

                                            </div>


                                            <p>

                                                {threat.description ||
                                                    threat.reason ||
                                                    "Potentially suspicious blockchain activity detected by the risk engine."}

                                            </p>


                                            <div className="threat-meta">

                                                <span>

                                                    <WalletCards
                                                        size={11}
                                                    />

                                                    {threat.transaction_id ||
                                                        "No transaction"}

                                                </span>


                                                <span>

                                                    <Globe
                                                        size={11}
                                                    />

                                                    {threat.ip_address ||
                                                        "Unknown IP"}

                                                </span>


                                                <span>

                                                    <Smartphone
                                                        size={11}
                                                    />

                                                    {threat.device ||
                                                        "Unknown device"}

                                                </span>

                                            </div>

                                        </div>


                                        <div className="risk-score">

                                            <span>
                                                RISK
                                            </span>

                                            <strong>
                                                {risk}
                                            </strong>

                                            <small>
                                                / 100
                                            </small>

                                        </div>


                                        <div className="threat-status-column">

                                            <span
                                                className={
                                                    `threat-status ${status.toLowerCase()}`
                                                }
                                            >

                                                {status}

                                            </span>


                                            <span className="threat-time">

                                                <Clock3
                                                    size={10}
                                                />

                                                {formatDate(
                                                    threat.created_at ||
                                                    threat.detected_at
                                                )}

                                            </span>

                                        </div>


                                        <button
                                            className="threat-view-button"
                                            onClick={() =>
                                                setSelectedThreat(
                                                    threat
                                                )
                                            }
                                        >

                                            <Eye size={13} />

                                            Details

                                        </button>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* =================================================
                THREAT FOOTER
            ================================================= */}

            <div className="threat-footer">


                <div>

                    <Activity size={13} />

                    <span>
                        REAL-TIME MONITORING
                    </span>

                    <strong>
                        ACTIVE
                    </strong>

                </div>


                <div>

                    <Zap size={13} />

                    <span>
                        RISK ENGINE
                    </span>

                    <strong>
                        ONLINE
                    </strong>

                </div>


                <div>

                    <ShieldCheck size={13} />

                    <span>
                        RESPONSE ENGINE
                    </span>

                    <strong>
                        READY
                    </strong>

                </div>

            </div>


            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedThreat && (

                <div
                    className="threat-modal-overlay"
                    onClick={() =>
                        setSelectedThreat(null)
                    }
                >

                    <div
                        className="threat-details-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="threat-modal-header">

                            <div>

                                <div className="panel-label">
                                    THREAT INVESTIGATION
                                </div>

                                <h2>

                                    {selectedThreat.threat_type ||
                                        selectedThreat.type ||
                                        "Security Threat"}

                                </h2>

                            </div>


                            <button
                                onClick={() =>
                                    setSelectedThreat(
                                        null
                                    )
                                }
                            >

                                <X size={17} />

                            </button>

                        </div>


                        <div
                            className={
                                `threat-alert-banner ${severityClass(
                                    severityOf(
                                        selectedThreat
                                    )
                                )}`
                            }
                        >

                            {severityIcon(
                                severityOf(
                                    selectedThreat
                                )
                            )}

                            <div>

                                <strong>

                                    {severityOf(
                                        selectedThreat
                                    )}
                                    {" "}
                                    RISK DETECTED

                                </strong>

                                <span>

                                    Threat intelligence
                                    engine generated this
                                    event.

                                </span>

                            </div>

                        </div>


                        <div className="threat-detail-grid">


                            <div className="detail-item">

                                <label>
                                    THREAT ID
                                </label>

                                <strong>
                                    {selectedThreat.threat_id ||
                                        selectedThreat.id ||
                                        "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    RISK SCORE
                                </label>

                                <strong className="detail-risk">

                                    {getRiskScore(
                                        selectedThreat
                                    )}

                                    <small>
                                        /100
                                    </small>

                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    STATUS
                                </label>

                                <strong>
                                    {statusOf(
                                        selectedThreat
                                    )}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    DETECTED
                                </label>

                                <strong>
                                    {formatDate(
                                        selectedThreat.created_at ||
                                        selectedThreat.detected_at
                                    )}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    TRANSACTION ID
                                </label>

                                <strong>
                                    {selectedThreat.transaction_id ||
                                        "Not linked"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    IP ADDRESS
                                </label>

                                <strong>
                                    {selectedThreat.ip_address ||
                                        "Unknown"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    DEVICE
                                </label>

                                <strong>
                                    {selectedThreat.device ||
                                        "Unknown"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <label>
                                    THREAT TYPE
                                </label>

                                <strong>
                                    {selectedThreat.threat_type ||
                                        selectedThreat.type ||
                                        "Suspicious Activity"}
                                </strong>

                            </div>


                            <div className="detail-item full">

                                <label>
                                    DETECTION REASON
                                </label>

                                <div className="reason-box">

                                    {selectedThreat.description ||
                                        selectedThreat.reason ||
                                        "The risk engine identified unusual transaction characteristics."}

                                </div>

                            </div>

                        </div>


                        <div className="threat-response">

                            <div className="panel-label">
                                RESPONSE ACTION
                            </div>


                            <div className="response-buttons">

                                <button
                                    className="resolve-button"
                                    disabled={
                                        updating ===
                                        (
                                            selectedThreat.threat_id ||
                                            selectedThreat.id
                                        )
                                    }
                                    onClick={() =>
                                        changeThreatStatus(
                                            selectedThreat,
                                            "RESOLVED"
                                        )
                                    }
                                >

                                    <CheckCircle2
                                        size={13}
                                    />

                                    Resolve

                                </button>


                                <button
                                    className="block-button"
                                    disabled={
                                        updating ===
                                        (
                                            selectedThreat.threat_id ||
                                            selectedThreat.id
                                        )
                                    }
                                    onClick={() =>
                                        changeThreatStatus(
                                            selectedThreat,
                                            "BLOCKED"
                                        )
                                    }
                                >

                                    <Ban
                                        size={13}
                                    />

                                    Block

                                </button>


                                <button
                                    className="active-button"
                                    disabled={
                                        updating ===
                                        (
                                            selectedThreat.threat_id ||
                                            selectedThreat.id
                                        )
                                    }
                                    onClick={() =>
                                        changeThreatStatus(
                                            selectedThreat,
                                            "ACTIVE"
                                        )
                                    }
                                >

                                    <Zap
                                        size={13}
                                    />

                                    Reopen

                                </button>

                            </div>

                        </div>


                        <div className="threat-modal-footer">

                            <button
                                className="secondary-action"
                                onClick={() =>
                                    setSelectedThreat(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default ThreatDetection;