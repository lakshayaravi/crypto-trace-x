from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import json
import os
from datetime import datetime, timedelta

# ============================================================
# CRYPTO TRACE X
# Cybersecurity + Blockchain Investigation Platform
# ============================================================

app = Flask(__name__)
CORS(app)

DATABASE = "crypto_trace.db"


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_database():
    connection = get_db()

    # --------------------------------------------------------
    # TRANSACTIONS
    # --------------------------------------------------------
    connection.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            amount REAL NOT NULL,
            ip_address TEXT,
            device TEXT,
            risk_score INTEGER DEFAULT 0,
            risk_level TEXT DEFAULT 'LOW',
            status TEXT DEFAULT 'VERIFIED',
            created_at TEXT NOT NULL,
            block_hash TEXT,
            previous_hash TEXT
        )
    """)

    # --------------------------------------------------------
    # EVIDENCE VAULT
    # --------------------------------------------------------
    connection.execute("""
        CREATE TABLE IF NOT EXISTS evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            transaction_id TEXT,
            evidence_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            source TEXT,
            file_name TEXT,
            evidence_hash TEXT,
            severity TEXT DEFAULT 'MEDIUM',
            status TEXT DEFAULT 'SECURED',
            created_at TEXT NOT NULL
        )
    """)

    # --------------------------------------------------------
    # THREAT EVENTS
    # --------------------------------------------------------
    connection.execute("""
        CREATE TABLE IF NOT EXISTS threat_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            threat_id TEXT UNIQUE NOT NULL,
            transaction_id TEXT,
            threat_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            description TEXT,
            source_ip TEXT,
            device TEXT,
            status TEXT DEFAULT 'OPEN',
            created_at TEXT NOT NULL
        )
    """)

    # --------------------------------------------------------
    # INVESTIGATION NOTES
    # --------------------------------------------------------
    connection.execute("""
        CREATE TABLE IF NOT EXISTS investigation_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT,
            investigator TEXT,
            note TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


# ============================================================
# HASH ENGINE
# ============================================================

def calculate_hash(data):
    encoded_data = json.dumps(
        data,
        sort_keys=True,
        default=str
    ).encode("utf-8")

    return hashlib.sha256(encoded_data).hexdigest()


# ============================================================
# GENERATE SECURE IDS
# ============================================================

def generate_id(prefix):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    random_hash = hashlib.sha256(timestamp.encode()).hexdigest()[:8]

    return f"{prefix}-{timestamp[:14]}-{random_hash}"


# ============================================================
# BLOCKCHAIN
# ============================================================

def get_last_hash():
    connection = get_db()

    row = connection.execute("""
        SELECT block_hash
        FROM transactions
        ORDER BY id DESC
        LIMIT 1
    """).fetchone()

    connection.close()

    if row and row["block_hash"]:
        return row["block_hash"]

    return "GENESIS-BLOCK"


def build_block_data(row):
    return {
        "transaction_id": row["transaction_id"],
        "sender": row["sender"],
        "receiver": row["receiver"],
        "amount": row["amount"],
        "ip_address": row["ip_address"],
        "device": row["device"],
        "risk_score": row["risk_score"],
        "risk_level": row["risk_level"],
        "created_at": row["created_at"],
        "previous_hash": row["previous_hash"]
    }


# ============================================================
# THREAT DETECTION ENGINE
# ============================================================

