import React, { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowRight,
    CircleDot,
    Database,
    RefreshCw,
    Search,
    ShieldAlert,
    Wallet,
    X,
    ZoomIn,
    ZoomOut
} from "lucide-react";

import { getNetwork } from "../services/api";

function TransactionNetwork() {
    const [network, setNetwork] = useState({
        nodes: [],
        edges: []
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedNode, setSelectedNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState("");

    async function loadNetwork(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response = await getNetwork();

            setNetwork({
                nodes: response.nodes || [],
                edges: response.edges || []
            });
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Unable to load transaction network."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadNetwork();
    }, []);

    const normalizedNodes = useMemo(() => {
        return network.nodes.map((node, index) => ({
            ...node,
            id: String(
                node.id ??
                node.address ??
                node.wallet ??
                `NODE-${index + 1}`
            ),
            label:
                node.label ??
                node.address ??
                node.wallet ??
                `Node ${index + 1}`,
            type:
                node.type ??
                "wallet",
            risk:
                Number(
                    node.risk_score ??
                    node.risk ??
                    0
                )
        }));
    }, [network.nodes]);

    const filteredNodes = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return normalizedNodes;
        }

        return normalizedNodes.filter((node) =>
            [
                node.id,
                node.label,
                node.type,
                node.address,
                node.wallet
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [normalizedNodes, search]);

    const visibleNodeIds = new Set(
        filteredNodes.map((node) => node.id)
    );

    const filteredEdges = useMemo(() => {
        if (!search.trim()) {
            return network.edges;
        }

        return network.edges.filter((edge) => {
            const source = String(
                edge.source ??
                edge.from ??
                ""
            );

            const target = String(
                edge.target ??
                edge.to ??
                ""
            );

            return (
                visibleNodeIds.has(source) ||
                visibleNodeIds.has(target)
            );
        });
    }, [
        network.edges,
        search,
        visibleNodeIds
    ]);

    function getNodePosition(index, total) {
        const centerX = 430;
        const centerY = 255;

        if (total === 1) {
            return {
                x: centerX,
                y: centerY
            };
        }

        const radius =
            Math.min(190, 80 + total * 14);

        const angle =
            (Math.PI * 2 * index) /
            total -
            Math.PI / 2;

        return {
            x:
                centerX +
                Math.cos(angle) * radius,

            y:
                centerY +
                Math.sin(angle) * radius
        };
    }

    const positions = useMemo(() => {
        const result = {};

        filteredNodes.forEach((node, index) => {
            result[node.id] =
                getNodePosition(
                    index,
                    filteredNodes.length
                );
        });

        return result;
    }, [filteredNodes]);

    function nodeRiskClass(node) {
        if (node.risk >= 70) {
            return "network-risk-high";
        }

        if (node.risk >= 40) {
            return "network-risk-medium";
        }

        return "network-risk-low";
    }

    function edgeValue(edge) {
        return Number(
            edge.amount ??
            edge.value ??
            edge.weight ??
            0
        );
    }

    function edgeSource(edge) {
        return String(
            edge.source ??
            edge.from ??
            ""
        );
    }

    function edgeTarget(edge) {
        return String(
            edge.target ??
            edge.to ??
            ""
        );
    }

    function getConnectedEdges(nodeId) {
        return network.edges.filter(
            (edge) =>
                edgeSource(edge) === nodeId ||
                edgeTarget(edge) === nodeId
        );
    }

    const totalVolume = network.edges.reduce(
        (sum, edge) =>
            sum + edgeValue(edge),
        0
    );

    const highRiskNodes =
        normalizedNodes.filter(
            (node) => node.risk >= 70
        ).length;

    return (
        <div className="network-page">

            <div className="module-header">

                <div>
                    <div className="eyebrow">
                        <span></span>
                        BLOCKCHAIN RELATIONSHIP INTELLIGENCE
                    </div>

                    <h1>
                        Transaction Network
                    </h1>

                    <p>
                        Trace wallet relationships,
                        transaction flows and suspicious
                        connections across the blockchain.
                    </p>
                </div>

                <button
                    className="secondary-action"
                    onClick={() =>
                        loadNetwork(false)
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
                <div className="network-error">
                    <ShieldAlert size={14} />
                    {error}
                </div>
            )}


            <div className="network-stats">

                <div className="network-stat">
                    <Wallet size={17} />

                    <div>
                        <span>
                            NETWORK NODES
                        </span>

                        <strong>
                            {normalizedNodes.length}
                        </strong>
                    </div>
                </div>

                <div className="network-stat">
                    <ArrowRight size={17} />

                    <div>
                        <span>
                            CONNECTIONS
                        </span>

                        <strong>
                            {network.edges.length}
                        </strong>
                    </div>
                </div>

                <div className="network-stat">
                    <ShieldAlert size={17} />

                    <div>
                        <span>
                            HIGH RISK NODES
                        </span>

                        <strong>
                            {highRiskNodes}
                        </strong>
                    </div>
                </div>

                <div className="network-stat">
                    <Database size={17} />

                    <div>
                        <span>
                            TRANSACTION VOLUME
                        </span>

                        <strong>
                            {totalVolume.toLocaleString()}
                        </strong>
                    </div>
                </div>
            </div>


            <div className="network-toolbar">

                <div className="network-search">
                    <Search size={14} />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search wallet, address or node..."
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

                <div className="network-live">
                    <span></span>
                    LIVE NETWORK
                </div>
            </div>


            <div className="network-workspace">

                <div className="network-canvas">

                    <div className="canvas-header">

                        <div>
                            <span>
                                TRANSACTION GRAPH
                            </span>

                            <strong>
                                {filteredNodes.length}
                                {" "}
                                NODES /{" "}
                                {filteredEdges.length}
                                {" "}
                                EDGES
                            </strong>
                        </div>

                        <div className="zoom-controls">

                            <button
                                onClick={() =>
                                    setZoom(
                                        Math.min(
                                            1.5,
                                            zoom + 0.1
                                        )
                                    )
                                }
                            >
                                <ZoomIn size={13} />
                            </button>

                            <span>
                                {Math.round(
                                    zoom * 100
                                )}%
                            </span>

                            <button
                                onClick={() =>
                                    setZoom(
                                        Math.max(
                                            0.6,
                                            zoom - 0.1
                                        )
                                    )
                                }
                            >
                                <ZoomOut size={13} />
                            </button>

                        </div>
                    </div>


                    {loading ? (

                        <div className="network-loading">

                            <RefreshCw
                                size={24}
                                className="spin"
                            />

                            <span>
                                Building transaction network...
                            </span>

                        </div>

                    ) : filteredNodes.length === 0 ? (

                        <div className="network-empty">

                            <CircleDot size={30} />

                            <h3>
                                No network data
                            </h3>

                            <p>
                                No wallet nodes match
                                the current search.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="network-graph"
                            style={{
                                transform:
                                    `scale(${zoom})`
                            }}
                        >

                            <svg
                                className="network-lines"
                                viewBox="0 0 860 510"
                            >

                                <defs>

                                    <marker
                                        id="networkArrow"
                                        markerWidth="7"
                                        markerHeight="7"
                                        refX="6"
                                        refY="3.5"
                                        orient="auto"
                                    >
                                        <path
                                            d="M0,0 L7,3.5 L0,7"
                                            fill="none"
                                            stroke="currentColor"
                                        />
                                    </marker>

                                </defs>


                                {filteredEdges.map(
                                    (edge, index) => {

                                        const source =
                                            positions[
                                                edgeSource(
                                                    edge
                                                )
                                            ];

                                        const target =
                                            positions[
                                                edgeTarget(
                                                    edge
                                                )
                                            ];

                                        if (
                                            !source ||
                                            !target
                                        ) {
                                            return null;
                                        }

                                        const risk =
                                            Number(
                                                edge.risk_score ??
                                                edge.risk ??
                                                0
                                            );

                                        return (
                                            <g
                                                key={
                                                    edge.id ??
                                                    `edge-${index}`
                                                }
                                            >

                                                <line
                                                    x1={
                                                        source.x
                                                    }
                                                    y1={
                                                        source.y
                                                    }
                                                    x2={
                                                        target.x
                                                    }
                                                    y2={
                                                        target.y
                                                    }
                                                    className={
                                                        risk >=
                                                        70
                                                            ? "network-edge-risk"
                                                            : "network-edge"
                                                    }
                                                    markerEnd="url(#networkArrow)"
                                                />

                                            </g>
                                        );
                                    }
                                )}

                            </svg>


                            {filteredNodes.map(
                                (node) => {

                                    const position =
                                        positions[
                                            node.id
                                        ];

                                    return (
                                        <button
                                            key={
                                                node.id
                                            }
                                            className={
                                                `network-node ${nodeRiskClass(
                                                    node
                                                )}`
                                            }
                                            style={{
                                                left:
                                                    `${position.x}px`,
                                                top:
                                                    `${position.y}px`
                                            }}
                                            onClick={() =>
                                                setSelectedNode(
                                                    node
                                                )
                                            }
                                        >

                                            <div className="node-pulse">
                                                <Wallet
                                                    size={16}
                                                />
                                            </div>

                                            <strong>
                                                {
                                                    node.label
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    node.type
                                                }
                                            </span>

                                            {node.risk >
                                                0 && (
                                                <small>
                                                    RISK{" "}
                                                    {
                                                        node.risk
                                                    }
                                                </small>
                                            )}

                                        </button>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>


                <div className="network-side-panel">

                    <div className="panel-label">
                        NETWORK INTELLIGENCE
                    </div>

                    <h3>
                        Investigation Feed
                    </h3>

                    <div className="network-feed">

                        {filteredEdges
                            .slice(0, 8)
                            .map(
                                (edge, index) => (
                                    <div
                                        className="network-feed-item"
                                        key={
                                            edge.id ??
                                            index
                                        }
                                    >

                                        <div className="feed-icon">
                                            <ArrowRight
                                                size={12}
                                            />
                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    edgeSource(
                                                        edge
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                →
                                            </span>

                                            <strong>
                                                {
                                                    edgeTarget(
                                                        edge
                                                    )
                                                }
                                            </strong>

                                            <small>
                                                {edgeValue(
                                                    edge
                                                ).toLocaleString()}
                                            </small>

                                        </div>
                                    </div>
                                )
                            )}

                        {filteredEdges.length === 0 && (
                            <div className="feed-empty">
                                No transaction flows
                                available.
                            </div>
                        )}

                    </div>

                </div>

            </div>


            <div className="network-footer">

                <div>
                    <Activity size={13} />
                    GRAPH ENGINE
                    <strong>ONLINE</strong>
                </div>

                <div>
                    <Database size={13} />
                    BLOCKCHAIN DATA
                    <strong>SYNCED</strong>
                </div>

                <div>
                    <ShieldAlert size={13} />
                    THREAT CORRELATION
                    <strong>ACTIVE</strong>
                </div>

            </div>


            {selectedNode && (

                <div
                    className="network-modal-overlay"
                    onClick={() =>
                        setSelectedNode(null)
                    }
                >

                    <div
                        className="network-node-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="node-modal-header">

                            <div>
                                <div className="panel-label">
                                    NODE INVESTIGATION
                                </div>

                                <h2>
                                    {selectedNode.label}
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedNode(null)
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>


                        <div className="node-details">

                            <div>
                                <label>
                                    NODE ID
                                </label>

                                <strong>
                                    {selectedNode.id}
                                </strong>
                            </div>

                            <div>
                                <label>
                                    NODE TYPE
                                </label>

                                <strong>
                                    {selectedNode.type}
                                </strong>
                            </div>

                            <div>
                                <label>
                                    RISK SCORE
                                </label>

                                <strong>
                                    {selectedNode.risk}
                                    /100
                                </strong>
                            </div>

                            <div>
                                <label>
                                    CONNECTIONS
                                </label>

                                <strong>
                                    {
                                        getConnectedEdges(
                                            selectedNode.id
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>


                        <div className="node-address">

                            <label>
                                ADDRESS / WALLET
                            </label>

                            <p>
                                {
                                    selectedNode.address ||
                                    selectedNode.wallet ||
                                    selectedNode.id
                                }
                            </p>

                        </div>


                        <button
                            className="secondary-action"
                            onClick={() =>
                                setSelectedNode(null)
                            }
                        >
                            Close
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default TransactionNetwork;