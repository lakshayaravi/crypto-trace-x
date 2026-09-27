import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Database,
    RefreshCw,
    Shield,
    TrendingUp
} from "lucide-react";

import { getAnalytics } from "../services/api";

function SecurityAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function loadAnalytics(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const data = await getAnalytics();

            setAnalytics(data);
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Unable to load security analytics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadAnalytics();
    }, []);

    const totals = analytics?.totals || {};

    const riskDistribution =
        analytics?.risk_distribution ||
        analytics?.riskDistribution ||
        {};

    const threatDistribution =
        analytics?.threat_distribution ||
        analytics?.threatDistribution ||
        {};

    const topSenders =
        analytics?.top_senders ||
        analytics?.topSenders ||
        [];

    const topReceivers =
        analytics?.top_receivers ||
        analytics?.topReceivers ||
        [];

    const dailyTrend =
        analytics?.daily_trend ||
        analytics?.dailyTrend ||
        [];

    const riskRows = useMemo(() => {
        return [
            {
                label: "High Risk",
                value: Number(
                    riskDistribution.High ??
                    riskDistribution.high ??
                    0
                ),
                className: "analytics-high"
            },
            {
                label: "Medium Risk",
                value: Number(
                    riskDistribution.Medium ??
                    riskDistribution.medium ??
                    0
                ),
                className: "analytics-medium"
            },
            {
                label: "Low Risk",
                value: Number(
                    riskDistribution.Low ??
                    riskDistribution.low ??
                    0
                ),
                className: "analytics-low"
            }
        ];
    }, [riskDistribution]);

    const maxRisk =
        Math.max(
            ...riskRows.map(
                (item) => item.value
            ),
            1
        );

    const maxTrend =
        Math.max(
            ...dailyTrend.map(
                (item) =>
                    Number(
                        item.count ??
                        item.total ??
                        item.transactions ??
                        0
                    )
            ),
            1
        );

    function getName(item) {
        return (
            item.name ??
            item.sender ??
            item.receiver ??
            item.address ??
            item.id ??
            "Unknown"
        );
    }

    function getCount(item) {
        return Number(
            item.count ??
            item.total ??
            item.transactions ??
            0
        );
    }

    function getAmount(item) {
        return Number(
            item.amount ??
            item.volume ??
            item.total_amount ??
            0
        );
    }

    return (
        <div className="analytics-page">

            <div className="module-header">

                <div>
                    <div className="eyebrow">
                        <span></span>
                        SECURITY INTELLIGENCE
                    </div>

                    <h1>
                        Security Analytics
                    </h1>

                    <p>
                        Analyze transaction behavior,
                        risk distribution, threat activity
                        and blockchain security trends.
                    </p>
                </div>

                <button
                    className="secondary-action"
                    onClick={() =>
                        loadAnalytics(false)
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


            {error && (
                <div className="analytics-error">
                    <AlertTriangle size={14} />
                    {error}
                </div>
            )}


            {loading ? (

                <div className="analytics-loading">
                    <RefreshCw
                        size={25}
                        className="spin"
                    />

                    <span>
                        Calculating security intelligence...
                    </span>
                </div>

            ) : (

                <>
                    {/* TOP METRICS */}

                    <div className="analytics-metrics">

                        <div className="analytics-card">

                            <div className="analytics-card-icon cyan">
                                <Database size={17} />
                            </div>

                            <div>
                                <span>
                                    TOTAL TRANSACTIONS
                                </span>

                                <strong>
                                    {totals.total_transactions ??
                                        totals.transactions ??
                                        0}
                                </strong>
                            </div>

                            <small>
                                Blockchain activity
                            </small>

                        </div>


                        <div className="analytics-card">

                            <div className="analytics-card-icon red">
                                <Shield size={17} />
                            </div>

                            <div>
                                <span>
                                    HIGH RISK
                                </span>

                                <strong>
                                    {totals.high_risk ??
                                        totals.highRisk ??
                                        0}
                                </strong>
                            </div>

                            <small>
                                Requires investigation
                            </small>

                        </div>


                        <div className="analytics-card">

                            <div className="analytics-card-icon orange">
                                <AlertTriangle size={17} />
                            </div>

                            <div>
                                <span>
                                    ACTIVE THREATS
                                </span>

                                <strong>
                                    {totals.active_threats ??
                                        totals.activeThreats ??
                                        0}
                                </strong>
                            </div>

                            <small>
                                Threat events detected
                            </small>

                        </div>


                        <div className="analytics-card">

                            <div className="analytics-card-icon green">
                                <TrendingUp size={17} />
                            </div>

                            <div>
                                <span>
                                    DETECTION STATUS
                                </span>

                                <strong>
                                    ACTIVE
                                </strong>
                            </div>

                            <small>
                                AI risk engine online
                            </small>

                        </div>

                    </div>


                    {/* MAIN GRID */}

                    <div className="analytics-grid">

                        {/* RISK DISTRIBUTION */}

                        <section className="analytics-panel">

                            <div className="analytics-panel-header">

                                <div>
                                    <div className="panel-label">
                                        RISK INTELLIGENCE
                                    </div>

                                    <h3>
                                        Risk Distribution
                                    </h3>
                                </div>

                                <Shield
                                    size={16}
                                />

                            </div>


                            <div className="risk-bars">

                                {riskRows.map(
                                    (item) => {

                                        const width =
                                            Math.max(
                                                4,
                                                (
                                                    item.value /
                                                    maxRisk
                                                ) * 100
                                            );

                                        return (
                                            <div
                                                className="risk-row"
                                                key={
                                                    item.label
                                                }
                                            >

                                                <div className="risk-row-top">

                                                    <span>
                                                        {
                                                            item.label
                                                        }
                                                    </span>

                                                    <strong>
                                                        {
                                                            item.value
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="risk-track">

                                                    <div
                                                        className={
                                                            `risk-fill ${item.className}`
                                                        }
                                                        style={{
                                                            width:
                                                                `${width}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </section>


                        {/* THREAT DISTRIBUTION */}

                        <section className="analytics-panel">

                            <div className="analytics-panel-header">

                                <div>
                                    <div className="panel-label">
                                        THREAT INTELLIGENCE
                                    </div>

                                    <h3>
                                        Threat Distribution
                                    </h3>
                                </div>

                                <AlertTriangle
                                    size={16}
                                />

                            </div>


                            <div className="threat-list">

                                {Object.keys(
                                    threatDistribution
                                ).length === 0 ? (

                                    <div className="analytics-empty">
                                        No threat distribution
                                        data available.
                                    </div>

                                ) : (

                                    Object.entries(
                                        threatDistribution
                                    ).map(
                                        ([name, value]) => (
                                            <div
                                                className="threat-row"
                                                key={name}
                                            >

                                                <div>
                                                    <span>
                                                        {name}
                                                    </span>

                                                    <strong>
                                                        {Number(
                                                            value
                                                        )}
                                                    </strong>
                                                </div>

                                                <div className="threat-progress">

                                                    <div
                                                        style={{
                                                            width:
                                                                `${Math.max(
                                                                    5,
                                                                    (
                                                                        Number(
                                                                            value
                                                                        ) /
                                                                        Math.max(
                                                                            ...Object.values(
                                                                                threatDistribution
                                                                            ).map(
                                                                                Number
                                                                            ),
                                                                            1
                                                                        )
                                                                    ) *
                                                                    100
                                                                )}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        )
                                    )
                                )}

                            </div>

                        </section>


                        {/* ACTIVITY TREND */}

                        <section className="analytics-panel analytics-wide">

                            <div className="analytics-panel-header">

                                <div>
                                    <div className="panel-label">
                                        ACTIVITY MONITOR
                                    </div>

                                    <h3>
                                        Transaction Activity
                                    </h3>
                                </div>

                                <Activity
                                    size={16}
                                />

                            </div>


                            <div className="trend-chart">

                                {dailyTrend.length === 0 ? (

                                    <div className="analytics-empty">
                                        No daily transaction
                                        trend available.
                                    </div>

                                ) : (

                                    dailyTrend.map(
                                        (item, index) => {

                                            const count =
                                                Number(
                                                    item.count ??
                                                    item.total ??
                                                    item.transactions ??
                                                    0
                                                );

                                            const height =
                                                Math.max(
                                                    8,
                                                    (
                                                        count /
                                                        maxTrend
                                                    ) * 100
                                                );

                                            const label =
                                                item.date ??
                                                item.day ??
                                                `D${index + 1}`;

                                            return (
                                                <div
                                                    className="trend-column"
                                                    key={
                                                        `${label}-${index}`
                                                    }
                                                >

                                                    <div className="trend-value">
                                                        {count}
                                                    </div>

                                                    <div className="trend-bar-area">

                                                        <div
                                                            className="trend-bar"
                                                            style={{
                                                                height:
                                                                    `${height}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <span>
                                                        {String(
                                                            label
                                                        ).slice(
                                                            -5
                                                        )}
                                                    </span>

                                                </div>
                                            );
                                        }
                                    )
                                )}

                            </div>

                        </section>


                        {/* TOP SENDERS */}

                        <section className="analytics-panel">

                            <div className="analytics-panel-header">

                                <div>
                                    <div className="panel-label">
                                        SOURCE ANALYSIS
                                    </div>

                                    <h3>
                                        Top Senders
                                    </h3>
                                </div>

                                <Activity
                                    size={16}
                                />

                            </div>


                            <div className="ranking-list">

                                {topSenders.length === 0 ? (

                                    <div className="analytics-empty">
                                        No sender data.
                                    </div>

                                ) : (

                                    topSenders
                                        .slice(0, 5)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="ranking-row"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="rank-number">
                                                        {String(
                                                            index + 1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </div>

                                                    <div className="rank-info">

                                                        <strong>
                                                            {
                                                                getName(
                                                                    item
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getCount(
                                                                    item
                                                                )
                                                            }{" "}
                                                            transactions
                                                        </span>

                                                    </div>

                                                    <div className="rank-amount">
                                                        {getAmount(
                                                            item
                                                        ).toLocaleString()}
                                                    </div>

                                                </div>
                                            )
                                        )
                                )}

                            </div>

                        </section>


                        {/* TOP RECEIVERS */}

                        <section className="analytics-panel">

                            <div className="analytics-panel-header">

                                <div>
                                    <div className="panel-label">
                                        DESTINATION ANALYSIS
                                    </div>

                                    <h3>
                                        Top Receivers
                                    </h3>
                                </div>

                                <BarChart3
                                    size={16}
                                />

                            </div>


                            <div className="ranking-list">

                                {topReceivers.length === 0 ? (

                                    <div className="analytics-empty">
                                        No receiver data.
                                    </div>

                                ) : (

                                    topReceivers
                                        .slice(0, 5)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="ranking-row"
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <div className="rank-number">
                                                        {String(
                                                            index + 1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </div>

                                                    <div className="rank-info">

                                                        <strong>
                                                            {
                                                                getName(
                                                                    item
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getCount(
                                                                    item
                                                                )
                                                            }{" "}
                                                            transactions
                                                        </span>

                                                    </div>

                                                    <div className="rank-amount">
                                                        {getAmount(
                                                            item
                                                        ).toLocaleString()}
                                                    </div>

                                                </div>
                                            )
                                        )
                                )}

                            </div>

                        </section>

                    </div>


                    {/* ANALYTICS FOOTER */}

                    <div className="analytics-status">

                        <div>
                            <span className="status-dot green-dot"></span>
                            ANALYTICS ENGINE
                            <strong>ONLINE</strong>
                        </div>

                        <div>
                            <span className="status-dot cyan-dot"></span>
                            RISK CORRELATION
                            <strong>ACTIVE</strong>
                        </div>

                        <div>
                            <span className="status-dot purple-dot"></span>
                            BEHAVIOR ANALYSIS
                            <strong>RUNNING</strong>
                        </div>

                    </div>

                </>
            )}

        </div>
    );
}

export default SecurityAnalytics;