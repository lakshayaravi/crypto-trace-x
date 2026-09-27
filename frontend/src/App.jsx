import { useEffect, useState } from "react";
import {
    Shield,
    LayoutDashboard,
    AlertTriangle,
    FileSearch,
    Network,
    BarChart3,
    Database,
    Activity,
    Blocks,
    Search,
    RefreshCw,
    ShieldCheck,
    ShieldAlert,
    Menu,
    X,
    ChevronRight,
    Clock,
    Globe,
    Cpu,
    ArrowUpRight,
    CheckCircle2,
    XCircle,
    Eye,
    Filter,
    Zap
} from "lucide-react";

import {
    getHealth,
    getDashboard,
    getThreats,
    getThreatSummary,
    getActivity,
    updateThreatStatus
} from "./services/api";

import "./App.css";


function App() {

    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [health, setHealth] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [threatSummary, setThreatSummary] = useState(null);
    const [activity, setActivity] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            id: "threats",
            label: "Threat Detection",
            icon: AlertTriangle
        },
        {
            id: "evidence",
            label: "Evidence Vault",
            icon: FileSearch
        },
        {
            id: "network",
            label: "Transaction Network",
            icon: Network
        },
        {
            id: "analytics",
            label: "Security Analytics",
            icon: BarChart3
        },
        {
            id: "transactions",
            label: "Transactions",
            icon: Database
        },
        {
            id: "blockchain",
            label: "Blockchain",
            icon: Blocks
        }
    ];


    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const [
                healthData,
                dashboardData,
                threatData,
                activityData
            ] = await Promise.all([
                getHealth(),
                getDashboard(),
                getThreatSummary(),
                getActivity()
            ]);

            setHealth(healthData);
            setDashboard(dashboardData);
            setThreatSummary(threatData);
            setActivity(
                activityData.activities || []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Unable to connect to Crypto Trace X backend. Make sure Flask is running on port 5000."
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadDashboard();
    }, []);


    function handleNavigation(page) {

        setActivePage(page);
        setSidebarOpen(false);

    }


    function renderPage() {

        switch (activePage) {

            case "threats":

                return (
                    <ThreatDetectionPage />
                );

            case "evidence":

                return (
                    <PlaceholderPage
                        title="Evidence Vault"
                        subtitle="Securely store, verify and investigate digital evidence."
                        icon={<FileSearch />}
                    />
                );

            case "network":

                return (
                    <PlaceholderPage
                        title="Transaction Network"
                        subtitle="Visualize relationships between blockchain entities."
                        icon={<Network />}
                    />
                );

            case "analytics":

                return (
                    <PlaceholderPage
                        title="Security Analytics"
                        subtitle="Analyze transaction risk, threat patterns and security trends."
                        icon={<BarChart3 />}
                    />
                );

            case "transactions":

                return (
                    <PlaceholderPage
                        title="Transaction Intelligence"
                        subtitle="Inspect blockchain transactions and risk information."
                        icon={<Database />}
                    />
                );

            case "blockchain":

                return (
                    <PlaceholderPage
                        title="Blockchain Integrity"
                        subtitle="Verify blocks and detect blockchain tampering."
                        icon={<Blocks />}
                    />
                );

            default:

                return (
                    <DashboardPage
                        dashboard={dashboard}
                        threatSummary={threatSummary}
                        activity={activity}
                        health={health}
                    />
                );
        }
    }


    return (
        <div className="app">

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* SIDEBAR */}

            <aside
                className={`sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                <div className="brand">

                    <div className="brand-icon">
                        <Shield size={25} />
                    </div>

                    <div>
                        <h1>CRYPTO TRACE</h1>
                        <span>X</span>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="system-status">

                    <div className="status-dot"></div>

                    <div>
                        <strong>
                            SYSTEM ONLINE
                        </strong>

                        <small>
                            Threat intelligence active
                        </small>
                    </div>

                </div>


                <nav className="navigation">

                    <p className="nav-title">
                        INVESTIGATION
                    </p>

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${
                                    activePage === item.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleNavigation(
                                        item.id
                                    )
                                }
                            >

                                <Icon size={19} />

                                <span>
                                    {item.label}
                                </span>

                                {item.id === "threats" &&
                                    threatSummary?.active > 0 && (

                                        <b className="nav-badge">
                                            {
                                                threatSummary.active
                                            }
                                        </b>

                                    )}

                            </button>
                        );

                    })}

                </nav>


                <div className="sidebar-bottom">

                    <div className="engine-card">

                        <div className="engine-icon">
                            <Activity size={18} />
                        </div>

                        <div>
                            <strong>
                                AI RISK ENGINE
                            </strong>

                            <small>
                                Running in real-time
                            </small>
                        </div>

                        <div className="engine-dot"></div>

                    </div>

                    <div className="version">
                        CRYPTO TRACE X · v1.0
                    </div>

                </div>

            </aside>


            {/* MAIN */}

            <main className="main">

                <header className="topbar">

                    <button
                        className="mobile-menu"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                    >
                        <Menu size={22} />
                    </button>


                    <div className="page-heading">

                        <div className="breadcrumb">
                            SECURITY OPERATIONS
                            <span>/</span>
                            {activePage.toUpperCase()}
                        </div>

                        <h2>
                            {
                                menuItems.find(
                                    item =>
                                        item.id ===
                                        activePage
                                )?.label ||
                                "Dashboard"
                            }
                        </h2>

                    </div>


                    <div className="topbar-actions">

                        <button
                            className="icon-button"
                            onClick={loadDashboard}
                            title="Refresh"
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    loading
                                        ? "spin"
                                        : ""
                                }
                            />

                        </button>


                        <button className="search-button">

                            <Search size={18} />

                            <span>
                                Search investigation...
                            </span>

                            <kbd>
                                ⌘ K
                            </kbd>

                        </button>


                        <div className="analyst">

                            <div className="analyst-avatar">
                                LX
                            </div>

                            <div>

                                <strong>
                                    Security Analyst
                                </strong>

                                <small>
                                    Investigation Mode
                                </small>

                            </div>

                        </div>

                    </div>

                </header>


                <section className="content">

                    {error && (

                        <div className="connection-error">

                            <ShieldAlert size={20} />

                            <div>

                                <strong>
                                    Backend connection error
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                            <button
                                onClick={loadDashboard}
                            >
                                Retry
                            </button>

                        </div>

                    )}

                    {renderPage()}

                </section>

            </main>

        </div>
    );
}


/* =========================================================
   THREAT DETECTION PAGE
========================================================= */

function ThreatDetectionPage() {

    const [threats, setThreats] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [severityFilter, setSeverityFilter] =
        useState("ALL");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedThreat, setSelectedThreat] =
        useState(null);

    const [updating, setUpdating] =
        useState(false);

    const [pageError, setPageError] =
        useState("");


    async function loadThreats(showLoader = true) {

        try {

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setPageError("");

            const [
                threatData,
                summaryData
            ] = await Promise.all([
                getThreats(),
                getThreatSummary()
            ]);

            const receivedThreats =
                Array.isArray(threatData)
                    ? threatData
                    : (
                        threatData.threats ||
                        threatData.data ||
                        []
                    );

            setThreats(receivedThreats);

            setSummary(summaryData);

        } catch (err) {

            console.error(err);

            setPageError(
                err.message ||
                "Unable to load threat intelligence."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    }


    useEffect(() => {

        loadThreats(true);

    }, []);


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

            setUpdating(true);

            await updateThreatStatus(
                threatId,
                status
            );

            await loadThreats(false);

            if (
                selectedThreat &&
                (
                    selectedThreat.threat_id ===
                    threatId ||
                    selectedThreat.id ===
                    threatId
                )
            ) {

                setSelectedThreat({
                    ...selectedThreat,
                    status
                });

            }

        } catch (err) {

            alert(
                err.message ||
                "Unable to update threat status."
            );

        } finally {

            setUpdating(false);

        }
    }


    const filteredThreats =
        threats.filter((threat) => {

            const severity =
                String(
                    threat.severity ||
                    threat.risk_level ||
                    ""
                ).toUpperCase();

            const status =
                String(
                    threat.status ||
                    ""
                ).toUpperCase();

            const severityMatch =
                severityFilter === "ALL" ||
                severity === severityFilter;

            const statusMatch =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                severityMatch &&
                statusMatch
            );

        });


    const highCount =
        threats.filter(t =>
            ["HIGH", "CRITICAL"].includes(
                String(
                    t.severity ||
                    t.risk_level ||
                    ""
                ).toUpperCase()
            )
        ).length;


    const mediumCount =
        threats.filter(t =>
            String(
                t.severity ||
                t.risk_level ||
                ""
            ).toUpperCase() === "MEDIUM"
        ).length;


    const lowCount =
        threats.filter(t =>
            String(
                t.severity ||
                t.risk_level ||
                ""
            ).toUpperCase() === "LOW"
        ).length;


    const activeCount =
        threats.filter(t =>
            String(
                t.status ||
                ""
            ).toUpperCase() === "ACTIVE"
        ).length;


    return (
        <div className="threat-page">

            {/* HEADER */}

            <div className="threat-page-header">

                <div>

                    <div className="eyebrow">
                        <span></span>
                        LIVE THREAT INTELLIGENCE
                    </div>

                    <h1>
                        Threat Detection
                    </h1>

                    <p>
                        Identify, investigate and manage
                        suspicious blockchain activity.
                    </p>

                </div>


                <button
                    className="refresh-threats"
                    onClick={() =>
                        loadThreats(false)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "spin"
                                : ""
                        }
                    />

                    Refresh Intelligence

                </button>

            </div>


            {pageError && (

                <div className="threat-error">
                    <ShieldAlert size={18} />
                    {pageError}
                </div>

            )}


            {/* SECURITY SCORE STRIP */}

            <div className="threat-overview-grid">

                <ThreatOverviewCard
                    label="TOTAL THREATS"
                    value={threats.length}
                    icon={<AlertTriangle />}
                    type="cyan"
                />

                <ThreatOverviewCard
                    label="HIGH / CRITICAL"
                    value={highCount}
                    icon={<ShieldAlert />}
                    type="red"
                />

                <ThreatOverviewCard
                    label="MEDIUM RISK"
                    value={mediumCount}
                    icon={<Zap />}
                    type="orange"
                />

                <ThreatOverviewCard
                    label="ACTIVE CASES"
                    value={
                        summary?.active ??
                        activeCount
                    }
                    icon={<Eye />}
                    type="purple"
                />

            </div>


            {/* THREAT INTELLIGENCE BAR */}

            <div className="threat-intelligence-bar">

                <div className="intelligence-title">

                    <div className="intelligence-icon">
                        <Activity size={18} />
                    </div>

                    <div>

                        <strong>
                            AI THREAT ENGINE
                        </strong>

                        <span>
                            Continuous transaction
                            monitoring
                        </span>

                    </div>

                </div>


                <div className="intelligence-stats">

                    <div>
                        <span>HIGH</span>
                        <strong className="text-red">
                            {highCount}
                        </strong>
                    </div>

                    <div>
                        <span>MEDIUM</span>
                        <strong className="text-orange">
                            {mediumCount}
                        </strong>
                    </div>

                    <div>
                        <span>LOW</span>
                        <strong className="text-green">
                            {lowCount}
                        </strong>
                    </div>

                    <div>
                        <span>ACTIVE</span>
                        <strong className="text-cyan">
                            {activeCount}
                        </strong>
                    </div>

                </div>

            </div>


            {/* FILTER BAR */}

            <div className="threat-toolbar">

                <div className="toolbar-title">

                    <Filter size={16} />

                    <strong>
                        Threat Queue
                    </strong>

                    <span>
                        {filteredThreats.length}
                        {" "}events
                    </span>

                </div>


                <div className="filters">

                    <div className="filter-group">

                        <span>
                            SEVERITY
                        </span>

                        <select
                            value={severityFilter}
                            onChange={(e) =>
                                setSeverityFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Severity
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                        </select>

                    </div>


                    <div className="filter-group">

                        <span>
                            STATUS
                        </span>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INVESTIGATING">
                                Investigating
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                            <option value="DISMISSED">
                                Dismissed
                            </option>

                        </select>

                    </div>

                </div>

            </div>


            {/* THREAT LIST */}

            <div className="threat-content">

                <div className="threat-list">

                    {loading ? (

                        <ThreatLoading />

                    ) : filteredThreats.length === 0 ? (

                        <EmptyThreatState />

                    ) : (

                        filteredThreats.map(
                            (threat, index) => (

                                <ThreatCard
                                    key={
                                        threat.threat_id ||
                                        threat.id ||
                                        index
                                    }
                                    threat={threat}
                                    selected={
                                        selectedThreat &&
                                        (
                                            selectedThreat.threat_id ||
                                            selectedThreat.id
                                        ) ===
                                        (
                                            threat.threat_id ||
                                            threat.id
                                        )
                                    }
                                    onClick={() =>
                                        setSelectedThreat(
                                            threat
                                        )
                                    }
                                />

                            )
                        )

                    )}

                </div>


                {/* DETAILS */}

                <ThreatDetailsPanel
                    threat={selectedThreat}
                    updating={updating}
                    onStatusChange={
                        changeThreatStatus
                    }
                    onClose={() =>
                        setSelectedThreat(null)
                    }
                />

            </div>

        </div>
    );
}


/* =========================================================
   THREAT OVERVIEW CARD
========================================================= */

function ThreatOverviewCard({
    label,
    value,
    icon,
    type
}) {

    return (
        <div
            className={`threat-overview-card ${type}`}
        >

            <div className="overview-card-top">

                <span>
                    {label}
                </span>

                <div className="overview-icon">
                    {icon}
                </div>

            </div>

            <strong>
                {value}
            </strong>

            <div className="overview-bottom">
                <span>
                    SECURITY MONITOR
                </span>

                <ArrowUpRight
                    size={13}
                />
            </div>

        </div>
    );
}


/* =========================================================
   THREAT CARD
========================================================= */

function ThreatCard({
    threat,
    selected,
    onClick
}) {

    const severity =
        String(
            threat.severity ||
            threat.risk_level ||
            "UNKNOWN"
        ).toUpperCase();


    const status =
        String(
            threat.status ||
            "ACTIVE"
        ).toUpperCase();


    const threatTitle =
        threat.title ||
        threat.threat_type ||
        threat.type ||
        threat.reason ||
        "Suspicious Activity";


    const threatId =
        threat.threat_id ||
        threat.id ||
        "UNKNOWN";


    const transactionId =
        threat.transaction_id ||
        threat.tx_id ||
        "N/A";


    const timestamp =
        threat.created_at ||
        threat.detected_at ||
        threat.timestamp ||
        "Recent";


    const description =
        threat.description ||
        threat.message ||
        threat.reason ||
        "Security engine detected suspicious blockchain activity.";


    return (
        <button
            className={`threat-card ${
                selected
                    ? "selected"
                    : ""
            }`}
            onClick={onClick}
        >

            <div
                className={`threat-severity-bar ${
                    severity.toLowerCase()
                }`}
            />


            <div className="threat-card-main">

                <div className="threat-card-top">

                    <div className="threat-type-icon">

                        {severity === "CRITICAL" ||
                        severity === "HIGH" ? (
                            <ShieldAlert size={18} />
                        ) : (
                            <AlertTriangle size={18} />
                        )}

                    </div>


                    <div className="threat-card-title">

                        <strong>
                            {threatTitle}
                        </strong>

                        <span>
                            Threat ID: {threatId}
                        </span>

                    </div>


                    <SeverityBadge
                        severity={severity}
                    />

                </div>


                <p className="threat-description">
                    {description}
                </p>


                <div className="threat-card-meta">

                    <span>
                        <Blocks size={12} />
                        {transactionId}
                    </span>

                    <span>
                        <Clock size={12} />
                        {timestamp}
                    </span>

                    {threat.ip_address && (
                        <span>
                            <Globe size={12} />
                            {threat.ip_address}
                        </span>
                    )}

                    {threat.device && (
                        <span>
                            <Cpu size={12} />
                            {threat.device}
                        </span>
                    )}

                </div>

            </div>


            <div className="threat-card-status">

                <StatusBadge
                    status={status}
                />

                <ChevronRight
                    size={17}
                />

            </div>

        </button>
    );
}


/* =========================================================
   SEVERITY BADGE
========================================================= */

function SeverityBadge({
    severity
}) {

    return (
        <span
            className={`severity-badge ${
                severity.toLowerCase()
            }`}
        >
            <span></span>
            {severity}
        </span>
    );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status
}) {

    return (
        <span
            className={`status-badge ${
                status.toLowerCase()
            }`}
        >
            {status}
        </span>
    );
}


/* =========================================================
   DETAILS PANEL
========================================================= */

function ThreatDetailsPanel({
    threat,
    updating,
    onStatusChange,
    onClose
}) {

    if (!threat) {

        return (
            <div className="threat-details empty-details">

                <div className="details-empty-icon">
                    <Eye size={23} />
                </div>

                <h3>
                    Select a Threat
                </h3>

                <p>
                    Select a threat event from the
                    investigation queue to inspect
                    its evidence and status.
                </p>

            </div>
        );
    }


    const severity =
        String(
            threat.severity ||
            threat.risk_level ||
            "UNKNOWN"
        ).toUpperCase();


    const status =
        String(
            threat.status ||
            "ACTIVE"
        ).toUpperCase();


    const threatId =
        threat.threat_id ||
        threat.id ||
        "UNKNOWN";


    const transactionId =
        threat.transaction_id ||
        threat.tx_id ||
        "N/A";


    const title =
        threat.title ||
        threat.threat_type ||
        threat.type ||
        threat.reason ||
        "Suspicious Activity";


    const description =
        threat.description ||
        threat.message ||
        threat.reason ||
        "The AI risk engine identified suspicious activity associated with this event.";


    return (
        <div className="threat-details">

            <div className="details-header">

                <div>

                    <span className="panel-label">
                        THREAT INVESTIGATION
                    </span>

                    <h3>
                        Event Details
                    </h3>

                </div>

                <button
                    className="details-close"
                    onClick={onClose}
                >
                    <X size={17} />
                </button>

            </div>


            <div
                className={`details-threat-icon ${
                    severity.toLowerCase()
                }`}
            >

                {severity === "HIGH" ||
                severity === "CRITICAL" ? (
                    <ShieldAlert size={26} />
                ) : (
                    <AlertTriangle size={26} />
                )}

            </div>


            <h2 className="details-title">
                {title}
            </h2>


            <div className="details-badges">

                <SeverityBadge
                    severity={severity}
                />

                <StatusBadge
                    status={status}
                />

            </div>


            <p className="details-description">
                {description}
            </p>


            <div className="details-section">

                <span className="details-section-title">
                    IDENTIFICATION
                </span>


                <DetailItem
                    label="Threat ID"
                    value={threatId}
                />

                <DetailItem
                    label="Transaction ID"
                    value={transactionId}
                />

                <DetailItem
                    label="Detected"
                    value={
                        threat.created_at ||
                        threat.detected_at ||
                        "N/A"
                    }
                />

            </div>


            <div className="details-section">

                <span className="details-section-title">
                    NETWORK INTELLIGENCE
                </span>


                <DetailItem
                    label="Source IP"
                    value={
                        threat.ip_address ||
                        threat.source_ip ||
                        "Not available"
                    }
                />

                <DetailItem
                    label="Device"
                    value={
                        threat.device ||
                        threat.device_id ||
                        "Not available"
                    }
                />

                <DetailItem
                    label="Risk Score"
                    value={
                        threat.risk_score !==
                        undefined
                            ? threat.risk_score
                            : "Not available"
                    }
                />

            </div>


            <div className="details-actions">

                <span className="details-section-title">
                    CASE ACTION
                </span>


                <button
                    className="investigate-button"
                    disabled={updating}
                    onClick={() =>
                        onStatusChange(
                            threat,
                            "INVESTIGATING"
                        )
                    }
                >

                    <Eye size={15} />

                    Mark Investigating

                </button>


                <button
                    className="resolve-button"
                    disabled={updating}
                    onClick={() =>
                        onStatusChange(
                            threat,
                            "RESOLVED"
                        )
                    }
                >

                    <CheckCircle2 size={15} />

                    Resolve Threat

                </button>


                <button
                    className="dismiss-button"
                    disabled={updating}
                    onClick={() =>
                        onStatusChange(
                            threat,
                            "DISMISSED"
                        )
                    }
                >

                    <XCircle size={15} />

                    Dismiss

                </button>

            </div>

        </div>
    );
}


/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
    label,
    value
}) {

    return (
        <div className="detail-item">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


/* =========================================================
   LOADING
========================================================= */

function ThreatLoading() {

    return (
        <div className="threat-loading">

            <RefreshCw
                size={24}
                className="spin"
            />

            <span>
                Loading threat intelligence...
            </span>

        </div>
    );
}


/* =========================================================
   EMPTY
========================================================= */

function EmptyThreatState() {

    return (
        <div className="empty-threat">

            <div>
                <ShieldCheck size={32} />
            </div>

            <h3>
                No threats found
            </h3>

            <p>
                No threat events match the current
                severity and status filters.
            </p>

        </div>
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage({
    dashboard,
    threatSummary,
    activity,
    health
}) {

    const totalTransactions =
        dashboard?.total_transactions ?? 0;

    const highRisk =
        dashboard?.high_risk ?? 0;

    const mediumRisk =
        dashboard?.medium_risk ?? 0;

    const blocked =
        dashboard?.blocked ?? 0;

    const activeThreats =
        threatSummary?.active ?? 0;

    const resolvedThreats =
        threatSummary?.resolved ?? 0;


    return (
        <div className="dashboard">

            <div className="dashboard-hero">

                <div>

                    <div className="eyebrow">
                        <span></span>
                        LIVE THREAT INTELLIGENCE
                    </div>

                    <h1>
                        Blockchain Security
                        <br />
                        <em>
                            Command Center
                        </em>
                    </h1>

                    <p>
                        Monitor transactions, detect threats,
                        preserve digital evidence and investigate
                        blockchain activity from one security console.
                    </p>

                </div>


                <div className="hero-status">

                    <ShieldCheck size={30} />

                    <div>
                        <strong>
                            PROTECTION ACTIVE
                        </strong>

                        <span>
                            AI risk engine operational
                        </span>
                    </div>

                </div>

            </div>


            <div className="stats-grid">

                <StatCard
                    label="TOTAL TRANSACTIONS"
                    value={totalTransactions}
                    icon={<Database />}
                    className="cyan"
                />

                <StatCard
                    label="HIGH RISK"
                    value={highRisk}
                    icon={<ShieldAlert />}
                    className="red"
                />

                <StatCard
                    label="ACTIVE THREATS"
                    value={activeThreats}
                    icon={<AlertTriangle />}
                    className="orange"
                />

                <StatCard
                    label="BLOCKED"
                    value={blocked}
                    icon={<Blocks />}
                    className="purple"
                />

            </div>


            <div className="dashboard-grid">

                <div className="panel threat-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-label">
                                THREAT MONITOR
                            </span>

                            <h3>
                                Security Overview
                            </h3>

                        </div>

                        <button className="view-button">
                            LIVE
                        </button>

                    </div>


                    <div className="threat-rings">

                        <div className="risk-circle">

                            <div>

                                <strong>
                                    {highRisk +
                                        mediumRisk}
                                </strong>

                                <span>
                                    RISK EVENTS
                                </span>

                            </div>

                        </div>


                        <div className="risk-details">

                            <RiskRow
                                label="High Risk"
                                value={highRisk}
                                className="high"
                            />

                            <RiskRow
                                label="Medium Risk"
                                value={mediumRisk}
                                className="medium"
                            />

                            <RiskRow
                                label="Active Threats"
                                value={activeThreats}
                                className="active"
                            />

                            <RiskRow
                                label="Resolved"
                                value={resolvedThreats}
                                className="resolved"
                            />

                        </div>

                    </div>

                </div>


                <div className="panel system-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-label">
                                SYSTEM
                            </span>

                            <h3>
                                Security Engines
                            </h3>

                        </div>

                        <ShieldCheck
                            className="success-icon"
                            size={22}
                        />

                    </div>


                    <SystemRow
                        label="Threat Detection"
                        active
                    />

                    <SystemRow
                        label="Evidence Vault"
                        active
                    />

                    <SystemRow
                        label="Network Intelligence"
                        active
                    />

                    <SystemRow
                        label="Risk Analytics"
                        active
                    />

                    <SystemRow
                        label="Blockchain Verification"
                        active
                    />

                </div>

            </div>


            <div className="panel activity-panel">

                <div className="panel-header">

                    <div>

                        <span className="panel-label">
                            INVESTIGATION FEED
                        </span>

                        <h3>
                            Recent Security Activity
                        </h3>

                    </div>

                    <Activity size={21} />

                </div>


                {activity.length === 0 ? (

                    <div className="empty-activity">

                        <Activity size={30} />

                        <p>
                            No recent activity detected.
                        </p>

                        <span>
                            New transactions and security events
                            will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="activity-list">

                        {activity
                            .slice(0, 8)
                            .map(
                                (item, index) => (

                                    <div
                                        className="activity-row"
                                        key={
                                            item.id ||
                                            index
                                        }
                                    >

                                        <div className="activity-icon">
                                            <Activity
                                                size={16}
                                            />
                                        </div>

                                        <div className="activity-info">

                                            <strong>
                                                {
                                                    item.message ||
                                                    item.action ||
                                                    "Security activity"
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    item.created_at ||
                                                    "Recent"
                                                }
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                )}

            </div>


            <div className="dashboard-footer">

                <div>
                    <span className="live-dot"></span>
                    API STATUS

                    <strong>
                        {health?.status === "ok"
                            ? "CONNECTED"
                            : "CHECKING"}
                    </strong>
                </div>

                <div>
                    DATABASE
                    <strong>
                        SQLITE
                    </strong>
                </div>

                <div>
                    BLOCKCHAIN
                    <strong>
                        SHA-256
                    </strong>
                </div>

                <div>
                    RISK ENGINE
                    <strong>
                        ACTIVE
                    </strong>
                </div>

            </div>

        </div>
    );
}


/* =========================================================
   COMMON COMPONENTS
========================================================= */

function StatCard({
    label,
    value,
    icon,
    className
}) {

    return (
        <div
            className={`stat-card ${className}`}
        >

            <div className="stat-top">

                <span>
                    {label}
                </span>

                <div className="stat-icon">
                    {icon}
                </div>

            </div>

            <strong>
                {value}
            </strong>

            <div className="stat-line"></div>

        </div>
    );
}


function RiskRow({
    label,
    value,
    className
}) {

    return (
        <div className="risk-row">

            <div className="risk-label">

                <span
                    className={`risk-dot ${className}`}
                ></span>

                {label}

            </div>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function SystemRow({
    label,
    active
}) {

    return (
        <div className="system-row">

            <div className="system-name">

                <span
                    className={
                        active
                            ? "system-active"
                            : "system-inactive"
                    }
                ></span>

                {label}

            </div>

            <span
                className={`system-state ${
                    active
                        ? "online"
                        : "offline"
                }`}
            >
                {active
                    ? "OPERATIONAL"
                    : "OFFLINE"}
            </span>

        </div>
    );
}


function PlaceholderPage({
    title,
    subtitle,
    icon
}) {

    return (
        <div className="placeholder-page">

            <div className="placeholder-icon">
                {icon}
            </div>

            <span className="panel-label">
                CRYPTO TRACE X MODULE
            </span>

            <h1>
                {title}
            </h1>

            <p>
                {subtitle}
            </p>

            <div className="module-status">
                <span></span>
                MODULE READY
            </div>

        </div>
    );
}


export default App;