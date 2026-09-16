from pyhanko.sign import signers
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter

input_pdf = "unsigned_document.pdf"
output_pdf = "valid_signed_document.pdf"

# Demo signer certificate + private key
signer = signers.SimpleSigner.load(
    key_file="signer.key",
    cert_file="signer.crt",
    key_passphrase=None,
)

with open(input_pdf, "rb") as inf:
    writer = IncrementalPdfFileWriter(inf)

    signers.sign_pdf(
        writer,
        signature_meta=signers.PdfSignatureMetadata(
            field_name="Signature1",
            reason="Digital Document Approval",
            location="CyberSec Bank",
        ),
        signer=signer,
        output=open(output_pdf, "wb"),
    )

print("Digitally signed PDF created!")
print("File:", output_pdf)