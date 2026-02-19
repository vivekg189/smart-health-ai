#!/usr/bin/env python3
"""
Debug script for testing medical report parameter extraction
"""

import re

# Sample medical report texts for testing
SAMPLE_REPORTS = {
    "standard_format": """
    LABORATORY REPORT
    
    Patient Name: John Doe
    Date: 2024-01-15
    
    BLOOD TESTS:
    Hemoglobin: 13.5 g/dL
    Glucose: 145 mg/dL
    Total Cholesterol: 245 mg/dL
    LDL Cholesterol: 160 mg/dL
    HDL Cholesterol: 35 mg/dL
    Triglycerides: 180 mg/dL
    Creatinine: 1.8 mg/dL
    ALT (SGPT): 78 IU/L
    AST (SGOT): 65 IU/L
    """,
    
    "alternate_format": """
    Lab Results Summary
    
    HB = 12.8 g/dL
    FBS = 156 mg/dL
    Chol = 220 mg/dL
    Creat = 1.5 mg/dL
    SGPT = 55 IU/L
    SGOT = 48 IU/L
    """,
    
    "tabular_format": """
    Test Name          Result      Unit      Reference Range
    ----------------------------------------------------------------
    Hemoglobin         11.2        g/dL      12.0-16.0
    Blood Sugar        168         mg/dL     70-100
    Cholesterol        258         mg/dL     <200
    Creatinine         2.1         mg/dL     0.6-1.2
    ALT                92          IU/L      7-56
    """,
    
    "unstructured": """
    Patient blood work shows hemoglobin at 10.8, glucose reading of 178,
    cholesterol level is 265, creatinine measured at 1.9, and liver enzymes
    ALT 85 and AST 72.
    """
}

# Enhanced patterns with aliases
PATTERNS = {
    'glucose': r'(?:blood\s+)?(?:glucose|sugar|fasting\s+blood\s+sugar|fbs|random\s+blood\s+sugar|rbs)[:\s=-]*([0-9.]+)',
    'hemoglobin': r'(?:h[ae]?moglobin|hb|haemoglobin)[:\s=-]*([0-9.]+)',
    'cholesterol': r'(?:total\s+)?(?:cholesterol|chol)[:\s=-]*([0-9.]+)',
    'creatinine': r'(?:serum\s+)?(?:creatinine|creat)[:\s=-]*([0-9.]+)',
    'alt': r'(?:sgpt|alt|alanine\s+aminotransferase|alanine)[:\s=-]*([0-9.]+)',
    'ast': r'(?:sgot|ast|aspartate\s+aminotransferase|aspartate)[:\s=-]*([0-9.]+)',
}

def test_extraction(report_name, report_text):
    """Test parameter extraction on a sample report"""
    print(f"\n{'='*70}")
    print(f"Testing: {report_name}")
    print(f"{'='*70}")
    
    text_lower = report_text.lower()
    found_params = []
    
    for param_name, pattern in PATTERNS.items():
        matches = list(re.finditer(pattern, text_lower, re.IGNORECASE))
        if matches:
            for match in matches:
                if match.group(1):
                    value = match.group(1)
                    found_params.append((param_name, value))
                    print(f"✓ {param_name.upper()}: {value}")
    
    if not found_params:
        print("✗ No parameters detected!")
        print("\nText preview:")
        print(report_text[:200])
    else:
        print(f"\nTotal found: {len(found_params)} parameters")
    
    return found_params

def main():
    print("="*70)
    print("MEDICAL REPORT PARAMETER EXTRACTION TEST")
    print("="*70)
    
    total_found = 0
    for report_name, report_text in SAMPLE_REPORTS.items():
        found = test_extraction(report_name, report_text)
        total_found += len(found)
    
    print(f"\n{'='*70}")
    print(f"SUMMARY: {total_found} total parameters extracted across all reports")
    print(f"{'='*70}")
    
    # Test with user input
    print("\n\nWant to test your own report text? (y/n): ", end="")
    try:
        choice = input().strip().lower()
        if choice == 'y':
            print("\nPaste your report text (press Ctrl+D or Ctrl+Z when done):")
            import sys
            user_text = sys.stdin.read()
            test_extraction("User Report", user_text)
    except:
        pass

if __name__ == "__main__":
    main()