def calculate_risk(amount, ip_address, device):
    score = 0
    reasons = []

    ip_address = ip_address or ""
    device = device or ""

    # --------------------------------------------------------
    # HIGH VALUE TRANSACTION
    # --------------------------------------------------------

    if amount >= 100000:
        score += 50
        reasons.append("Very high transaction amount")

    elif amount >= 50000:
        score += 30
        reasons.append("High transaction amount")

    elif amount >= 10000:
        score += 15
        reasons.append("Unusually large transaction")

    # --------------------------------------------------------
    # SUSPICIOUS IP
    # --------------------------------------------------------

    suspicious_ips = [
        "185.220.101.1",
        "45.95.147.2",
        "103.75.118.9",
        "192.168.100.100"
    ]

    if ip_address in suspicious_ips:
        score += 30
        reasons.append("Known suspicious IP address")

    # --------------------------------------------------------
    # SUSPICIOUS DEVICE
    # --------------------------------------------------------

    suspicious_devices = [
        "unknown",
        "rooted",
        "suspicious",
        "compromised",
        "emulator"
    ]

    if device.lower() in suspicious_devices:
        score += 20
        reasons.append("Suspicious or compromised device")

    # --------------------------------------------------------
    # LOCAL / PRIVATE NETWORK CHECK
    # --------------------------------------------------------

    if ip_address.startswith("10."):
        score += 5
        reasons.append("Private network source")

    # --------------------------------------------------------
    # RISK LEVEL
    # --------------------------------------------------------

    if score >= 70:
        level = "HIGH"

    elif score >= 40:
        level = "MEDIUM"

    else:
        level = "LOW"

    if not reasons:
        reasons.append("No significant threat indicators detected")

    return score, level, reasons


# ============================================================
# CREATE THREAT EVENT
# ============================================================

def create_threat_event(
    transaction_id,
    threat_type,
    severity,
    score,
    description,
    source_ip,
    device
):
    connection = get_db()

    threat_id = generate_id("THR")

    connection.execute("""
        INSERT INTO threat_events (
            threat_id,
            transaction_id,
            threat_type,
            severity,
            score,
            description,
            source_ip,
            device,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        threat_id,
        transaction_id,
        threat_type,
        severity,
        score,
        description,
        source_ip,
        device,
        "OPEN",
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()

    return threat_id


# ============================================================
# HEALTH
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "online",
        "system": "Crypto Trace X",
        "security": "SHA-256",
        "blockchain": "active",
        "threat_detection": "active",
        "evidence_vault": "active",
        "transaction_network": "active",
        "security_analytics": "active"
    })


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    connection = get_db()

    total = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
    """).fetchone()["count"]

    suspicious = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level IN ('HIGH', 'MEDIUM')
    """).fetchone()["count"]

    verified = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE status = 'VERIFIED'
    """).fetchone()["count"]

    high_risk = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level = 'HIGH'
    """).fetchone()["count"]

    total_volume = connection.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
    """).fetchone()["total"]

    evidence_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM evidence
    """).fetchone()["count"]

    threat_count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM threat_events
        WHERE status = 'OPEN'
    """).fetchone()["count"]

    connection.close()

    return jsonify({
        "total_transactions": total,
        "suspicious_transactions": suspicious,
        "verified_records": verified,
        "high_risk": high_risk,
        "total_volume": round(total_volume, 2),
        "evidence_records": evidence_count,
        "open_threats": threat_count
    })


# ============================================================
# GET ALL TRANSACTIONS
# ============================================================

