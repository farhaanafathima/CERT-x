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
from pyhanko.sign.diff_analysis.policy_api import ModificationLevel
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

    if score > 50:
        return "HIGH"

    if score > 25:
        return "MEDIUM"

    return "LOW"


# ============================================================
# PDF SECURITY / ATTACK SURFACE ANALYSIS
# ============================================================

def _count_token(pdf_data, token):
    return pdf_data.count(token)


def analyze_pdf_structure(pdf_data):
    """Broad, evidence-based PDF attack-surface scan.

    Normal PDF structures such as AcroForms, annotations, xref sections,
    EOF markers and previous-revision references are informational only.
    They are not attacks by themselves.
    """
    findings = []
    categories = []

    def add(category, message, severity="INFO", suspicious=False):
        findings.append({
            "category": category,
            "severity": severity,
            "message": message,
            "suspicious": suspicious
        })
        if suspicious:
            categories.append(category)

    # Active content / automatic actions
    if b"/JavaScript" in pdf_data or b"/JS" in pdf_data:
        add("ACTIVE_CONTENT", "JavaScript-related PDF object detected", "HIGH", True)
    if b"/OpenAction" in pdf_data:
        add("AUTOMATIC_ACTION", "OpenAction detected; document may execute an action when opened", "HIGH", True)
    if b"/AA" in pdf_data:
        add("AUTOMATIC_ACTION", "Additional Actions (/AA) detected", "HIGH", True)
    if b"/Launch" in pdf_data:
        add("LAUNCH_ACTION", "Launch action detected", "HIGH", True)
    if b"/SubmitForm" in pdf_data or b"/GoToR" in pdf_data:
        add("EXTERNAL_ACTION", "External/form action detected", "HIGH", True)

    # Embedded / external content
    if b"/EmbeddedFile" in pdf_data or b"/Filespec" in pdf_data:
        add("EMBEDDED_CONTENT", "Embedded file/file specification detected", "HIGH", True)
    if b"/RichMedia" in pdf_data or b"/Flash" in pdf_data:
        add("RICH_MEDIA", "Rich-media/legacy active content detected", "HIGH", True)
    if b"/URI" in pdf_data:
        add("EXTERNAL_REFERENCE", "URI action/reference detected", "MEDIUM", True)

    # Forms / annotations: informational unless another analysis proves abuse.
    if b"/AcroForm" in pdf_data:
        add("FORM", "Interactive AcroForm structure detected", "INFO", False)
    if b"/XFA" in pdf_data:
        add("XFA", "XFA form structure detected", "MEDIUM", True)
    if b"/Annot" in pdf_data or b"/Annots" in pdf_data:
        add("ANNOTATION", "PDF annotation structure detected", "INFO", False)

    # Revision markers are informational. Post-signature changes are handled
    # separately by PyHanko diff analysis and signed-byte coverage checks.
    eof_count = _count_token(pdf_data, b"%%EOF")
    startxref_count = _count_token(pdf_data, b"startxref")
    prev_count = _count_token(pdf_data, b"/Prev")

    if eof_count > 1:
        add("INCREMENTAL_UPDATE", f"Multiple PDF revisions detected ({eof_count} EOF markers)", "INFO", False)
    if prev_count > 0:
        add("INCREMENTAL_UPDATE", f"Previous-revision references detected ({prev_count})", "INFO", False)
    if startxref_count > 1:
        add("XREF_REVISION", f"Multiple xref sections detected ({startxref_count})", "INFO", False)

    # Normal PDF structures
    if b"/ObjStm" in pdf_data:
        add("OBJECT_STREAM", "Compressed PDF object stream detected", "INFO", False)
    if b"/XRef" in pdf_data:
        add("XREF_STREAM", "Cross-reference stream detected", "INFO", False)
    if b"/Encrypt" in pdf_data:
        add("ENCRYPTION", "PDF encryption dictionary detected", "INFO", False)
    if b"/AcroForm" in pdf_data and b"/NeedAppearances" in pdf_data:
        add("FORM_APPEARANCE", "Form appearance regeneration setting detected", "INFO", False)

    suspicious_count = sum(
        1 for f in findings if f.get("suspicious") is True
    )

    if not findings:
        findings.append({
            "category": "BASELINE",
            "severity": "INFO",
            "message": "No basic suspicious PDF objects detected",
            "suspicious": False
        })

    return {
        "suspicious_features": suspicious_count,
        "findings": findings,
        "revision_count": eof_count,
        "xref_sections": startxref_count,
        "previous_revision_references": prev_count,
        "attack_surface_categories": sorted(set(categories))
    }

# ============================================================
# SIGNATURE / POST-SIGNATURE MODIFICATION ANALYSIS
# ============================================================

