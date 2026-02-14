# Connecting Flutter Mobile App to Backend

## Step 1: Update API Base URL

In your Flutter project, update the API endpoint:

**File:** `lib/core/api/api_endpoints.dart`

```dart
class ApiEndpoints {
  static const String baseUrl = 'http://localhost:5050/api';  // Updated!

  // Auth endpoints
  static const String studentLogin = '$baseUrl/auth/login';
  static const String studentRegister = '$baseUrl/auth/register';
  static const String studentLogout = '$baseUrl/auth/logout';
  
  // For iOS Simulator, use:
  // static const String baseUrl = 'http://localhost:5050/api';
  
  // For Android Emulator, use:
  // static const String baseUrl = 'http://10.0.2.2:5050/api';
  
  // For physical device on same network, use your computer's IP:
  // static const String baseUrl = 'http://192.168.X.X:5050/api';
}
```

## Step 2: Update Your Mobile App API Service

If you're using the ApiClient pattern, make sure your requests match the backend response format.

### Expected Request Format for Register:
```dart
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "fullName": "string"
}
```

Note: `isInfluencer` is not required from the frontend. The backend sets `isInfluencer` to `false` by default. You can update it later via admin or profile endpoints if needed.

### Expected Response Format:
```dart
{
  "success": true/false,
  "data": {
    // Response data here
  },
  "message": "Success/Error message"
}
```

## Step 3: Handle JWT Token

After successful login, the backend returns:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  },
  "message": "Login successful"
}
```

Store the token using your UserSessionService and include it in future requests:

```dart
// Add to request headers
headers['Authorization'] = 'Bearer $token';
```

## Step 4: Platform-Specific Configuration

### For iOS Simulator:
- Use `http://localhost:5050`
- No additional configuration needed

### For Android Emulator:
- Use `http://10.0.2.2:5050` (special IP for localhost from Android emulator)

### For Physical Device:
1. Get your Mac's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Use that IP: `http://YOUR_IP:5050`
3. Make sure both devices are on the same WiFi network

## Step 5: Update CORS if Needed

If you're accessing from a different origin, update the CORS settings in:

**File:** `re-webapibackend/src/index.ts`

```typescript
const corsOptions = {
    origin: [
        "http://localhost:3000", 
        "http://localhost:3003",
        "http://localhost:5050",  // Add more origins as needed
    ],
};
```

## Step 6: Test the Connection

### Start the Backend:
```bash
cd /Users/shreetikashrestha/Desktop/redomobile/re-webapibackend
npm run dev
```

You should see:
```
Database connected successfully
Server running at: http://localhost:5050
```

### Test from Mobile App:
1. Run your Flutter app
2. Try to register a new user
3. Try to login
4. Check the backend terminal for request logs

## Step 7: Debugging Tips

### Backend Logs:
The backend will log all incoming requests. Watch the terminal for:
- Request headers
- Request body
- Errors

### Check Network Connectivity:
```bash
# From your Mac, test the server
curl http://localhost:5050/api/health

# Should return:
{"success":true,"message":"Server is running"}
```

### Common Issues:

1. **Connection Refused**: 
   - Make sure backend is running
   - Check correct IP/port

2. **CORS Error**:
   - Add your frontend origin to CORS config

3. **401 Unauthorized**:
   - Check token format in Authorization header
   - Verify token hasn't expired

4. **404 Not Found**:
   - Verify API endpoint URLs match exactly

## Step 8: Update User Model Mapping

Make sure your Flutter UserModel can parse the backend response:

```dart
class UserModel {
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? json['_id'],  // Backend uses userId
      fullName: json['fullName'],
      email: json['email'],
      username: json['username'],
      password: json['password'] ?? '',
      isInfluencer: json['isInfluencer'] ?? false,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
    );
  }
}
```

## Complete Example: Login Flow

```dart
Future<void> login(String username, String password) async {
  final response = await dio.post(
    'http://localhost:5050/api/auth/login',
    data: {
      'username': username,
      'password': password,
    },
  );

  if (response.data['success']) {
    final token = response.data['data']['token'];
    final user = response.data['data']['user'];
    
    // Save token
    await storage.write(key: 'auth_token', value: token);
    
    // Save user data
    // ... your user session management
    
    print('Login successful!');
  }
}
```

---

## Quick Start Checklist

- [ ] Backend server is running (`npm run dev`)
- [ ] MongoDB is running
- [ ] Updated API base URL in Flutter app
- [ ] Using correct IP for your platform (simulator/emulator/device)
- [ ] CORS is configured if needed
- [ ] Request/Response models match
- [ ] Token storage is implemented
- [ ] Authorization header is sent with protected requests

---

**You're all set! 🚀** Your Flutter app can now communicate with the backend.
