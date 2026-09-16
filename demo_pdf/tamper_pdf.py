import pikepdf

source = "valid_signed_document.pdf"
output = "tampered_document.pdf"

with pikepdf.open(source) as pdf:
    # Modify the first page's PDF metadata/content structure
    pdf.docinfo["/TamperedBy"] = "SENTRIVAULT TEST"

    pdf.save(output)

print("Tampered PDF created successfully!")
print("File:", output)