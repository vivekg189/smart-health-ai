"""
Healthcare App - System Diagnostic Tool
Run this to check your system connectivity and configuration
"""

import socket
import sys
import os

def check_dns(hostname):
    """Check if DNS resolution works"""
    try:
        socket.gethostbyname(hostname)
        return True, "OK"
    except socket.gaierror as e:
        return False, str(e)

def check_internet():
    """Check internet connectivity"""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True, "OK"
    except OSError as e:
        return False, str(e)

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        return False, ".env file not found"
    
    with open(env_path, 'r') as f:
        content = f.read()
        has_db = 'DATABASE_URL=' in content
        has_groq = 'GROQ_API_KEY=' in content
        
        if has_db and has_groq:
            return True, "All required variables present"
        else:
            missing = []
            if not has_db: missing.append('DATABASE_URL')
            if not has_groq: missing.append('GROQ_API_KEY')
            return False, f"Missing: {', '.join(missing)}"

def main():
    print("=" * 60)
    print("Healthcare App - System Diagnostic")
    print("=" * 60)
    print()
    
    # Check internet connectivity
    print("1. Checking Internet Connectivity...")
    status, msg = check_internet()
    print(f"   {'✅' if status else '❌'} Internet: {msg}")
    print()
    
    # Check DNS resolution
    print("2. Checking DNS Resolution...")
    
    hosts_to_check = [
        ("google.com", "General DNS"),
        ("huggingface.co", "Hugging Face"),
        ("aws-0-ap-northeast-1.pooler.supabase.com", "Supabase Database"),
    ]
    
    for host, name in hosts_to_check:
        status, msg = check_dns(host)
        print(f"   {'✅' if status else '❌'} {name} ({host}): {msg}")
    print()
    
    # Check environment file
    print("3. Checking Environment Configuration...")
    status, msg = check_env_file()
    print(f"   {'✅' if status else '❌'} .env file: {msg}")
    print()
    
    # Check Python packages
    print("4. Checking Required Packages...")
    required_packages = [
        'flask',
        'flask_cors',
        'transformers',
        'torch',
        'easyocr',
        'psycopg2',
        'sqlalchemy',
        'groq'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - NOT INSTALLED")
            missing_packages.append(package)
    print()
    
    # Summary and recommendations
    print("=" * 60)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 60)
    
    if not check_internet()[0]:
        print("❌ CRITICAL: No internet connection detected")
        print("   → Check your network connection")
        print("   → Try: ipconfig /flushdns (Windows) or sudo systemd-resolve --flush-caches (Linux)")
        print("   → Restart your router/modem")
        print()
    
    if not check_dns("huggingface.co")[0]:
        print("⚠️  WARNING: Cannot reach Hugging Face")
        print("   → Bone fracture detection will not work")
        print("   → Other features will work normally")
        print()
    
    if not check_dns("aws-0-ap-northeast-1.pooler.supabase.com")[0]:
        print("⚠️  WARNING: Cannot reach Supabase database")
        print("   → App will run in DEMO MODE")
        print("   → Data will NOT be saved")
        print("   → Login will work with any credentials")
        print()
    
    if missing_packages:
        print(f"⚠️  WARNING: Missing packages: {', '.join(missing_packages)}")
        print(f"   → Run: pip install {' '.join(missing_packages)}")
        print()
    
    if check_internet()[0] and not missing_packages:
        print("✅ System is ready! You can start the Flask server.")
        print("   → Run: python app.py")
    else:
        print("⚠️  System has issues but app will run in limited mode")
        print("   → Fix the issues above for full functionality")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
