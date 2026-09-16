from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
import tempfile
import hashlib
import asyncio
import sqlite3
from datetime import datetime, timezone

from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko_certvalidator import ValidationContext


# ============================================================
# CERT X - DIGITAL SIGNATURE SECURITY PLATFORM
# ============================================================

app = FastAPI(
    title="Cert X Security API",
    description="Digital Signature, Threat and Behaviour Analysis",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

DB_FILE = "certx_security.db"


def get_db():

    conn = sqlite3.connect(DB_FILE)

    conn.row_factory = sqlite3.Row

    return conn


def init_database():

    conn = get_db()

    cursor = conn.cursor()

    # --------------------------------------------------------
    # Employee activity
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employee_activity (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            employee_id TEXT NOT NULL,

            filename TEXT NOT NULL,

            risk_score INTEGER NOT NULL,

            risk_level TEXT NOT NULL,

            signature_valid INTEGER NOT NULL,

            document_integrity INTEGER NOT NULL,

            timestamp TEXT NOT NULL

        )
    """)

    # --------------------------------------------------------
    # Security alerts
    # --------------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS security_alerts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            employee_id TEXT NOT NULL,

            filename TEXT NOT NULL,

            risk_score INTEGER NOT NULL,

            risk_level TEXT NOT NULL,

            reason TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'NEW',

            created_at TEXT NOT NULL

        )
    """)

    conn.commit()

    conn.close()


init_database()


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "application": "Cert X",
        "status": "ONLINE",
        "database": "CONNECTED"
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "service": "Cert X",
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat()
    }


# ============================================================
# THREAT LEVEL
# ============================================================

def threat_level(score):

    if score > 80:
        return "HIGH"

    if score > 50:
        return "MEDIUM"

    return "LOW"


# ============================================================
# PDF STRUCTURE ANALYSIS
# ============================================================

def analyze_pdf_structure(pdf_data):

    suspicious = 0
    findings = []

    if b"/JavaScript" in pdf_data or b"/JS" in pdf_data:

        suspicious += 1

        findings.append(
            "JavaScript-related PDF object detected"
        )

    if b"/EmbeddedFile" in pdf_data:

        suspicious += 1

        findings.append(
            "Embedded file detected"
        )

    if b"/OpenAction" in pdf_data:

        suspicious += 1

        findings.append(
            "Automatic document action detected"
        )

    if b"/Launch" in pdf_data:

        suspicious += 1

        findings.append(
            "Launch action detected"
        )

    if not findings:

        findings.append(
            "No basic suspicious PDF objects detected"
        )

    return {
        "suspicious_features": suspicious,
        "findings": findings
    }


# ============================================================
# QUANTUM-INSPIRED ANALYSIS
# ============================================================

def quantum_analysis(
    signature_valid,
    integrity_valid,
    suspicious_features
):

    risk = 0

    if not signature_valid:
        risk += 40

    if not integrity_valid:
        risk += 40

    risk += min(
        suspicious_features * 5,
        20
    )

    risk = min(risk, 100)

    if risk > 80:

        priority = "CRITICAL"

    elif risk > 50:

        priority = "ELEVATED"

    else:

        priority = "NORMAL"

    return {

        "method":
            "Quantum-Inspired Risk Optimization",

        "status":
            "SIMULATION",

        "optimized_risk_score":
            risk,

        "risk_priority":
            priority,

        "explanation":
            "Quantum-inspired optimization is used "
            "to prioritize cyber risk factors."

    }


# ============================================================
# BEHAVIOUR ANALYSIS
# ============================================================

def behaviour_analysis(employee_id):

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) AS total_checks,
            SUM(
                CASE
                    WHEN risk_score > 50
                    THEN 1
                    ELSE 0
                END
            ) AS high_risk_checks
        FROM employee_activity
        WHERE employee_id = ?
    """, (employee_id,))

    row = cursor.fetchone()

    conn.close()

    total = row["total_checks"] or 0

    high_risk = row["high_risk_checks"] or 0

    # --------------------------------------------------------
    # First-time employee
    # --------------------------------------------------------

    if total == 0:

        return {

            "status": "BASELINE_CREATED",

            "total_previous_checks": 0,

            "high_risk_previous_checks": 0,

            "behaviour_status": "NORMAL",

            "message":
                "Initial employee activity recorded."

        }

    # --------------------------------------------------------
    # Behaviour classification
    # --------------------------------------------------------

    high_risk_ratio = (
        high_risk / total
    ) * 100

    if high_risk >= 5 or high_risk_ratio >= 30:

        behaviour_status = "SUSPICIOUS"

    elif high_risk >= 2:

        behaviour_status = "WATCH"

    else:

        behaviour_status = "NORMAL"

    return {

        "status": "ANALYZED",

        "total_previous_checks": total,

        "high_risk_previous_checks": high_risk,

        "high_risk_ratio":
            round(high_risk_ratio, 2),

        "behaviour_status":
            behaviour_status,

        "message":
            "Employee activity compared with "
            "previous recorded behaviour."

    }


# ============================================================
# SAVE EMPLOYEE ACTIVITY
# ============================================================

def save_activity(
    employee_id,
    filename,
    risk_score,
    risk_level,
    signature_valid,
    integrity_valid
):

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO employee_activity
        (
            employee_id,
            filename,
            risk_score,
            risk_level,
            signature_valid,
            document_integrity,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (

        employee_id,

        filename,

        risk_score,

        risk_level,

        int(signature_valid),

        int(integrity_valid),

        datetime.now(
            timezone.utc
        ).isoformat()

    ))

    conn.commit()

    conn.close()


# ============================================================
# CREATE SECURITY OFFICER ALERT
# ============================================================

def create_alert(
    employee_id,
    filename,
    risk_score,
    risk_level,
    reason
):

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO security_alerts
        (
            employee_id,
            filename,
            risk_score,
            risk_level,
            reason,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, 'NEW', ?)
    """, (

        employee_id,

        filename,

        risk_score,

        risk_level,

        reason,

        datetime.now(
            timezone.utc
        ).isoformat()

    ))

    alert_id = cursor.lastrowid

    conn.commit()

    conn.close()

    return alert_id


