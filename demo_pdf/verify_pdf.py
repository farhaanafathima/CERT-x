from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko_certvalidator import ValidationContext

PDF_FILE = "tampered_document.pdf"

print("=" * 60)
print("        SENTRIVAULT - PDF SECURITY VERIFICATION")
print("=" * 60)

try:
    with open(PDF_FILE, "rb") as f:

        reader = PdfFileReader(f)
        signatures = reader.embedded_signatures

        print(f"\nPDF File           : {PDF_FILE}")
        print(f"Signatures Found   : {len(signatures)}")

        if not signatures:
            print("\n❌ NO DIGITAL SIGNATURE FOUND")
            print("FINAL RESULT       : 🔴 INVALID")
            exit()

        for i, sig in enumerate(signatures, start=1):

            print("\n" + "-" * 60)
            print(f"Signature #{i}")
            print("-" * 60)

            vc = ValidationContext(
                trust_roots=[],
                allow_fetching=False
            )

            try:
                status = validate_pdf_signature(
                    sig,
                    signer_validation_context=vc
                )

                # Signature integrity
                if status.intact:
                    print("Signature Integrity : ✅ VALID")
                else:
                    print("Signature Integrity : ❌ INVALID")

                # Document modification check
                if status.docmdp_ok:
                    print("Document Integrity  : ✅ PASSED")
                else:
                    print("Document Integrity  : ❌ FAILED")

                print("\n" + "=" * 60)

                if status.intact and status.docmdp_ok:
                    print("FINAL RESULT        : 🟢 VALID")
                    print("Threat Status       : LOW")
                else:
                    print("FINAL RESULT        : 🔴 INVALID / TAMPERED")
                    print("Threat Status       : HIGH")

                print("=" * 60)

            except Exception as validation_error:

                print("Signature validation detected an issue.")
                print("Reason:", validation_error)

                print("\n" + "=" * 60)
                print("FINAL RESULT        : 🔴 INVALID / TAMPERED")
                print("Threat Status       : HIGH")
                print("=" * 60)

except FileNotFoundError:

    print("\n❌ PDF FILE NOT FOUND")
    print("Check that tampered_document.pdf exists.")

except Exception as error:

    print("\n❌ VERIFICATION ERROR")
    print(error)