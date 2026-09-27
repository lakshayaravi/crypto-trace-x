import React, { useEffect, useMemo, useState } from "react";

import {
    ShieldCheck,
    FileSearch,
    Plus,
    RefreshCw,
    Search,
    Fingerprint,
    CheckCircle2,
    XCircle,
    Clock3,
    Hash,
    Link2,
    Database,
    X,
    Upload,
    Eye,
    Copy,
    AlertTriangle
} from "lucide-react";

import {
    getEvidence,
    addEvidence,
    verifyEvidence
} from "../services/api";

function EvidenceVault() {

    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [selectedEvidence, setSelectedEvidence] =
        useState(null);

    const [showModal, setShowModal] =
        useState(false);

    const [verifying, setVerifying] =
        useState(null);

    const [message, setMessage] =
        useState(null);

    const [form, setForm] = useState({
        title: "",
        evidence_type: "Transaction",
        transaction_id: "",
        source: "Crypto Trace X",
        description: "",
        content: ""
    });

    // =====================================================
    // LOAD EVIDENCE
    // =====================================================

    async function loadEvidence(showLoader = true) {

        try {

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const data = await getEvidence();

            const items =
                Array.isArray(data)
                    ? data
                    : data.evidence || data.items || [];

            setEvidence(items);

        } catch (error) {

            console.error(
                "Evidence loading failed:",
                error
            );

            setMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to load evidence."
            });

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadEvidence();
    }, []);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredEvidence = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return evidence;
        }

        return evidence.filter((item) => {

            const text = [
                item.evidence_id,
                item.id,
                item.title,
                item.evidence_type,
                item.transaction_id,
                item.source,
                item.description,
                item.hash,
                item.evidence_hash,
                item.created_at
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(keyword);
        });

    }, [evidence, search]);


    // =====================================================
    // STATS
    // =====================================================

    const totalEvidence =
        evidence.length;

    const verifiedEvidence =
        evidence.filter(
            (item) =>
                item.verified === true ||
                item.verification_status === "VERIFIED" ||
                item.status === "VERIFIED"
        ).length;

    const pendingEvidence =
        Math.max(
            totalEvidence - verifiedEvidence,
            0
        );

    const hashProtected =
        evidence.filter(
            (item) =>
                item.hash ||
                item.evidence_hash
        ).length;


    // =====================================================
    // FORM
    // =====================================================

    function updateForm(event) {

        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }


    function resetForm() {

        setForm({
            title: "",
            evidence_type: "Transaction",
            transaction_id: "",
            source: "Crypto Trace X",
            description: "",
            content: ""
        });
    }


    // =====================================================
    // ADD EVIDENCE
    // =====================================================

    async function handleAddEvidence(event) {

        event.preventDefault();

        if (!form.title.trim()) {

            setMessage({
                type: "error",
                text: "Evidence title is required."
            });

            return;
        }

        try {

            const result =
                await addEvidence({
                    title: form.title.trim(),

                    evidence_type:
                        form.evidence_type,

                    transaction_id:
                        form.transaction_id.trim(),

                    source:
                        form.source.trim(),

                    description:
                        form.description.trim(),

                    content:
                        form.content.trim()
                });

            setMessage({
                type: "success",
                text:
                    result.message ||
                    "Evidence secured successfully."
            });

            setShowModal(false);

            resetForm();

            await loadEvidence(false);

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.message ||
                    "Unable to store evidence."
            });
        }
    }


    // =====================================================
    // VERIFY EVIDENCE
    // =====================================================

    async function handleVerify(item) {

        const evidenceId =
            item.evidence_id || item.id;

        if (!evidenceId) {
            return;
        }

        try {

            setVerifying(evidenceId);

            const result =
                await verifyEvidence(
                    evidenceId
                );

            setMessage({
                type:
                    result.valid === false
                        ? "error"
                        : "success",

                text:
                    result.message ||
                    (
                        result.valid === false
                            ? "Evidence verification failed."
                            : "Evidence integrity verified."
                    )
            });

            await loadEvidence(false);

        } catch (error) {

            setMessage({
                type: "error",
                text:
                    error.message ||
                    "Evidence verification failed."
            });

        } finally {

            setVerifying(null);
        }
    }


    // =====================================================
    // COPY HASH
    // =====================================================

    async function copyHash(hash) {

        if (!hash) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                hash
            );

            setMessage({
                type: "success",
                text: "Evidence hash copied."
            });

        } catch {

            setMessage({
                type: "error",
                text: "Unable to copy hash."
            });
        }
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

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


    // =====================================================
    // SHORT HASH
    // =====================================================

    function shortHash(value) {

        if (!value) {
            return "NO HASH";
        }

        if (value.length <= 18) {
            return value;
        }

        return (
            value.slice(0, 9) +
            "..." +
            value.slice(-7)
        );
    }


    // =====================================================
    // VERIFY STATUS
    // =====================================================

    function isVerified(item) {

        return (
            item.verified === true ||
            item.verification_status === "VERIFIED" ||
            item.status === "VERIFIED"
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="evidence-page">

            {/* =========================================
                PAGE HEADER
            ========================================== */}

            <div className="module-header">

                <div>

                    <div className="eyebrow">
                        <span></span>
                        DIGITAL FORENSICS
                    </div>

                    <h1>
                        Evidence Vault
                    </h1>

                    <p>
                        Preserve, hash and verify
                        investigation evidence from
                        one controlled security vault.
                    </p>

                </div>


                <div className="module-header-actions">

                    <button
                        className="secondary-action"
                        onClick={() =>
                            loadEvidence(false)
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


                    <button
                        className="primary-action"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >

                        <Plus size={14} />

                        Add Evidence

                    </button>

                </div>

            </div>


            {/* =========================================
                MESSAGE
            ========================================== */}

            {message && (

                <div
                    className={
                        `vault-message ${message.type}`
                    }
                >

                    {message.type === "success" ? (
                        <CheckCircle2 size={15} />
                    ) : (
                        <AlertTriangle size={15} />
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


            {/* =========================================
                STAT CARDS
            ========================================== */}

            <div className="vault-stats">

                <div className="vault-stat">

                    <div className="vault-stat-icon cyan">
                        <Database size={17} />
                    </div>

                    <div>

                        <span>
                            TOTAL EVIDENCE
                        </span>

                        <strong>
                            {totalEvidence}
                        </strong>

                    </div>

                </div>


                <div className="vault-stat">

                    <div className="vault-stat-icon green">
                        <ShieldCheck size={17} />
                    </div>

                    <div>

                        <span>
                            VERIFIED
                        </span>

                        <strong>
                            {verifiedEvidence}
                        </strong>

                    </div>

                </div>


                <div className="vault-stat">

                    <div className="vault-stat-icon orange">
                        <Clock3 size={17} />
                    </div>

                    <div>

                        <span>
                            PENDING REVIEW
                        </span>

                        <strong>
                            {pendingEvidence}
                        </strong>

                    </div>

                </div>


                <div className="vault-stat">

                    <div className="vault-stat-icon purple">
                        <Fingerprint size={17} />
                    </div>

                    <div>

                        <span>
                            HASH PROTECTED
                        </span>

                        <strong>
                            {hashProtected}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================
                SEARCH / FILTER BAR
            ========================================== */}

            <div className="vault-toolbar">

                <div className="vault-search">

                    <Search size={14} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search evidence, transaction, hash..."
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


                <div className="vault-security-status">

                    <span className="security-dot"></span>

                    HASH INTEGRITY ACTIVE

                </div>

            </div>


            {/* =========================================
                EVIDENCE TABLE
            ========================================== */}

            <div className="evidence-panel">

                <div className="panel-header">

                    <div>

                        <div className="panel-label">
                            FORENSIC RECORDS
                        </div>

                        <h3>
                            Evidence Chain
                        </h3>

                    </div>

                    <div className="record-count">
                        {filteredEvidence.length}
                        {" "}
                        RECORDS
                    </div>

                </div>


                {loading ? (

                    <div className="vault-loading">

                        <RefreshCw
                            size={22}
                            className="spin"
                        />

                        <p>
                            Loading secure evidence...
                        </p>

                    </div>

                ) : filteredEvidence.length === 0 ? (

                    <div className="vault-empty">

                        <div className="vault-empty-icon">
                            <FileSearch size={25} />
                        </div>

                        <h3>
                            No evidence records found
                        </h3>

                        <p>
                            Add an evidence record or
                            change your search.
                        </p>

                        <button
                            className="primary-action"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >

                            <Plus size={13} />

                            Add Evidence

                        </button>

                    </div>

                ) : (

                    <div className="evidence-table-wrap">

                        <table className="evidence-table">

                            <thead>

                                <tr>

                                    <th>
                                        EVIDENCE
                                    </th>

                                    <th>
                                        TYPE
                                    </th>

                                    <th>
                                        TRANSACTION
                                    </th>

                                    <th>
                                        INTEGRITY
                                    </th>

                                    <th>
                                        CREATED
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredEvidence.map(
                                    (item, index) => {

                                        const id =
                                            item.evidence_id ||
                                            item.id ||
                                            `EV-${index + 1}`;

                                        const hash =
                                            item.evidence_hash ||
                                            item.hash;

                                        const verified =
                                            isVerified(item);

                                        return (

                                            <tr
                                                key={id}
                                                onClick={() =>
                                                    setSelectedEvidence(
                                                        item
                                                    )
                                                }
                                            >

                                                <td>

                                                    <div className="evidence-name">

                                                        <div className="evidence-file-icon">
                                                            <FileSearch
                                                                size={14}
                                                            />
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {item.title ||
                                                                    "Untitled Evidence"}
                                                            </strong>

                                                            <span>
                                                                {id}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="type-pill">
                                                        {item.evidence_type ||
                                                            "Evidence"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="transaction-ref">

                                                        <Link2
                                                            size={11}
                                                        />

                                                        {item.transaction_id ||
                                                            "Not linked"}

                                                    </span>

                                                </td>


                                                <td>

                                                    {verified ? (

                                                        <span className="integrity verified">

                                                            <CheckCircle2
                                                                size={12}
                                                            />

                                                            VERIFIED

                                                        </span>

                                                    ) : (

                                                        <span className="integrity pending">

                                                            <Clock3
                                                                size={12}
                                                            />

                                                            REVIEW

                                                        </span>

                                                    )}

                                                </td>


                                                <td>

                                                    <span className="date-text">
                                                        {formatDate(
                                                            item.created_at
                                                        )}
                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="table-action"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setSelectedEvidence(
                                                                item
                                                            );
                                                        }}
                                                    >

                                                        <Eye
                                                            size={13}
                                                        />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =========================================
                SECURITY FOOTER
            ========================================== */}

            <div className="vault-footer">

                <div>

                    <Fingerprint size={13} />

                    <span>
                        SHA-256 EVIDENCE FINGERPRINTING
                    </span>

                    <strong>
                        ACTIVE
                    </strong>

                </div>


                <div>

                    <ShieldCheck size={13} />

                    <span>
                        INTEGRITY VERIFICATION
                    </span>

                    <strong>
                        ENABLED
                    </strong>

                </div>


                <div>

                    <Database size={13} />

                    <span>
                        LOCAL FORENSIC STORAGE
                    </span>

                    <strong>
                        SQLITE
                    </strong>

                </div>

            </div>


            {/* =========================================
                ADD EVIDENCE MODAL
            ========================================== */}

            {showModal && (

                <div
                    className="vault-modal-overlay"
                    onClick={() =>
                        setShowModal(false)
                    }
                >

                    <div
                        className="vault-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="vault-modal-header">

                            <div>

                                <div className="panel-label">
                                    FORENSIC COLLECTION
                                </div>

                                <h2>
                                    Add Evidence
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleAddEvidence
                            }
                        >

                            <div className="form-grid">

                                <div className="form-field full">

                                    <label>
                                        EVIDENCE TITLE
                                    </label>

                                    <input
                                        name="title"
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            updateForm
                                        }
                                        placeholder="Example: Suspicious transaction screenshot"
                                    />

                                </div>


                                <div className="form-field">

                                    <label>
                                        EVIDENCE TYPE
                                    </label>

                                    <select
                                        name="evidence_type"
                                        value={
                                            form.evidence_type
                                        }
                                        onChange={
                                            updateForm
                                        }
                                    >

                                        <option>
                                            Transaction
                                        </option>

                                        <option>
                                            Wallet
                                        </option>

                                        <option>
                                            IP Address
                                        </option>

                                        <option>
                                            Device
                                        </option>

                                        <option>
                                            Screenshot
                                        </option>

                                        <option>
                                            Document
                                        </option>

                                        <option>
                                            Blockchain
                                        </option>

                                        <option>
                                            Other
                                        </option>

                                    </select>

                                </div>


                                <div className="form-field">

                                    <label>
                                        TRANSACTION ID
                                    </label>

                                    <input
                                        name="transaction_id"
                                        value={
                                            form.transaction_id
                                        }
                                        onChange={
                                            updateForm
                                        }
                                        placeholder="Optional transaction ID"
                                    />

                                </div>


                                <div className="form-field full">

                                    <label>
                                        SOURCE
                                    </label>

                                    <input
                                        name="source"
                                        value={
                                            form.source
                                        }
                                        onChange={
                                            updateForm
                                        }
                                        placeholder="Evidence source"
                                    />

                                </div>


                                <div className="form-field full">

                                    <label>
                                        DESCRIPTION
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            updateForm
                                        }
                                        rows="3"
                                        placeholder="Describe what this evidence proves or records..."
                                    />

                                </div>


                                <div className="form-field full">

                                    <label>
                                        EVIDENCE CONTENT
                                    </label>

                                    <textarea
                                        name="content"
                                        value={
                                            form.content
                                        }
                                        onChange={
                                            updateForm
                                        }
                                        rows="5"
                                        placeholder="Paste transaction hash, wallet address, IP information, forensic notes or other evidence content..."
                                    />

                                </div>

                            </div>


                            <div className="secure-notice">

                                <Fingerprint
                                    size={16}
                                />

                                <div>

                                    <strong>
                                        SHA-256 PROTECTION
                                    </strong>

                                    <span>
                                        The backend will generate
                                        an integrity hash for
                                        this evidence record.
                                    </span>

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-action"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-action"
                                >

                                    <Upload size={13} />

                                    Secure Evidence

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =========================================
                EVIDENCE DETAILS
            ========================================== */}

            {selectedEvidence && (

                <div
                    className="vault-modal-overlay"
                    onClick={() =>
                        setSelectedEvidence(null)
                    }
                >

                    <div
                        className="evidence-details-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="vault-modal-header">

                            <div>

                                <div className="panel-label">
                                    EVIDENCE RECORD
                                </div>

                                <h2>
                                    {selectedEvidence.title ||
                                        "Evidence Details"}
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedEvidence(
                                        null
                                    )
                                }
                            >

                                <X size={17} />

                            </button>

                        </div>


                        <div className="details-security">

                            <div className="details-security-icon">

                                {isVerified(
                                    selectedEvidence
                                ) ? (
                                    <ShieldCheck
                                        size={20}
                                    />
                                ) : (
                                    <AlertTriangle
                                        size={20}
                                    />
                                )}

                            </div>

                            <div>

                                <strong>
                                    {isVerified(
                                        selectedEvidence
                                    )
                                        ? "INTEGRITY VERIFIED"
                                        : "VERIFICATION REQUIRED"}
                                </strong>

                                <span>
                                    Evidence chain status
                                </span>

                            </div>

                        </div>


                        <div className="details-grid">

                            <div>
                                <label>
                                    EVIDENCE ID
                                </label>

                                <p>
                                    {selectedEvidence.evidence_id ||
                                        selectedEvidence.id ||
                                        "N/A"}
                                </p>
                            </div>


                            <div>
                                <label>
                                    TYPE
                                </label>

                                <p>
                                    {selectedEvidence.evidence_type ||
                                        "Evidence"}
                                </p>
                            </div>


                            <div>
                                <label>
                                    SOURCE
                                </label>

                                <p>
                                    {selectedEvidence.source ||
                                        "Unknown"}
                                </p>
                            </div>


                            <div>
                                <label>
                                    TRANSACTION
                                </label>

                                <p>
                                    {selectedEvidence.transaction_id ||
                                        "Not linked"}
                                </p>
                            </div>


                            <div className="full">

                                <label>
                                    DESCRIPTION
                                </label>

                                <p>
                                    {selectedEvidence.description ||
                                        "No description recorded."}
                                </p>

                            </div>


                            <div className="full">

                                <label>
                                    SHA-256 HASH
                                </label>

                                <div className="hash-box">

                                    <Hash size={13} />

                                    <code>
                                        {selectedEvidence.evidence_hash ||
                                            selectedEvidence.hash ||
                                            "Hash unavailable"}
                                    </code>

                                    {(selectedEvidence.evidence_hash ||
                                        selectedEvidence.hash) && (

                                        <button
                                            onClick={() =>
                                                copyHash(
                                                    selectedEvidence.evidence_hash ||
                                                    selectedEvidence.hash
                                                )
                                            }
                                        >

                                            <Copy size={12} />

                                        </button>

                                    )}

                                </div>

                            </div>


                            <div className="full">

                                <label>
                                    CONTENT
                                </label>

                                <div className="content-box">

                                    {selectedEvidence.content ||
                                        "No content recorded."}

                                </div>

                            </div>

                        </div>


                        <div className="details-actions">

                            <button
                                className="secondary-action"
                                onClick={() =>
                                    setSelectedEvidence(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>


                            <button
                                className="primary-action"
                                disabled={
                                    verifying ===
                                    (
                                        selectedEvidence.evidence_id ||
                                        selectedEvidence.id
                                    )
                                }
                                onClick={() =>
                                    handleVerify(
                                        selectedEvidence
                                    )
                                }
                            >

                                {verifying ===
                                (
                                    selectedEvidence.evidence_id ||
                                    selectedEvidence.id
                                ) ? (

                                    <RefreshCw
                                        size={13}
                                        className="spin"
                                    />

                                ) : (

                                    <ShieldCheck
                                        size={13}
                                    />

                                )}

                                Verify Integrity

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default EvidenceVault;