# ============================================================
# VERIFY PDF
# ============================================================

@app.post("/api/verify")
async def verify_pdf(

    employee_id: str = Form(...),

    file: UploadFile = File(...)

):

    # --------------------------------------------------------
    # File validation
    # --------------------------------------------------------

    if not file.filename.lower().endswith(".pdf"):

        return {

            "success": False,

            "error":
                "Only PDF files are supported."

        }

    pdf_data = await file.read()

    if not pdf_data:

        return {

            "success": False,

            "error":
                "Uploaded PDF is empty."

        }

    # --------------------------------------------------------
    # SHA-256
    # --------------------------------------------------------

    sha256_hash = hashlib.sha256(
        pdf_data
    ).hexdigest()

    # --------------------------------------------------------
    # Structure analysis
    # --------------------------------------------------------

    structure = analyze_pdf_structure(
        pdf_data
    )

    # --------------------------------------------------------
    # Temporary PDF
    # --------------------------------------------------------

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )

    temp_file.write(pdf_data)

    temp_file.close()

    # --------------------------------------------------------
    # Default values
    # --------------------------------------------------------

    signature_found = False

    signature_valid = False

    document_integrity = False

    certificate_trusted = False

    signer_name = None

    organization = None

    reasons = []

    try:

        # ====================================================
        # READ PDF
        # ====================================================

        with open(
            temp_file.name,
            "rb"
        ) as f:

            reader = PdfFileReader(f)

            signatures = reader.embedded_signatures

            # =================================================
            # NO SIGNATURE
            # =================================================

            if not signatures:

                reasons.append(
                    "No digital signature found"
                )

                risk_score = 40

                risk_level = threat_level(
                    risk_score
                )

                quantum = quantum_analysis(
                    False,
                    False,
                    structure[
                        "suspicious_features"
                    ]
                )

            else:

                # =============================================
                # SIGNATURE FOUND
                # =============================================

                signature_found = True

                sig = signatures[0]

                validation_context = (
                    ValidationContext(
                        trust_roots=[],
                        allow_fetching=False
                    )
                )

                def validate():

                    return validate_pdf_signature(
                        sig,
                        signer_validation_context=
                            validation_context
                    )

                status = await asyncio.to_thread(
                    validate
                )

                signature_valid = bool(
                    status.intact
                )

                document_integrity = bool(
                    status.docmdp_ok
                )

                try:

                    certificate_trusted = bool(
                        status.valid_cert
                    )

                except Exception:

                    certificate_trusted = False

                # =============================================
                # SIGNER
                # =============================================

                try:

                    signer_cert = (
                        sig.signer_cert
                    )

                    if signer_cert:

                        subject = (
                            signer_cert.subject
                        )

                        signer_name = (
                            subject.native.get(
                                "common_name"
                            )
                        )

                        organization = (
                            subject.native.get(
                                "organization_name"
                            )
                        )

                except Exception:

                    pass

                # =============================================
                # REASONS
                # =============================================

                if signature_valid:

                    reasons.append(
                        "Digital signature integrity verified"
                    )

                else:

                    reasons.append(
                        "Digital signature verification failed"
                    )

                if document_integrity:

                    reasons.append(
                        "Document integrity check passed"
                    )

                else:

                    reasons.append(
                        "Possible document tampering detected"
                    )

                if (
                    structure[
                        "suspicious_features"
                    ] > 0
                ):

                    reasons.extend(
                        structure[
                            "findings"
                        ]
                    )

                # =============================================
                # RISK SCORE
                # =============================================

                risk_score = 0

                if not signature_valid:

                    risk_score += 45

                if not document_integrity:

                    risk_score += 45

                risk_score += min(
                    structure[
                        "suspicious_features"
                    ] * 5,
                    20
                )

                risk_score = min(
                    risk_score,
                    100
                )

                risk_level = threat_level(
                    risk_score
                )

                quantum = quantum_analysis(
                    signature_valid,
                    document_integrity,
                    structure[
                        "suspicious_features"
                    ]
                )

        # ====================================================
        # BEHAVIOUR
        # ====================================================

        behaviour = behaviour_analysis(
            employee_id
        )

        # ====================================================
        # SAVE ACTIVITY
        # ====================================================

        save_activity(

            employee_id,

            file.filename,

            risk_score,

            risk_level,

            signature_valid,

            document_integrity

        )

        # ====================================================
        # SECURITY OFFICER ALERT
        # IMPORTANT: > 50
        # ====================================================

        alert_triggered = False

        alert_id = None

        if risk_score > 50:

            alert_triggered = True

            alert_id = create_alert(

                employee_id,

                file.filename,

                risk_score,

                risk_level,

                "; ".join(reasons)

            )

        # ====================================================
        # FINAL RESPONSE
        # ====================================================

        return {

            "success": True,

            "system": "Cert X",

            "document": {

                "filename":
                    file.filename,

                "file_type":
                    "PDF",

                "size_bytes":
                    len(pdf_data),

                "sha256":
                    sha256_hash

            },

            "signature": {

                "found":
                    signature_found,

                "valid":
                    signature_valid,

                "integrity":
                    document_integrity,

                "certificate_trusted":
                    certificate_trusted

            },

            "signer": {

                "identity_status":
                    "CERTIFICATE_IDENTITY_AVAILABLE"
                    if signer_name
                    else "NOT_AVAILABLE",

                "signer_name":
                    signer_name,

                "organization":
                    organization

            },

            "authorization": {

                "identity_match":
                    "PENDING",

                "organization_match":
                    "PENDING",

                "role_permission":
                    "PENDING",

                "overall_status":
                    "REQUIRES_ORGANIZATION_DATABASE"

            },

            "document_security": {

                "tampering_detected":
                    not document_integrity,

                "structure_analysis":
                    structure

            },

            "hash_analysis": {

                "algorithm":
                    "SHA-256",

                "hash":
                    sha256_hash,

                "status":
                    "CALCULATED"

            },

            "quantum_analysis":
                quantum,

            "behaviour_analysis":
                behaviour,

            "threat": {

                "score":
                    risk_score,

                "level":
                    risk_level,

                "alert_required":
                    alert_triggered,

                "reasons":
                    reasons

            },

            "security_officer_alert": {

                "triggered":
                    alert_triggered,

                "alert_id":
                    alert_id,

                "severity":
                    risk_level
                    if alert_triggered
                    else "NONE",

                "message":
                    (
                        "High-risk activity detected. "
                        "Security Officer review required."
                    )
                    if alert_triggered
                    else None

            }

        }

    except Exception as e:

        return {

            "success": False,

            "system": "Cert X",

            "error":
                str(e)

        }

    finally:

        Path(
            temp_file.name
        ).unlink(
            missing_ok=True
        )