@app.route("/api/transactions", methods=["GET"])
def get_transactions():

    connection = get_db()

    rows = connection.execute("""
        SELECT *
        FROM transactions
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


# ============================================================
# CREATE TRANSACTION
# ============================================================

@app.route("/api/transactions", methods=["POST"])
def create_transaction():

    try:

        data = request.get_json() or {}

        sender = data.get("sender", "Unknown").strip()
        receiver = data.get("receiver", "Unknown").strip()

        try:
            amount = float(data.get("amount", 0))
        except:
            amount = 0

        ip_address = data.get(
            "ip_address",
            "127.0.0.1"
        ).strip()

        device = data.get(
            "device",
            "Desktop"
        ).strip()

        if amount < 0:
            return jsonify({
                "error": "Amount cannot be negative"
            }), 400

        timestamp = datetime.now().isoformat()

        transaction_id = generate_id("CTX")

        risk_score, risk_level, reasons = calculate_risk(
            amount,
            ip_address,
            device
        )

        previous_hash = get_last_hash()

        block_data = {
            "transaction_id": transaction_id,
            "sender": sender,
            "receiver": receiver,
            "amount": amount,
            "ip_address": ip_address,
            "device": device,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "created_at": timestamp,
            "previous_hash": previous_hash
        }

        block_hash = calculate_hash(block_data)

        connection = get_db()

        connection.execute("""
            INSERT INTO transactions (
                transaction_id,
                sender,
                receiver,
                amount,
                ip_address,
                device,
                risk_score,
                risk_level,
                status,
                created_at,
                block_hash,
                previous_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            transaction_id,
            sender,
            receiver,
            amount,
            ip_address,
            device,
            risk_score,
            risk_level,
            "VERIFIED",
            timestamp,
            block_hash,
            previous_hash
        ))

        connection.commit()
        connection.close()

        # ----------------------------------------------------
        # AUTOMATIC THREAT CREATION
        # ----------------------------------------------------

        threat_id = None

        if risk_level in ["HIGH", "MEDIUM"]:

            threat_type = "Suspicious Transaction"

            threat_id = create_threat_event(
                transaction_id,
                threat_type,
                risk_level,
                risk_score,
                "; ".join(reasons),
                ip_address,
                device
            )

        return jsonify({
            "message": "Transaction secured",
            "transaction_id": transaction_id,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_reasons": reasons,
            "block_hash": block_hash,
            "previous_hash": previous_hash,
            "threat_id": threat_id
        }), 201

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# GET SINGLE BLOCK
# ============================================================

@app.route("/api/blocks/<int:block_id>", methods=["GET"])
def get_block(block_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM transactions
        WHERE id = ?
    """, (block_id,)).fetchone()

    connection.close()

    if not row:
        return jsonify({
            "error": "Block not found"
        }), 404

    return jsonify(dict(row))


# ============================================================
# SEARCH TRANSACTION
# ============================================================

@app.route("/api/transactions/<transaction_id>", methods=["GET"])
def get_transaction(transaction_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM transactions
        WHERE transaction_id = ?
    """, (transaction_id,)).fetchone()

    connection.close()

    if not row:
        return jsonify({
            "error": "Transaction not found"
        }), 404

    return jsonify(dict(row))


# ============================================================
# BLOCKCHAIN VERIFICATION
# ============================================================

@app.route("/api/blockchain/verify", methods=["GET"])
def verify_blockchain():

    connection = get_db()

    rows = connection.execute("""
        SELECT *
        FROM transactions
        ORDER BY id ASC
    """).fetchall()

    connection.close()

    previous_hash = "GENESIS-BLOCK"

    for row in rows:

        block_data = build_block_data(row)

        recalculated_hash = calculate_hash(
            block_data
        )

        if row["previous_hash"] != previous_hash:

            return jsonify({
                "valid": False,
                "message": "CHAIN BROKEN",
                "transaction_id": row["transaction_id"],
                "block_id": row["id"],
                "reason": (
                    "Previous hash does not match "
                    "the preceding block."
                )
            })

        if recalculated_hash != row["block_hash"]:

            return jsonify({
                "valid": False,
                "message": "TAMPERING DETECTED",
                "transaction_id": row["transaction_id"],
                "block_id": row["id"],
                "reason": (
                    "Stored block data does not match "
                    "its SHA-256 hash."
                )
            })

        previous_hash = row["block_hash"]

    return jsonify({
        "valid": True,
        "message": "BLOCKCHAIN VERIFIED",
        "blocks": len(rows)
    })


# ============================================================
# TAMPER SIMULATION
# ============================================================

