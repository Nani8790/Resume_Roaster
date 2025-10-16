#!/usr/bin/env python3
"""
PDF Parser for Resume Analysis
Uses multiple Python libraries for robust PDF text extraction
"""

import sys
import json
import os
from pathlib import Path

try:
    import PyPDF2
    import pdfplumber
    import fitz  # PyMuPDF
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Missing required Python library: {e}",
        "install_command": "pip install PyPDF2 pdfplumber PyMuPDF"
    }))
    sys.exit(1)

def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        return None

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber (better for tables and formatting)"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        return None

def extract_text_pymupdf(pdf_path):
    """Extract text using PyMuPDF (fastest and most reliable)"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        return text.strip()
    except Exception as e:
        return None

def parse_pdf(pdf_path):
    """
    Parse PDF using multiple methods for best results
    Returns the best extracted text
    """
    if not os.path.exists(pdf_path):
        return {
            "success": False,
            "error": f"File not found: {pdf_path}"
        }
    
    # Try multiple extraction methods
    methods = [
        ("PyMuPDF", extract_text_pymupdf),
        ("pdfplumber", extract_text_pdfplumber),
        ("PyPDF2", extract_text_pypdf2)
    ]
    
    best_text = ""
    best_method = ""
    
    for method_name, extract_func in methods:
        try:
            text = extract_func(pdf_path)
            if text and len(text) > len(best_text):
                best_text = text
                best_method = method_name
        except Exception as e:
            continue
    
    if not best_text or len(best_text) < 50:
        return {
            "success": False,
            "error": "Could not extract readable text from PDF. The file may contain only images or be corrupted.",
            "extracted_length": len(best_text)
        }
    
    # Clean and format the text
    lines = best_text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line and len(line) > 1:  # Skip empty lines and single characters
            cleaned_lines.append(line)
    
    cleaned_text = '\n'.join(cleaned_lines)
    
    # Basic content analysis
    text_lower = cleaned_text.lower()
    has_email = '@' in cleaned_text
    has_phone = any(char.isdigit() for char in cleaned_text) and ('(' in cleaned_text or '-' in cleaned_text)
    has_experience = any(keyword in text_lower for keyword in ['experience', 'work', 'employment', 'job'])
    has_education = any(keyword in text_lower for keyword in ['education', 'degree', 'university', 'college'])
    has_skills = any(keyword in text_lower for keyword in ['skills', 'technical', 'programming', 'technologies'])
    
    return {
        "success": True,
        "text": cleaned_text,
        "method_used": best_method,
        "extracted_length": len(cleaned_text),
        "line_count": len(cleaned_lines),
        "analysis": {
            "has_contact_info": has_email or has_phone,
            "has_email": has_email,
            "has_phone": has_phone,
            "has_experience_section": has_experience,
            "has_education_section": has_education,
            "has_skills_section": has_skills
        },
        "preview": cleaned_text[:300] + "..." if len(cleaned_text) > 300 else cleaned_text
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python pdf_parser.py <pdf_file_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = parse_pdf(pdf_path)
    print(json.dumps(result, indent=2))