# ============================================================
# SECURITY OFFICER - GET ALERTS
# ============================================================

@app.get("/api/security-officer/alerts")
def get_alerts():

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM security_alerts
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    alerts = []

    for row in rows:

        alerts.append(
            dict(row)
        )

    return {

        "success": True,

        "total_alerts":
            len(alerts),

        "alerts":
            alerts

    }


# ============================================================
# SECURITY OFFICER - NEW ALERTS
# ============================================================

@app.get("/api/security-officer/alerts/new")
def get_new_alerts():

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM security_alerts
        WHERE status = 'NEW'
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return {

        "success": True,

        "count":
            len(rows),

        "alerts":
            [dict(row) for row in rows]

    }


# ============================================================
# SECURITY OFFICER - ACTIVITY
# ============================================================

@app.get("/api/security-officer/activity")
def get_activity():

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM employee_activity
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return {

        "success": True,

        "total":
            len(rows),

        "activity":
            [dict(row) for row in rows]

    }


# ============================================================
# SECURITY OFFICER - ALERT COUNT
# ============================================================

@app.get("/api/security-officer/alerts/count")
def alert_count():

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM security_alerts
        WHERE status = 'NEW'
    """)

    count = cursor.fetchone()[0]

    conn.close()

    return {

        "success": True,

        "new_alerts":
            count

    }


# ============================================================
# SECURITY OFFICER - MARK ALERT RESOLVED
# ============================================================

@app.post("/api/security-officer/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int):

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        UPDATE security_alerts
        SET status = 'RESOLVED'
        WHERE id = ?
    """, (alert_id,))

    conn.commit()

    updated = cursor.rowcount

    conn.close()

    if updated == 0:

        return {

            "success": False,

            "message":
                "Alert not found."

        }

    return {

        "success": True,

        "message":
            "Security alert marked as resolved.",

        "alert_id":
            alert_id

    }