@app.route(
    "/api/blockchain/tamper/<int:block_id>",
    methods=["POST"]
)
def tamper_block(block_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM transactions
        WHERE id = ?
    """, (block_id,)).fetchone()

    if not row:

        connection.close()

        return jsonify({
            "error": "Block not found"
        }), 404

    original_amount = row["amount"]

    tampered_amount = original_amount + 99999

    connection.execute("""
        UPDATE transactions
        SET amount = ?
        WHERE id = ?
    """, (
        tampered_amount,
        block_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Tamper simulation executed",
        "block_id": block_id,
        "original_amount": original_amount,
        "tampered_amount": tampered_amount,
        "warning": "Blockchain integrity should now fail."
    })


# ============================================================
# RESTORE BLOCKCHAIN
# ============================================================

@app.route(
    "/api/blockchain/restore/<int:block_id>",
    methods=["POST"]
)
def restore_block(block_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM transactions
        WHERE id = ?
    """, (block_id,)).fetchone()

    if not row:

        connection.close()

        return jsonify({
            "error": "Block not found"
        }), 404

    # Restore only the simulated tamper.
    amount = row["amount"] - 99999

    if amount < 0:
        amount = 0

    connection.execute("""
        UPDATE transactions
        SET amount = ?
        WHERE id = ?
    """, (
        amount,
        block_id
    ))

    connection.commit()

    # --------------------------------------------------------
    # REBUILD COMPLETE CHAIN
    # --------------------------------------------------------

    rows = connection.execute("""
        SELECT *
        FROM transactions
        ORDER BY id ASC
    """).fetchall()

    previous_hash = "GENESIS-BLOCK"

    for current in rows:

        block_data = {
            "transaction_id": current["transaction_id"],
            "sender": current["sender"],
            "receiver": current["receiver"],
            "amount": current["amount"],
            "ip_address": current["ip_address"],
            "device": current["device"],
            "risk_score": current["risk_score"],
            "risk_level": current["risk_level"],
            "created_at": current["created_at"],
            "previous_hash": previous_hash
        }

        new_hash = calculate_hash(block_data)

        connection.execute("""
            UPDATE transactions
            SET previous_hash = ?,
                block_hash = ?
            WHERE id = ?
        """, (
            previous_hash,
            new_hash,
            current["id"]
        ))

        previous_hash = new_hash

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Blockchain restored successfully",
        "block_id": block_id
    })


# ============================================================
# THREAT DETECTION
# ============================================================