def analyze_signature_modifications(status, signature_count, pdf_data, signature=None):
    """Detect post-signature changes using PyHanko diff analysis.

    EOF/xref/Prev counts are informational only and never prove tampering.
    """
    modification_level = getattr(status, "modification_level", None)
    docmdp_ok = getattr(status, "docmdp_ok", None)
    coverage = getattr(status, "coverage", None)
    diff_result = getattr(status, "diff_result", None)

    level_name = getattr(modification_level, "name", None)
    level_value = getattr(modification_level, "value", None)

    modified_after_signing = False
    suspicious_post_signature_change = False
    findings = []

    if modification_level is not None:
        modified_after_signing = modification_level != ModificationLevel.NONE
        if level_name:
            findings.append(f"Post-signature modification level: {level_name}")
        if modified_after_signing:
            suspicious_post_signature_change = True
            findings.append("Post-signature document revision detected")

    if diff_result is not None:
        diff_name = type(diff_result).__name__
        if diff_name == "SuspiciousModification":
            suspicious_post_signature_change = True
            modified_after_signing = True
            findings.append("PyHanko difference analysis reported a suspicious modification")

    if docmdp_ok is False:
        suspicious_post_signature_change = True
        modified_after_signing = True
        findings.append("Document modification does not comply with the active signature policy")

    # Strong post-signature tamper check: a PDF signature normally covers the
    # complete PDF revision except the signature container itself. If the
    # signed ByteRange ends before the actual end of the uploaded file, there
    # are unsigned bytes after the signed revision. In Cert X, an unsigned
    # incremental update after a signature is treated as an unauthorized
    # post-signature modification.
    try:
        sig_obj = getattr(signature, "sig_object", None)
        byte_range = sig_obj.get("/ByteRange") if sig_obj is not None else None
        if byte_range and len(byte_range) == 4:
            br = [int(x) for x in byte_range]
            signed_end = br[2] + br[3]
            if signed_end < len(pdf_data):
                trailing = pdf_data[signed_end:]
                if trailing.strip():
                    modified_after_signing = True
                    suspicious_post_signature_change = True
                    findings.append(
                        "Unsigned PDF data detected after the signed ByteRange; "
                        "possible post-signature modification"
                    )
    except Exception:
        # Keep validation available even if a malformed ByteRange cannot be
        # parsed; PyHanko's normal validation remains authoritative.
        pass

    if signature_count > 1:
        findings.append(f"Multiple embedded signatures detected ({signature_count})")

    eof_count = pdf_data.count(b"%%EOF")
    startxref_count = pdf_data.count(b"startxref")
    prev_count = pdf_data.count(b"/Prev")

    if eof_count > 1:
        findings.append(f"PDF contains {eof_count} EOF markers (informational)")
    if prev_count > 0:
        findings.append(f"PDF contains {prev_count} previous-revision references (informational)")
    if startxref_count > 1:
        findings.append(f"PDF contains {startxref_count} xref sections (informational)")

    if not findings:
        findings.append("No post-signature modification evidence detected")

    return {
        "modified_after_signing": modified_after_signing,
        "suspicious": suspicious_post_signature_change,
        "modification_level": level_name,
        "modification_level_value": level_value,
        "docmdp_compliant": docmdp_ok,
        "coverage": getattr(coverage, "name", str(coverage) if coverage else None),
        "findings": findings,
        "strict_mode": "PYHANKO_DIFF_ANALYSIS"
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

    if not file.filename.lower().endswith(".pdf"):
        return {"success": False, "error": "Only PDF files are supported."}

    pdf_data = await file.read()

    if not pdf_data:
        return {"success": False, "error": "Uploaded PDF is empty."}

    sha256_hash = hashlib.sha256(pdf_data).hexdigest()
    structure = analyze_pdf_structure(pdf_data)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_file.write(pdf_data)
    temp_file.close()

    signature_found = False
    signature_valid = False
    cryptographic_signature_valid = False
    document_integrity = False
    certificate_trusted = False
    signer_name = None
    organization = None
    reasons = []
    modification_analysis = {
        "modified_after_signing": False,
        "suspicious": False,
        "modification_level": None,
        "modification_level_value": None,
        "docmdp_compliant": None,
        "coverage": None,
        "findings": ["No digital signature found"],
        "strict_mode": "PYHANKO_DIFF_ANALYSIS"
    }

    try:
        with open(temp_file.name, "rb") as f:
            reader = PdfFileReader(f)
            signatures = reader.embedded_signatures

            if not signatures:
                reasons.append("No digital signature found")
                risk_score = 40
                risk_level = threat_level(risk_score)
                quantum = quantum_analysis(False, False, structure["suspicious_features"])

            else:
                signature_found = True
                sig = signatures[0]

                validation_context = ValidationContext(
                    trust_roots=[],
                    allow_fetching=False
                )

                def validate():
                    return validate_pdf_signature(
                        sig,
                        signer_validation_context=validation_context
                    )

                status = await asyncio.to_thread(validate)

                cryptographic_signature_valid = (
                    bool(status.intact) and bool(status.valid)
                )

                modification_analysis = analyze_signature_modifications(
                    status,
                    len(signatures),
                    pdf_data,
                    sig
                )

                # A document changed after signing is invalid for Cert X,
                # even if the original CMS signature itself remains valid.
                signature_valid = (
                    cryptographic_signature_valid
                    and not modification_analysis["suspicious"]
                )

                document_integrity = signature_valid

                try:
                    certificate_trusted = bool(status.valid_cert)
                except Exception:
                    certificate_trusted = False

                try:
                    signer_cert = sig.signer_cert
                    if signer_cert:
                        subject = signer_cert.subject
                        signer_name = subject.native.get("common_name")
                        organization = subject.native.get("organization_name")
                except Exception:
                    pass

                if modification_analysis["modified_after_signing"]:
                    reasons.append("Post-signature PDF modification detected")

                if modification_analysis["suspicious"]:
                    for item in modification_analysis["findings"]:
                        reasons.append(str(item))

                if signature_valid:
                    reasons.append("Digital signature integrity verified")
                else:
                    reasons.append("Digital signature verification failed")

                if document_integrity:
                    reasons.append("Document integrity check passed")
                else:
                    reasons.append("Possible document tampering detected")

                # Only genuinely suspicious structure findings enter threat reasons.
                for item in structure["findings"]:
                    if isinstance(item, dict) and item.get("suspicious") is True:
                        reasons.append(str(item.get("message", "Suspicious PDF feature detected")))
                    elif isinstance(item, str):
                        reasons.append(item)

                # Evidence-weighted risk aggregation.
                risk_score = 0

                if not cryptographic_signature_valid:
                    risk_score += 60

                if modification_analysis["suspicious"]:
                    risk_score += 60

                risk_score += min(
                    structure["suspicious_features"] * 10,
                    40
                )

                risk_score = min(risk_score, 100)
                risk_level = threat_level(risk_score)

                quantum = quantum_analysis(
                    signature_valid,
                    document_integrity,
                    structure["suspicious_features"]
                )

        behaviour = behaviour_analysis(employee_id)

        save_activity(
            employee_id,
            file.filename,
            risk_score,
            risk_level,
            signature_valid,
            document_integrity
        )

        alert_triggered = risk_score > 50
        alert_id = None

        if alert_triggered:
            alert_id = create_alert(
                employee_id,
                file.filename,
                risk_score,
                risk_level,
                "; ".join(str(item) for item in reasons)
            )

        return {
            "success": True,
            "system": "Cert X",
            "document": {
                "filename": file.filename,
                "file_type": "PDF",
                "size_bytes": len(pdf_data),
                "sha256": sha256_hash
            },
            "signature": {
                "found": signature_found,
                "valid": signature_valid,
                "cryptographic_valid": cryptographic_signature_valid,
                "integrity": document_integrity,
                "certificate_trusted": certificate_trusted
            },
            "signer": {
                "identity_status": "CERTIFICATE_IDENTITY_AVAILABLE" if signer_name else "NOT_AVAILABLE",
                "signer_name": signer_name,
                "organization": organization
            },
            "authorization": {
                "identity_match": "PENDING",
                "organization_match": "PENDING",
                "role_permission": "PENDING",
                "overall_status": "REQUIRES_ORGANIZATION_DATABASE"
            },
            "document_security": {
                "tampering_detected": not document_integrity,
                "post_signature_modification": modification_analysis,
                "structure_analysis": structure
            },
            "hash_analysis": {
                "algorithm": "SHA-256",
                "hash": sha256_hash,
                "status": "CALCULATED"
            },
            "quantum_analysis": quantum,
            "behaviour_analysis": behaviour,
            "threat": {
                "score": risk_score,
                "level": risk_level,
                "alert_required": alert_triggered,
                "reasons": reasons
            },
            "security_officer_alert": {
                "triggered": alert_triggered,
                "alert_id": alert_id,
                "severity": risk_level if alert_triggered else "NONE",
                "message": "High-risk activity detected. Security Officer review required." if alert_triggered else None
            }
        }

    except Exception as e:
        return {"success": False, "system": "Cert X", "error": str(e)}

    finally:
        Path(temp_file.name).unlink(missing_ok=True)


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