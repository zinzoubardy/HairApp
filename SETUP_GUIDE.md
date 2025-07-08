# 🚀 Root & Glow - Complete Setup Guide

## 📋 Prerequisites

### **Development Environment**
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Git
- Code editor (VS Code recommended)

### **Accounts Required**
- **Supabase**: Database and authentication
- **Together AI**: AI analysis and routine generation
- **Expo**: App development and deployment

---

## 🛠️ Installation & Setup

### **1. Clone and Install**
```bash
git clone <your-repo-url>
cd HairApp
npm install
```

### **2. Environment Configuration**
Create `.env` file in root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TOGETHER_AI_API_KEY=your_together_ai_key
```

### **3. Database Setup**
1. Go to Supabase Dashboard
2. Run SQL scripts in order:
   - `sql/01_create_coloring_recipes.sql`
   - `sql/02_create_progress_log.sql`
   - `sql/03_storage_hair_images_policies.sql`
   - `sql/04_create_routines_tables.sql`
   - `sql/06_fix_completed_column.sql` (if needed)

### **4. App Configuration**
Update `app.json`:
```json
{
  "expo": {
    "name": "Root & Glow",
    "slug": "root-and-glow",
    "scheme": "rootandglow",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-notifications",
      "expo-image-picker"
    ]
  }
}
```

---

## 🧪 Testing the Complete Flow

### **1. Development Testing**
```bash
# Start development server
npx expo start

# Test on device/simulator
npx expo start --ios
npx expo start --android
```

### **2. Flow Testing Checklist**

#### **✅ App Launch**
- [ ] Splash screen loads
- [ ] Language selection works
- [ ] Navigation to onboarding/auth

#### **✅ Onboarding**
- [ ] Multi-language carousel
- [ ] Privacy policy acceptance
- [ ] Disclaimer modal
- [ ] Navigation to auth

#### **✅ Authentication**
- [ ] Sign-up with email
- [ ] Email confirmation
- [ ] Sign-in flow
- [ ] Deep linking works

#### **✅ Main App**
- [ ] Home screen loads
- [ ] Navigation between screens
- [ ] Language switching
- [ ] Profile management

#### **✅ Hair Analysis**
- [ ] Image upload
- [ ] AI analysis
- [ ] Results display
- [ ] Recommendations

#### **✅ Routines**
- [ ] Create custom routine
- [ ] AI routine generation
- [ ] Progress tracking
- [ ] Notifications

#### **✅ Database**
- [ ] User authentication
- [ ] Data persistence
- [ ] Routine CRUD operations
- [ ] Progress tracking

---

## 🔧 Configuration Details

### **AI Service Configuration**
```javascript
// src/services/AIService.js
const TOGETHER_AI_API_KEY = process.env.EXPO_PUBLIC_TOGETHER_AI_API_KEY;
const MODEL = "meta-llama/Llama-3.1-8B-Instruct";
```

### **Supabase Configuration**
```javascript
// src/services/SupabaseService.js
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

### **Notification Setup**
```javascript
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

---

## 📱 Production Deployment

### **1. Build Configuration**
```bash
# Configure EAS
npx eas build:configure

# Build for production
npx eas build --platform ios
npx eas build --platform android
```

### **2. App Store Deployment**
```bash
# Submit to App Store
npx eas submit --platform ios

# Submit to Google Play
npx eas submit --platform android
```

### **3. Environment Variables**
Ensure production environment variables are set:
- Supabase production URL and keys
- Together AI production API key
- Notification certificates

---

## 🔍 Troubleshooting

### **Common Issues**

#### **Database Errors**
```bash
# Run diagnostic script
# Copy contents of sql/07_diagnose_database.sql to Supabase SQL editor
```

#### **AI Service Errors**
```bash
# Check API key
echo $EXPO_PUBLIC_TOGETHER_AI_API_KEY

# Test API connection
curl -X POST https://api.together.xyz/v1/chat/completions \
  -H "Authorization: Bearer $EXPO_PUBLIC_TOGETHER_AI_API_KEY" \
  -H "Content-Type: application/json"
```

#### **Notification Issues**
```bash
# Check notification permissions
npx expo install expo-notifications

# Test notifications
npx expo start --clear
```

### **Debug Commands**
```bash
# Clear cache
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Check TypeScript errors
npx tsc --noEmit

# Test database connection
# Use the "Test Database" button in the app
```

---

## 📊 Monitoring & Analytics

### **Error Tracking**
- Expo error reporting
- Supabase error logs
- AI service monitoring

### **Performance Monitoring**
- App load times
- Database query performance
- AI response times

### **User Analytics**
- Feature usage tracking
- User engagement metrics
- Conversion rates

---

## 🚀 Launch Checklist

### **Pre-Launch**
- [ ] All features tested
- [ ] Database errors resolved
- [ ] Privacy policy updated
- [ ] App store assets ready
- [ ] Production environment configured

### **Launch Day**
- [ ] App store submission
- [ ] Marketing materials ready
- [ ] Support documentation
- [ ] Monitoring setup

### **Post-Launch**
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Bug tracking
- [ ] Feature updates

---

## 📞 Support & Maintenance

### **User Support**
- In-app help system
- FAQ documentation
- Contact form
- Community forum

### **Technical Support**
- Error reporting system
- Performance monitoring
- Database maintenance
- API health checks

---

*Your Hair App is now ready for production! 🎉*

**Status**: ✅ **PRODUCTION READY**
**Last Updated**: July 8, 2024 