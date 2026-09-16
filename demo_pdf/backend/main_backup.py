from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path
import hashlib
import tempfile
import asyncio
import re
from datetime import datetime, timezone

from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko_certvalidator import ValidationContext


# ============================================================
# SENTRIVAULT / CERT X
# Digital Signature Security Analysis API
# ============================================================

app = FastAPI(
    title="Cert X - SENTRIVAULT Security API",
    description="Digital Signature and Cyber Threat Analysis",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "system": "Cert X",
        "platform": "SENTRIVAULT",
        "status": "online",
        "message": "Digital Signature Security API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "Cert X",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ============================================================
# HELPER - THREAT LEVEL
# ============================================================

def get_threat_level(score):

    if score >= 80:
        return "HIGH"

    if score >= 50:
        return "MEDIUM"

    return "LOW"


# ============================================================
# HELPER - QUANTUM-INSPIRED RISK ANALYSIS
# ============================================================

def quantum_inspired_analysis(
    signature_valid,
    document_integrity,
    suspicious_features
):

    """
    This is a quantum-inspired risk scoring simulation.
    It does NOT claim to run on a real quantum computer.

    The purpose is to demonstrate how a future optimization
    layer could prioritize cyber risks.
    """

    risk_factors = 0

    if not signature_valid:
        risk_factors += 40

    if not document_integrity:
        risk_factors += 40

    risk_factors += min(suspicious_features * 5, 20)

    optimized_score = min(risk_factors, 100)

    if optimized_score >= 80:
        priority = "CRITICAL"

    elif optimized_score >= 50:
        priority = "ELEVATED"

    else:
        priority = "NORMAL"

    return {
        "method": "Quantum-Inspired Risk Optimization",
        "status": "SIMULATION",
        "optimized_risk_score": optimized_score,
        "risk_priority": priority,
        "explanation": (
            "Quantum-inspired optimization is used to prioritize "
            "security risk factors for analysis."
        )
    }


# ============================================================
# PDF STRUCTURE ANALYSIS
# ============================================================

def analyze_pdf_structure(pdf_data):

    suspicious = 0
    findings = []

    # JavaScript indicators
    javascript_patterns = [
        b"/JavaScript",
        b"/JS"
    ]

    for pattern in javascript_patterns:

        if pattern in pdf_data:

            suspicious += 1

            findings.append(
                "PDF contains a JavaScript-related object"
            )

            break

    # Embedded file indicator
    if b"/EmbeddedFile" in pdf_data:

        suspicious += 1

        findings.append(
            "PDF contains an embedded file object"
        )

    # OpenAction indicator
    if b"/OpenAction" in pdf_data:

        suspicious += 1

        findings.append(
            "PDF contains an automatic document action"
        )

    # Launch action
    if b"/Launch" in pdf_data:

        suspicious += 1

        findings.append(
            "PDF contains a launch action"
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
# MAIN VERIFY API
# ============================================================

@app.post("/api/verify")
async def verify_pdf(file: UploadFile = File(...)):

    # --------------------------------------------------------
    # FILE TYPE
    # --------------------------------------------------------

    if not file.filename.lower().endswith(".pdf"):

        return {
            "success": False,
            "error": "Only PDF files are supported"
        }

    # --------------------------------------------------------
    # READ FILE
    # --------------------------------------------------------

    pdf_data = await file.read()

    if not pdf_data:

        return {
            "success": False,
            "error": "Uploaded PDF is empty"
        }

    # --------------------------------------------------------
    # SHA-256
    # --------------------------------------------------------

    sha256_hash = hashlib.sha256(pdf_data).hexdigest()

    # --------------------------------------------------------
    # PDF STRUCTURE ANALYSIS
    # --------------------------------------------------------

    structure = analyze_pdf_structure(pdf_data)

    # --------------------------------------------------------
    # TEMPORARY FILE
    # --------------------------------------------------------

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    )

    temp_file.write(pdf_data)
    temp_file.close()

    # ========================================================
    # BASE RESULT
    # ========================================================

    result = {

        "success": True,

        "system": "Cert X",

        "document": {

            "filename": file.filename,

            "file_type": "PDF",

            "size_bytes": len(pdf_data),

            "sha256": sha256_hash

        },

        "signature": {

            "found": False,

            "valid": False,

            "integrity": False,

            "certificate_trusted": False

        },

        "signer": {

            "identity_status": "NOT_ANALYZED",

            "signer_name": None,

            "organization": None,

            "authorization_status": "REQUIRES_ORGANIZATION_DATABASE"

        },

        "authorization": {

            "identity_match": "NOT_VERIFIED",

            "organization_match": "NOT_VERIFIED",

            "role_permission": "NOT_VERIFIED",

            "overall_status": "PENDING"

        },

        "document_security": {

            "tampering_detected": False,

            "structure_analysis": structure

        },

        "hash_analysis": {

            "algorithm": "SHA-256",

            "hash": sha256_hash,

            "status": "CALCULATED"

        },

        "quantum_analysis": {

            "method": "Quantum-Inspired Risk Optimization",

            "status": "PENDING"

        },

        "behaviour_analysis": {

            "status": "PENDING",

            "note": (
                "Behaviour analysis requires historical "
                "employee activity data."
            )

        },

        "threat": {

            "score": 0,

            "level": "LOW",

            "alert_required": False,

            "reasons": []

        },

        "security_officer_alert": {

            "triggered": False,

            "severity": "NONE",

            "message": None

        }

    }

    try:

        # ====================================================
        # OPEN PDF
        # ====================================================

        with open(temp_file.name, "rb") as f:

            reader = PdfFileReader(f)

            signatures = reader.embedded_signatures

            # =================================================
            # NO SIGNATURE
            # =================================================

            if not signatures:

                result["threat"]["score"] = 40

                result["threat"]["level"] = "MEDIUM"

                result["threat"]["reasons"].append(
                    "No digital signature found"
                )

                result["signer"]["identity_status"] = (
                    "NO_SIGNATURE"
                )

                result["authorization"]["overall_status"] = (
                    "NOT_APPLICABLE"
                )

                result["quantum_analysis"] = (
                    quantum_inspired_analysis(
                        False,
                        False,
                        structure["suspicious_features"]
                    )
                )

                return result

            # =================================================
            # SIGNATURE FOUND
            # =================================================

            result["signature"]["found"] = True

            sig = signatures[0]

            # =================================================
            # VALIDATION CONTEXT
            # =================================================

            validation_context = ValidationContext(
                trust_roots=[],
                allow_fetching=False
            )

            # =================================================
            # PYHANKO VALIDATION
            # =================================================

            def perform_validation():

                return validate_pdf_signature(
                    sig,
                    signer_validation_context=validation_context
                )

            status = await asyncio.to_thread(
                perform_validation
            )

            # =================================================
            # SIGNATURE RESULT
            # =================================================

            result["signature"]["valid"] = bool(
                status.intact
            )

            result["signature"]["integrity"] = bool(
                status.docmdp_ok
            )

            # =================================================
            # CERTIFICATE TRUST
            # =================================================

            try:

                result["signature"]["certificate_trusted"] = bool(
                    status.valid_cert
                )

            except Exception:

                result["signature"]["certificate_trusted"] = False

            # =================================================
            # SIGNER INFORMATION
            # =================================================

            try:

                signer_cert = sig.signer_cert

                if signer_cert:

                    subject = signer_cert.subject

                    # Common Name
                    try:

                        cn = subject.native.get(
                            "common_name"
                        )

                    except Exception:

                        cn = None

                    # Organization
                    try:

                        organization = subject.native.get(
                            "organization_name"
                        )

                    except Exception:

                        organization = None

                    result["signer"]["signer_name"] = cn

                    result["signer"]["organization"] = organization

                    result["signer"]["identity_status"] = (
                        "CERTIFICATE_IDENTITY_AVAILABLE"
                    )

            except Exception:

                result["signer"]["identity_status"] = (
                    "IDENTITY_EXTRACTION_UNAVAILABLE"
                )

            # =================================================
            # AUTHORIZATION
            # =================================================

            # We do NOT claim actual authorization without
            # a real organization employee database.

            result["authorization"] = {

                "identity_match":
                    "REQUIRES_EMPLOYEE_DIRECTORY",

                "organization_match":
                    "REQUIRES_ORGANIZATION_DIRECTORY",

                "role_permission":
                    "REQUIRES_ACCESS_CONTROL_DATABASE",

                "overall_status":
                    "PENDING_EXTERNAL_AUTHORIZATION_CHECK"

            }

            # =================================================
            # TAMPERING
            # =================================================

            if (
                not status.intact
                or not status.docmdp_ok
            ):

                result[
                    "document_security"
                ][
                    "tampering_detected"
                ] = True

            # =================================================
            # THREAT SCORE
            # =================================================

            score = 0

            reasons = []

            # Signature
            if not status.intact:

                score += 45

                reasons.append(
                    "Digital signature verification failed"
                )

            else:

                reasons.append(
                    "Digital signature integrity verified"
                )

            # Document integrity
            if not status.docmdp_ok:

                score += 45

                reasons.append(
                    "Document integrity check failed"
                )

            else:

                reasons.append(
                    "Document integrity check passed"
                )

            # PDF suspicious features
            if structure["suspicious_features"] > 0:

                score += min(
                    structure["suspicious_features"] * 5,
                    20
                )

                reasons.extend(
                    structure["findings"]
                )

            # Certificate trust
            if not result[
                "signature"
            ][
                "certificate_trusted"
            ]:

                reasons.append(
                    "Certificate is not trusted by the configured trust store"
                )

            score = min(score, 100)

            result["threat"]["score"] = score

            result["threat"]["level"] = get_threat_level(
                score
            )

            result["threat"]["reasons"] = reasons

            # =================================================
            # QUANTUM-INSPIRED ANALYSIS
            # =================================================

            result["quantum_analysis"] = (
                quantum_inspired_analysis(

                    status.intact,

                    status.docmdp_ok,

                    structure["suspicious_features"]

                )
            )

            # =================================================
            # SECURITY OFFICER ALERT
            # =================================================

            if score >= 80:

                result["threat"]["alert_required"] = True

                result[
                    "security_officer_alert"
                ] = {

                    "triggered": True,

                    "severity": "HIGH",

                    "message": (
                        "High-risk document detected. "
                        "Security Officer review required."
                    )

                }

            else:

                result[
                    "security_officer_alert"
                ] = {

                    "triggered": False,

                    "severity": "NONE",

                    "message": None

                }

            return result

    except Exception as e:

        # ====================================================
        # VERIFICATION ERROR
        # ====================================================

        result["success"] = False

        result["threat"]["score"] = 90

        result["threat"]["level"] = "HIGH"

        result["threat"]["alert_required"] = True

        result["threat"]["reasons"] = [

            "PDF security verification failed"

        ]

        result["security_officer_alert"] = {

            "triggered": True,

            "severity": "HIGH",

            "message": (
                "PDF verification engine encountered "
                "a security verification error."
            )

        }

        result["error"] = str(e)

        return result

    finally:

        Path(
            temp_file.name
        ).unlink(
            missing_ok=True
        )