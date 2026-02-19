#!/usr/bin/env python3
"""
Test script for Report Analyzer
Tests with various report formats
"""

import requests
import json
from io import BytesIO

# Test data
test_reports = [
    {
        "name": "Standard Blood Test",
        "content": """
        BLOOD TEST REPORT
        Patient: John Doe
        Date: 2024-01-15
        
        Glucose: 245 mg/dL
        Hemoglobin: 10.8 g/dL
        Total Cholesterol: 280 mg/dL
        LDL: 160 mg/dL
        HDL: 35 mg/dL
        Triglycerides: 220 mg/dL
        Creatinine: 1.8 mg/dL
        ALT: 78 IU/L
        AST: 65 IU/L
        """
    },
    {
        "name": "Minimal Report",
        "content": """
        Lab Results
        Glucose 120
        Cholesterol 190
        """
    },
    {
        "name": "Thyroid Panel",
        "content": """
        THYROID FUNCTION TEST
        TSH: 5.5 mIU/L
        T3: 75 ng/dL
        T4: 4.5 μg/dL
        """
    },
    {
        "name": "Empty Report",
        "content": """
        This is a medical report with no numeric values.
        Patient visited for consultation.
        """
    }
]

def test_report(name, content):
    """Test a single report"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    
    # Create a text file in memory
    file_data = BytesIO(content.encode('utf-8'))
    file_data.name = 'test_report.txt'
    
    try:
        response = requests.post(
            'http://localhost:5000/api/analyze-report',
            files={'file': ('test_report.txt', file_data, 'text/plain')}
        )
        
        print(f"Status Code: {response.status_code}")
        
        data = response.json()
        
        if response.status_code == 200:
            print(f"✅ SUCCESS")
            print(f"Parameters Found: {data.get('total_found', 0)}")
            
            if data.get('parameters'):
                print("\nDetected Parameters:")
                for param in data['parameters']:
                    status_emoji = {
                        'NORMAL': '🟢',
                        'BORDERLINE_HIGH': '🟡',
                        'BORDERLINE_LOW': '🟡',
                        'HIGH': '🔴',
                        'LOW': '🔴'
                    }.get(param['status'], '⚪')
                    print(f"  {status_emoji} {param['parameter']}: {param['value']} {param['unit']} ({param['status']})")
            
            if data.get('clinical_summary'):
                print(f"\nClinical Summary:")
                print(f"  {data['clinical_summary']}")
            
            if data.get('suggested_models'):
                print(f"\nSuggested Models:")
                for model in data['suggested_models']:
                    print(f"  → {model['name']}: {model['reason']}")
        else:
            print(f"❌ ERROR: {data.get('error', 'Unknown error')}")
            if 'details' in data:
                print(f"Details: {data['details']}")
    
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")

def main():
    print("="*60)
    print("REPORT ANALYZER TEST SUITE")
    print("="*60)
    print("\nMake sure backend is running on http://localhost:5000")
    print("Press Ctrl+C to stop\n")
    
    # Test backend health
    try:
        response = requests.get('http://localhost:5000/api/health')
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("⚠️ Backend responded but may have issues")
    except:
        print("❌ Backend is not running!")
        print("Start it with: cd backend && python app.py")
        return
    
    # Run tests
    for test in test_reports:
        test_report(test['name'], test['content'])
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60)

if __name__ == '__main__':
    main()
