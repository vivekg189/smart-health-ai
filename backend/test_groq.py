import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test if API key is loaded
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

print("=" * 50)
print("GROQ API KEY TEST")
print("=" * 50)

if GROQ_API_KEY:
    print(f"✓ API Key found: {GROQ_API_KEY[:20]}...")
    print(f"✓ API Key length: {len(GROQ_API_KEY)}")
    
    # Test Groq connection
    try:
        from groq import Groq
        print("✓ Groq package imported successfully")
        
        client = Groq(api_key=GROQ_API_KEY)
        print("✓ Groq client created successfully")
        
        # Test API call
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello' in one word"
                }
            ],
            temperature=0.1,
            max_tokens=10
        )
        
        response = completion.choices[0].message.content
        print(f"✓ API call successful! Response: {response}")
        print("\n✅ ALL TESTS PASSED - NutriMind AI is ready!")
        
    except ImportError:
        print("✗ Groq package not installed. Run: pip install groq")
    except Exception as e:
        print(f"✗ Error testing Groq API: {str(e)}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. Network connection problem")
        print("3. Groq API service issue")
else:
    print("✗ GROQ_API_KEY not found in .env file")
    print("\nPlease check:")
    print("1. .env file exists in backend folder")
    print("2. .env file contains: GROQ_API_KEY=your_key_here")
    print("3. No spaces around the = sign")

print("=" * 50)