@app.route("/api/threats", methods=["GET"])
def get_threats():

    connection = get_db()

    rows = connection.execute("""
        SELECT *
        FROM threat_events
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


# ============================================================
# THREAT SUMMARY
# ============================================================

@app.route("/api/threats/summary", methods=["GET"])
def threat_summary():

    connection = get_db()

    total = connection.execute("""
        SELECT COUNT(*) AS count
        FROM threat_events
    """).fetchone()["count"]

    high = connection.execute("""
        SELECT COUNT(*) AS count
        FROM threat_events
        WHERE severity = 'HIGH'
    """).fetchone()["count"]

    medium = connection.execute("""
        SELECT COUNT(*) AS count
        FROM threat_events
        WHERE severity = 'MEDIUM'
    """).fetchone()["count"]

    open_threats = connection.execute("""
        SELECT COUNT(*) AS count
        FROM threat_events
        WHERE status = 'OPEN'
    """).fetchone()["count"]

    connection.close()

    return jsonify({
        "total_threats": total,
        "high": high,
        "medium": medium,
        "open": open_threats
    })


# ============================================================
# UPDATE THREAT STATUS
# ============================================================

@app.route(
    "/api/threats/<threat_id>/status",
    methods=["PUT"]
)
def update_threat_status(threat_id):

    data = request.get_json() or {}

    status = data.get(
        "status",
        "INVESTIGATING"
    ).upper()

    allowed_status = [
        "OPEN",
        "INVESTIGATING",
        "RESOLVED",
        "DISMISSED"
    ]

    if status not in allowed_status:

        return jsonify({
            "error": "Invalid threat status"
        }), 400

    connection = get_db()

    cursor = connection.execute("""
        UPDATE threat_events
        SET status = ?
        WHERE threat_id = ?
    """, (
        status,
        threat_id
    ))

    connection.commit()

    changed = cursor.rowcount

    connection.close()

    if changed == 0:

        return jsonify({
            "error": "Threat not found"
        }), 404

    return jsonify({
        "message": "Threat status updated",
        "threat_id": threat_id,
        "status": status
    })


# ============================================================
# EVIDENCE VAULT
# ============================================================

@app.route("/api/evidence", methods=["GET"])
def get_evidence():

    connection = get_db()

    rows = connection.execute("""
        SELECT *
        FROM evidence
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


# ============================================================
# ADD EVIDENCE
# ============================================================

@app.route("/api/evidence", methods=["POST"])
def add_evidence():

    try:

        data = request.get_json() or {}

        evidence_id = generate_id("EVD")

        transaction_id = data.get(
            "transaction_id"
        )

        evidence_type = data.get(
            "evidence_type",
            "Transaction Record"
        )

        title = data.get(
            "title",
            "Untitled Evidence"
        )

        description = data.get(
            "description",
            ""
        )

        source = data.get(
            "source",
            "Crypto Trace X"
        )

        file_name = data.get(
            "file_name",
            ""
        )

        severity = data.get(
            "severity",
            "MEDIUM"
        ).upper()

        evidence_payload = {
            "transaction_id": transaction_id,
            "evidence_type": evidence_type,
            "title": title,
            "description": description,
            "source": source,
            "file_name": file_name,
            "created_at": datetime.now().isoformat()
        }

        evidence_hash = calculate_hash(
            evidence_payload
        )

        connection = get_db()

        connection.execute("""
            INSERT INTO evidence (
                evidence_id,
                transaction_id,
                evidence_type,
                title,
                description,
                source,
                file_name,
                evidence_hash,
                severity,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            evidence_id,
            transaction_id,
            evidence_type,
            title,
            description,
            source,
            file_name,
            evidence_hash,
            severity,
            "SECURED",
            datetime.now().isoformat()
        ))

        connection.commit()
        connection.close()

        return jsonify({
            "message": "Evidence secured successfully",
            "evidence_id": evidence_id,
            "evidence_hash": evidence_hash
        }), 201

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# ============================================================
# EVIDENCE DETAILS
# ============================================================

@app.route(
    "/api/evidence/<evidence_id>",
    methods=["GET"]
)
def get_evidence_details(evidence_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM evidence
        WHERE evidence_id = ?
    """, (evidence_id,)).fetchone()

    connection.close()

    if not row:

        return jsonify({
            "error": "Evidence not found"
        }), 404

    return jsonify(dict(row))


# ============================================================
# VERIFY EVIDENCE HASH
# ============================================================

@app.route(
    "/api/evidence/<evidence_id>/verify",
    methods=["GET"]
)
def verify_evidence(evidence_id):

    connection = get_db()

    row = connection.execute("""
        SELECT *
        FROM evidence
        WHERE evidence_id = ?
    """, (evidence_id,)).fetchone()

    connection.close()

    if not row:

        return jsonify({
            "error": "Evidence not found"
        }), 404

    payload = {
        "transaction_id": row["transaction_id"],
        "evidence_type": row["evidence_type"],
        "title": row["title"],
        "description": row["description"],
        "source": row["source"],
        "file_name": row["file_name"],
        "created_at": row["created_at"]
    }

    calculated_hash = calculate_hash(payload)

    valid = (
        calculated_hash ==
        row["evidence_hash"]
    )

    return jsonify({
        "evidence_id": evidence_id,
        "valid": valid,
        "message": (
            "EVIDENCE VERIFIED"
            if valid
            else "EVIDENCE INTEGRITY FAILURE"
        ),
        "stored_hash": row["evidence_hash"],
        "calculated_hash": calculated_hash
    })


# ============================================================
# TRANSACTION NETWORK
# ============================================================

@app.route("/api/network", methods=["GET"])
def transaction_network():

    connection = get_db()

    rows = connection.execute("""
        SELECT
            transaction_id,
            sender,
            receiver,
            amount,
            risk_score,
            risk_level,
            created_at
        FROM transactions
        ORDER BY id ASC
    """).fetchall()

    connection.close()

    nodes = {}
    edges = []

    for row in rows:

        sender = row["sender"]
        receiver = row["receiver"]

        if sender not in nodes:

            nodes[sender] = {
                "id": sender,
                "label": sender,
                "type": "wallet"
            }

        if receiver not in nodes:

            nodes[receiver] = {
                "id": receiver,
                "label": receiver,
                "type": "wallet"
            }

        edges.append({
            "id": row["transaction_id"],
            "source": sender,
            "target": receiver,
            "amount": row["amount"],
            "risk_score": row["risk_score"],
            "risk_level": row["risk_level"],
            "created_at": row["created_at"]
        })

    return jsonify({
        "nodes": list(nodes.values()),
        "edges": edges,
        "node_count": len(nodes),
        "edge_count": len(edges)
    })


# ============================================================
# SECURITY ANALYTICS
# ============================================================

@app.route("/api/analytics", methods=["GET"])
def security_analytics():

    connection = get_db()

    # --------------------------------------------------------
    # TOTALS
    # --------------------------------------------------------

    total_transactions = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
    """).fetchone()["count"]

    total_volume = connection.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
    """).fetchone()["total"]

    average_amount = connection.execute("""
        SELECT COALESCE(AVG(amount), 0) AS average
        FROM transactions
    """).fetchone()["average"]

    average_risk = connection.execute("""
        SELECT COALESCE(AVG(risk_score), 0) AS average
        FROM transactions
    """).fetchone()["average"]

    # --------------------------------------------------------
    # RISK DISTRIBUTION
    # --------------------------------------------------------

    risk_rows = connection.execute("""
        SELECT
            risk_level,
            COUNT(*) AS count
        FROM transactions
        GROUP BY risk_level
    """).fetchall()

    risk_distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0
    }

    for row in risk_rows:

        risk_distribution[
            row["risk_level"]
        ] = row["count"]

    # --------------------------------------------------------
    # THREAT DISTRIBUTION
    # --------------------------------------------------------

    threat_rows = connection.execute("""
        SELECT
            severity,
            COUNT(*) AS count
        FROM threat_events
        GROUP BY severity
    """).fetchall()

    threat_distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0
    }

    for row in threat_rows:

        threat_distribution[
            row["severity"]
        ] = row["count"]

    # --------------------------------------------------------
    # TOP SENDERS
    # --------------------------------------------------------

    sender_rows = connection.execute("""
        SELECT
            sender,
            COUNT(*) AS transaction_count,
            COALESCE(SUM(amount), 0) AS volume
        FROM transactions
        GROUP BY sender
        ORDER BY volume DESC
        LIMIT 10
    """).fetchall()

    top_senders = [
        {
            "sender": row["sender"],
            "transaction_count": row["transaction_count"],
            "volume": row["volume"]
        }
        for row in sender_rows
    ]

    # --------------------------------------------------------
    # TOP RECEIVERS
    # --------------------------------------------------------

    receiver_rows = connection.execute("""
        SELECT
            receiver,
            COUNT(*) AS transaction_count,
            COALESCE(SUM(amount), 0) AS volume
        FROM transactions
        GROUP BY receiver
        ORDER BY volume DESC
        LIMIT 10
    """).fetchall()

    top_receivers = [
        {
            "receiver": row["receiver"],
            "transaction_count": row["transaction_count"],
            "volume": row["volume"]
        }
        for row in receiver_rows
    ]

    # --------------------------------------------------------
    # DAILY TRANSACTION TREND
    # --------------------------------------------------------

    daily_rows = connection.execute("""
        SELECT
            substr(created_at, 1, 10) AS date,
            COUNT(*) AS transactions,
            COALESCE(SUM(amount), 0) AS volume,
            COALESCE(AVG(risk_score), 0) AS average_risk
        FROM transactions
        GROUP BY substr(created_at, 1, 10)
        ORDER BY date ASC
    """).fetchall()

    daily_trend = [
        {
            "date": row["date"],
            "transactions": row["transactions"],
            "volume": row["volume"],
            "average_risk": round(
                row["average_risk"],
                2
            )
        }
        for row in daily_rows
    ]

    connection.close()

    return jsonify({
        "total_transactions": total_transactions,
        "total_volume": round(
            total_volume,
            2
        ),
        "average_transaction": round(
            average_amount,
            2
        ),
        "average_risk": round(
            average_risk,
            2
        ),
        "risk_distribution": risk_distribution,
        "threat_distribution": threat_distribution,
        "top_senders": top_senders,
        "top_receivers": top_receivers,
        "daily_trend": daily_trend
    })


