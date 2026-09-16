from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

output = "unsigned_document.pdf"

c = canvas.Canvas(output, pagesize=A4)

# Title
c.setFont("Helvetica-Bold", 22)
c.drawString(190, 780, "CyberSec Bank")

c.setFont("Helvetica-Bold", 15)
c.drawString(155, 745, "Digital Document Approval")

# Document details
c.setFont("Helvetica", 11)

details = [
    ("Document ID", "CSB-DOC-001"),
    ("Customer", "Demo Customer"),
    ("Department", "Cyber Security"),
    ("Document Type", "Security Approval Report"),
    ("Status", "Approved"),
]

y = 690

for label, value in details:
    c.setFont("Helvetica-Bold", 11)
    c.drawString(80, y, f"{label}:")
    c.setFont("Helvetica", 11)
    c.drawString(200, y, value)
    y -= 35

# Description
c.setFont("Helvetica-Bold", 12)
c.drawString(80, 500, "Document Purpose")

c.setFont("Helvetica", 11)
c.drawString(
    80,
    475,
    "This document is created for SENTRIVAULT"
)
c.drawString(
    80,
    455,
    "digital signature security verification demo."
)

# Signer information
c.setFont("Helvetica-Bold", 12)
c.drawString(80, 390, "Authorized Signer")

c.setFont("Helvetica", 11)
c.drawString(80, 365, "Name: CyberSec Bank Authorized Signer")
c.drawString(80, 340, "Organization: CyberSec Bank")
c.drawString(80, 315, "Purpose: Digital Document Approval")

# Signature placeholder
c.setFont("Helvetica-Bold", 11)
c.drawString(80, 250, "Digital Signature:")

c.rect(80, 160, 250, 70)

c.setFont("Helvetica", 9)
c.drawString(95, 190, "This area will contain the")
c.drawString(95, 175, "actual cryptographic PDF signature.")

c.save()

print("PDF created successfully!")
print("File:", output)