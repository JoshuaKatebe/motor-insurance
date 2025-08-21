# Fix Firebase Storage CORS Issues

## The Problem
You're getting a CORS error when trying to upload images to Firebase Storage. This is because:
1. Firebase Storage needs proper CORS configuration to accept uploads from localhost
2. The storage bucket might not be properly initialized

## Solution Steps

### Step 1: Verify Firebase Storage is Enabled
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `motor-insurance-96250`
3. Navigate to "Storage" in the left sidebar
4. If not already done, click "Get Started" to initialize Storage
5. Note your storage bucket name (it should be something like `motor-insurance-96250.firebasestorage.app`)

### Step 2: Update Your Environment Variables
Make sure your `.env.local` file has the correct storage bucket:
```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=motor-insurance-96250.firebasestorage.app
```
(Replace with your actual bucket name from Step 1)

### Step 3: Apply CORS Configuration

#### Option A: Using gsutil (Recommended)
Run this command with your actual bucket name:
```bash
gsutil cors set cors.json gs://motor-insurance-96250.firebasestorage.app
```

#### Option B: Using Firebase Console
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project
3. Go to Storage > Browser
4. Click on your bucket
5. Go to the "Configuration" tab
6. Edit CORS configuration and paste:
```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
```

### Step 4: Update Firebase Storage Rules
1. Go to Firebase Console > Storage > Rules
2. Replace the rules with:
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
  }
}
```
3. Click "Publish"

### Step 5: Alternative Code Fix (Temporary)
If CORS issues persist, you can use the Firebase Admin SDK on the server side. Create an API route:

`src/app/api/upload-claim-image/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `claims/${userId}/${Date.now()}-${file.name}`;
    
    const bucket = getStorage().bucket();
    const fileRef = bucket.file(fileName);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });
    
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

Then update your `new-claim/page.tsx` to use this API route instead of direct upload.

## Quick Test
After applying the CORS configuration, test with this simple HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Firebase Upload</title>
</head>
<body>
    <input type="file" id="file" />
    <button onclick="testUpload()">Test Upload</button>
    
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getStorage, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
        
        const firebaseConfig = {
            // Your config here
        };
        
        const app = initializeApp(firebaseConfig);
        const storage = getStorage(app);
        
        window.testUpload = async () => {
            const file = document.getElementById('file').files[0];
            if (file) {
                const storageRef = ref(storage, 'test/' + file.name);
                try {
                    await uploadBytes(storageRef, file);
                    alert('Upload successful!');
                } catch (error) {
                    console.error('Upload failed:', error);
                    alert('Upload failed: ' + error.message);
                }
            }
        };
    </script>
</body>
</html>
```

## Common Issues and Solutions

1. **"Bucket does not exist"**: Make sure Storage is initialized in Firebase Console
2. **"Permission denied"**: Check that the user is authenticated and storage rules are correct
3. **"CORS error persists"**: Clear browser cache and restart the development server
4. **"Invalid bucket name"**: Verify the bucket name in Firebase Console matches your .env.local

## Verification
After applying fixes:
1. Restart your Next.js development server
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try uploading an image again
4. Check browser console for any remaining errors