# ============================================================
# INVESTIGATION NOTES
# ============================================================

@app.route(
    "/api/investigations/notes",
    methods=["GET"]
)
def get_notes():

    transaction_id = request.args.get(
        "transaction_id"
    )

    connection = get_db()

    if transaction_id:

        rows = connection.execute("""
            SELECT *
            FROM investigation_notes
            WHERE transaction_id = ?
            ORDER BY id DESC
        """, (
            transaction_id,
        )).fetchall()

    else:

        rows = connection.execute("""
            SELECT *
            FROM investigation_notes
            ORDER BY id DESC
        """).fetchall()

    connection.close()

    return jsonify([
        dict(row)
        for row in rows
    ])


# ============================================================
# ADD INVESTIGATION NOTE
# ============================================================

@app.route(
    "/api/investigations/notes",
    methods=["POST"]
)
def add_note():

    data = request.get_json() or {}

    transaction_id = data.get(
        "transaction_id"
    )

    investigator = data.get(
        "investigator",
        "Security Analyst"
    )

    note = data.get(
        "note",
        ""
    ).strip()

    if not note:

        return jsonify({
            "error": "Note cannot be empty"
        }), 400

    connection = get_db()

    connection.execute("""
        INSERT INTO investigation_notes (
            transaction_id,
            investigator,
            note,
            created_at
        )
        VALUES (?, ?, ?, ?)
    """, (
        transaction_id,
        investigator,
        note,
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Investigation note saved"
    }), 201


