#!/usr/bin/env python3
"""
Quick API test script to verify backend functionality
"""

import requests
import json
import sys

BASE_URL = 'http://localhost:5000'

def test_endpoint(method, endpoint, data=None, token=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        
        print(f"\n🔍 {description}")
        print(f"📡 {method} {endpoint}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code < 400:
            print("✅ Success")
            try:
                return response.json()
            except:
                return response.text
        else:
            print("❌ Failed")
            try:
                error_data = response.json()
                print(f"❗ Error: {error_data}")
            except:
                print(f"❗ Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection failed to {url}")
        print("❗ Make sure the Flask backend is running on port 5000")
        return None
    except Exception as e:
        print(f"\n❌ Request failed: {str(e)}")
        return None

def main():
    print("🏨 Hotel Management System API Test")
    print("=" * 50)
    
    # Test 1: Admin Login
    print("\n🔑 Testing Authentication...")
    admin_data = test_endpoint(
        'POST', '/api/auth/login',
        data={'email': 'admin@stayfolio.com', 'password': 'admin123'},
        description="Admin Login"
    )
    
    if not admin_data:
        print("❌ Admin login failed - cannot continue tests")
        sys.exit(1)
    
    admin_token = admin_data.get('access_token')
    print(f"🎫 Admin token: {admin_token[:20]}...")
    
    # Test 2: Hotel Owner Login
    owner_data = test_endpoint(
        'POST', '/api/auth/login',
        data={'email': 'owner@marlowhotel.com', 'password': 'owner123'},
        description="Hotel Owner Login"
    )
    
    if owner_data:
        owner_token = owner_data.get('access_token')
        print(f"🎫 Owner token: {owner_token[:20]}...")
    else:
        owner_token = None
    
    # Test 3: Get Admin Hotels
    print("\n🏨 Testing Hotel Management...")
    pending_hotels = test_endpoint(
        'GET', '/api/admin/hotels?status=pending',
        token=admin_token,
        description="Get Pending Hotels"
    )
    
    approved_hotels = test_endpoint(
        'GET', '/api/admin/hotels?status=approved',
        token=admin_token,
        description="Get Approved Hotels"
    )
    
    # Test 4: Get Hotel Details (if we have approved hotels)
    if approved_hotels and approved_hotels.get('hotels'):
        hotel_id = approved_hotels['hotels'][0]['id']
        hotel_details = test_endpoint(
            'GET', f'/api/hotels/{hotel_id}',
            token=owner_token or admin_token,
            description=f"Get Hotel {hotel_id} Details"
        )
        
        # Test 5: Get Hotel Bookings
        bookings = test_endpoint(
            'GET', f'/api/hotels/{hotel_id}/bookings',
            token=owner_token or admin_token,
            description=f"Get Hotel {hotel_id} Bookings"
        )
        
        # Test 6: Get Hotel Reviews
        reviews = test_endpoint(
            'GET', f'/api/hotels/{hotel_id}/reviews',
            token=owner_token or admin_token,
            description=f"Get Hotel {hotel_id} Reviews"
        )
        
        # Test 7: Get Analytics
        analytics = test_endpoint(
            'GET', f'/api/analytics/hotels/{hotel_id}',
            token=owner_token or admin_token,
            description=f"Get Hotel {hotel_id} Analytics"
        )
    
    # Test 8: Admin Stats
    stats = test_endpoint(
        'GET', '/api/admin/stats',
        token=admin_token,
        description="Get Admin Statistics"
    )
    
    print("\n🎉 API Test Complete!")
    print("\n📊 Summary:")
    if admin_data:
        print("✅ Admin authentication working")
    if owner_data:
        print("✅ Owner authentication working")
    if approved_hotels:
        print(f"✅ Found {len(approved_hotels.get('hotels', []))} approved hotels")
    if pending_hotels:
        print(f"✅ Found {len(pending_hotels.get('hotels', []))} pending hotels")
    
    print("\n🌐 Next Steps:")
    print("1. Start the React frontend: npm run dev")
    print("2. Visit http://localhost:5173")
    print("3. Login with test credentials:")
    print("   • Admin: admin@stayfolio.com / admin123")
    print("   • Owner: owner@marlowhotel.com / owner123")

if __name__ == '__main__':
    main()