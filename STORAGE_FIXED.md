# ✅ Firebase Storage CORS Issue - FIXED!

## What Was Done

1. **CORS Configuration Applied** ✅
   - Successfully applied CORS configuration to your Firebase Storage bucket
   - Bucket name: `motor-insurance-96250.firebasestorage.app`
   - CORS now allows requests from:
     - http://localhost:3000
     - http://localhost:3001
     - https://motor-insurance-96250.web.app
     - https://motor-insurance-96250.firebaseapp.com

2. **Storage Rules Created** ✅
   - Created `storage.rules` file with proper authentication rules
   - Users can upload to their own folders under `/claims/{userId}/`

## Final Steps to Complete

### 1. Update Your Environment Variables
Make sure your `.env.local` file has this exact storage bucket:
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=motor-insurance-96250.firebasestorage.app
```

### 2. Deploy Storage Rules to Firebase
Go to the Firebase Console:
1. Navigate to https://console.firebase.google.com/
2. Select your project: `motor-insurance-96250`
3. Go to Storage > Rules
4. Copy and paste these rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read all files
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow users to upload to their own claims folder
    match /claims/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to upload to their own policies folder
    match /policies/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to upload to their own documents folder
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
5. Click "Publish"

### 3. Restart Your Application
```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### 4. Clear Browser Cache
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Testing

After completing the above steps:
1. Go to http://localhost:3000/new-claim
2. Make sure you're logged in
3. Fill out the claim form
4. Try uploading an image
5. The upload should now work without CORS errors!

## Troubleshooting

If you still see errors:

1. **Check Authentication**: Make sure the user is properly authenticated
   ```javascript
   console.log('User ID:', user?.uid); // Should not be null
   ```

2. **Verify Bucket Name**: Check that the bucket name in your code matches exactly:
   ```javascript
   // In src/lib/firebase.ts
   console.log('Storage bucket:', storage.app.options.storageBucket);
   // Should output: motor-insurance-96250.firebasestorage.app
   ```

3. **Check Network Tab**: In Chrome DevTools > Network tab, look for the failed request and check:
   - The Request URL (should include the correct bucket)
   - The Response Headers (should include Access-Control-Allow-Origin)

## Success Indicators

You'll know everything is working when:
- ✅ No CORS errors in the console
- ✅ Image uploads complete successfully
- ✅ Upload progress bar shows progress
- ✅ Images are visible in Firebase Storage console under `/claims/{userId}/`

## Additional Notes

- CORS configuration is now permanent and will persist
- The configuration allows all necessary HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- The `x-goog-resumable` header is included for resumable uploads
- Maximum age for preflight requests is set to 3600 seconds (1 hour)