# ============================================================
# RECENT ACTIVITY
# ============================================================

@app.route(
    "/api/activity",
    methods=["GET"]
)
def recent_activity():

    connection = get_db()

    transactions = connection.execute("""
        SELECT
            transaction_id AS id,
            'TRANSACTION' AS type,
            sender,
            receiver,
            amount,
            risk_level AS severity,
            created_at
        FROM transactions
        ORDER BY id DESC
        LIMIT 20
    """).fetchall()

    threats = connection.execute("""
        SELECT
            threat_id AS id,
            'THREAT' AS type,
            threat_type AS sender,
            transaction_id AS receiver,
            score AS amount,
            severity,
            created_at
        FROM threat_events
        ORDER BY id DESC
        LIMIT 20
    """).fetchall()

    connection.close()

    activity = [
        dict(row)
        for row in transactions
    ]

    activity.extend([
        dict(row)
        for row in threats
    ])

    activity.sort(
        key=lambda item: item["created_at"],
        reverse=True
    )

    return jsonify(activity[:30])


# ============================================================
# RESET DEMO DATA
# ============================================================

@app.route(
    "/api/demo/reset",
    methods=["POST"]
)
def reset_demo():

    connection = get_db()

    connection.execute(
        "DELETE FROM investigation_notes"
    )

    connection.execute(
        "DELETE FROM evidence"
    )

    connection.execute(
        "DELETE FROM threat_events"
    )

    connection.execute(
        "DELETE FROM transactions"
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Crypto Trace X demo data reset successfully"
    })


