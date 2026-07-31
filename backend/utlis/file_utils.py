import io
import pypdf
import docx

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        for paragraph in doc.paragraphs:
            if paragraph.text:
                text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def extract_text(filename: str, file_bytes: bytes) -> str:
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext == 'pdf':
        return extract_text_from_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        return extract_text_from_docx(file_bytes)
    elif ext == 'txt':
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error reading TXT: {e}")
            return ""
    else:
        # Fallback to txt decoding
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            return ""