# ============================================================
# SEED DEMO DATA
# ============================================================

@app.route(
    "/api/demo/seed",
    methods=["POST"]
)
def seed_demo():

    connection = get_db()

    count = connection.execute("""
        SELECT COUNT(*) AS count
        FROM transactions
    """).fetchone()["count"]

    connection.close()

    if count > 0:

        return jsonify({
            "message": "Demo data already exists",
            "transactions": count
        })

    demo_transactions = [
        {
            "sender": "WALLET-A102",
            "receiver": "WALLET-B204",
            "amount": 2500,
            "ip": "127.0.0.1",
            "device": "Desktop"
        },
        {
            "sender": "WALLET-C301",
            "receiver": "WALLET-D405",
            "amount": 12000,
            "ip": "192.168.1.10",
            "device": "Mobile"
        },
        {
            "sender": "WALLET-X901",
            "receiver": "WALLET-Z777",
            "amount": 85000,
            "ip": "45.95.147.2",
            "device": "unknown"
        },
        {
            "sender": "WALLET-P555",
            "receiver": "WALLET-Q888",
            "amount": 150000,
            "ip": "103.75.118.9",
            "device": "rooted"
        },
        {
            "sender": "WALLET-A102",
            "receiver": "WALLET-X901",
            "amount": 7500,
            "ip": "127.0.0.1",
            "device": "Desktop"
        }
    ]

    created = []

    for item in demo_transactions:

        # Use the same internal transaction logic
        timestamp = datetime.now().isoformat()

        transaction_id = generate_id("CTX")

        risk_score, risk_level, reasons = calculate_risk(
            item["amount"],
            item["ip"],
            item["device"]
        )

        previous_hash = get_last_hash()

        block_data = {
            "transaction_id": transaction_id,
            "sender": item["sender"],
            "receiver": item["receiver"],
            "amount": item["amount"],
            "ip_address": item["ip"],
            "device": item["device"],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "created_at": timestamp,
            "previous_hash": previous_hash
        }

        block_hash = calculate_hash(block_data)

        connection = get_db()

        connection.execute("""
            INSERT INTO transactions (
                transaction_id,
                sender,
                receiver,
                amount,
                ip_address,
                device,
                risk_score,
                risk_level,
                status,
                created_at,
                block_hash,
                previous_hash
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            transaction_id,
            item["sender"],
            item["receiver"],
            item["amount"],
            item["ip"],
            item["device"],
            risk_score,
            risk_level,
            "VERIFIED",
            timestamp,
            block_hash,
            previous_hash
        ))

        connection.commit()
        connection.close()

        created.append(transaction_id)

        if risk_level in ["HIGH", "MEDIUM"]:

            create_threat_event(
                transaction_id,
                "Suspicious Transaction",
                risk_level,
                risk_score,
                "; ".join(reasons),
                item["ip"],
                item["device"]
            )

    return jsonify({
        "message": "Demo security dataset created",
        "transactions": created
    }), 201


# ============================================================
# ERROR HANDLER
# ============================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "API endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "error": "Internal server error"
    }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    init_database()

    print("=" * 70)
    print("CRYPTO TRACE X")
    print("Cybersecurity + Blockchain Investigation Platform")
    print("=" * 70)
    print("Database initialized")
    print("SHA-256 engine ready")
    print("Threat detection engine ready")
    print("Evidence vault ready")
    print("Transaction network ready")
    print("Security analytics ready")
    print("Blockchain verification ready")
    print("Tamper simulation ready")
    print("Investigation system ready")
    print("=" * 70)
    print("Server: http://127.0.0.1:5000")
    print("=" * 70)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )