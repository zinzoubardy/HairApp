# Root & Glow - Intelligent Hair Analysis & Care Platform
**Last Updated: July 2024**

## 🚦 MVP Progress & Roadmap (July 2024)

### ✅ What is Done (MVP)
- [x] App rebranding (Root & Glow, logo, theme)
- [x] Multi-language onboarding carousel (EN/FR/AR)
- [x] User profile data collection (hair goals, allergies, preferences)
- [x] Supabase integration (auth, profile, storage, RLS)
- [x] AI-powered hair analysis (Together AI, multi-angle, general analysis)
- [x] Deep linking for email confirmation and onboarding
- [x] Navigation flow: Splash, Auth, Onboarding, Main Tabs
- [x] Privacy policy and terms accessible from key screens
- [x] Upload rules and privacy note on image upload
- [x] Error handling, loading states, and debug logging
- [x] Environment variable management for Expo/production
- [x] Production-ready Expo config (scheme, icons, splash)

### 🟡 In Progress / Not Yet Done (MVP)
- [ ] Privacy Policy & Terms acceptance modal in onboarding
- [ ] Account/data deletion option in Profile
- [ ] Finalize transparent logo assets
- [ ] Minor UI polish and accessibility review

### ⏭️ Next Steps
- Implement Privacy Policy & Terms acceptance modal (block onboarding until accepted)
- Add account/data deletion button to Profile screen
- Add privacy note to Upload screen ("No faces, only hair")
- Finalize and test transparent logo assets
- Conduct final QA and accessibility review
- Prepare for App Store/Play Store submission

### 📊 MVP Completion Estimate
- **MVP Completion:** 85-90%
- **Core features are complete and stable.**
- **Remaining work:** Privacy/consent modals, account deletion, final polish

---

### 🚀 What Could Be in the Next Version (v1.1+)
- Social sharing of analysis results
- Hair care product recommendations (with affiliate links)
- Push notifications for routine reminders
- In-app feedback and support chat
- More advanced AI models (paid tier, faster responses)
- Hair growth tracking over time (progress photos)
- More languages (Spanish, German, etc.)
- Dark mode
- Pro/paid features (export PDF, expert review)
- Integration with wearable devices (scalp sensors, etc.)

---

## 🌟 Overview
Root & Glow is a comprehensive React Native Expo application that provides AI-powered hair analysis and personalized hair care recommendations. The app is fully rebranded, supports English, Arabic, and French, and is ready for production deployment.

---

## 🚀 Current Status
- **App Name:** Root & Glow (formerly HairNature AI)
- **Onboarding:** Multi-language carousel, collects user profile data, supports "Other" custom answers
- **Profile:** Data saved to Supabase (hair_goal, allergies, hair_concerns_preferences, hair_type, heat_usage)
- **Deep Linking:** Configured for both development and production (custom scheme: `rootandglow://`)
- **Logo:** Ready for transparent deployment (replace assets/icon.png, adaptive-icon.png, favicon.png as needed)
- **Deployment:** Expo config is valid, ready for EAS build and store submission

---

## 🔒 Security & GDPR
- **User Data:** All personal data is stored securely in Supabase with RLS (Row Level Security) enabled.
- **Authentication:** Email/password with confirmation, deep link onboarding
- **GDPR/Privacy:**
  - Users are informed that their data is stored securely and only used for app functionality.
  - **Consent:** On first sign-in, users must accept the Privacy Policy and Terms of Service (to be implemented as a modal or screen before onboarding is complete).
  - **Right to Delete:** Users can request deletion of their account and data (add a button in Profile screen for this).
  - **Data Minimization:** Only necessary data is collected (no face images required).

---

## 📸 User Photos
- **Important:** Users should only upload photos of their hair. **Faces are not required and should not be visible in uploaded images.**
- Add a note in the upload screen: "For your privacy, please ensure your face is not visible in the photo. Only hair parts are needed for analysis."

---

## 📝 Next Steps
- [ ] Add Privacy Policy & Terms of Service modal/acceptance to onboarding
- [ ] Add account/data deletion option in Profile
- [ ] Add privacy note to Upload screen
- [ ] Finalize transparent logo assets

---

## 💬 Support
For any issues or questions, contact the Root & Glow team.

## 🚀 Key Features

### 🤖 AI-Powered Hair Analysis
- **Multi-Angle Analysis**: Upload 4 images (Top, Back, Left, Right) for comprehensive hair assessment
- **Real-Time Visual Analysis**: Uses Together AI's Llama-Vision-Free model for accurate image processing
- **Comprehensive Assessment**: Analyzes hair texture, color, scalp condition, damage, and overall health
- **Personalized Recommendations**: AI-generated advice based on visual evidence from your hair images
- **Hybrid AI Approach**: Vision model for single images, text model for multi-image analysis

### 📊 Dashboard & Analytics
- **Overall Hair Health Score**: Percentage-based assessment of hair condition
- **Color Analysis**: Detects actual hair color with professional dye references
- **Scalp Health Assessment**: Analyzes scalp condition for oiliness, dryness, and irritation
- **Visual Color Swatches**: Shows detected hair color with professional color matching
- **Real-Time Updates**: Dashboard refreshes with latest analysis results
- **Structured Data Parsing**: AI responses parsed into organized, displayable sections

### 🎯 Two Analysis Modes
1. **Dashboard Update**: Comprehensive 4-image analysis for complete hair profile
2. **General Analysis**: Single image + question for specific hair concerns

### 👤 User Profile Management
- **Multi-Angle Image Upload**: Upload hair images from all angles
- **Profile Customization**: Set hair goals, allergies, and preferences
- **Image Management**: Easy upload, preview, and replacement of hair images
- **Secure Storage**: Images stored securely in Supabase with proper access controls
- **Base64 Upload**: Reliable image upload using base64 encoding

### 💡 Smart Recommendations
- **AI-Generated Advice**: Personalized recommendations based on visual analysis
- **Icon-Based Categories**: Easy-to-understand recommendation categories
- **Actionable Steps**: Specific, implementable hair care advice
- **Professional References**: Links to professional hair care products

### 🎨 Beautiful UI/UX Design
- **Natural & Luxurious Theme**: Soft, earthy color palette with sage green, clay peach, golden honey, deep charcoal, and soft ivory
- **Modern Typography**: Open Sans for body text, Poppins-Bold for headers
- **Consistent Design System**: Unified spacing, shadows, and rounded corners
- **High Contrast**: Excellent readability and accessibility
- **Soft Glows & Shadows**: Elegant visual depth and hierarchy

## 🏗️ Technical Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **React Navigation**: Screen navigation and routing
- **Styled Components**: Component styling and theming
- **Vector Icons**: Comprehensive icon library (Ionicons, MaterialCommunityIcons, FontAwesome5)

### Backend & AI Services
- **Supabase**: Backend-as-a-Service (Database, Authentication, Storage)
- **Together AI**: AI model hosting and inference
- **Llama-Vision-Free**: Vision-capable AI model for single image analysis
- **Llama-3.3-70B-Instruct-Turbo-Free**: Text-based AI model for multi-image analysis

### Database Schema
```sql
-- User profiles with hair information
profiles (
  id, username, full_name, hair_goal, allergies,
  hair_color, hair_condition, hair_concerns_preferences,
  profile_pic_up_url, profile_pic_back_url, profile_pic_left_url, profile_pic_right_url
)

-- AI analysis results
hair_analysis_results (
  id, user_id, analysis_data, image_references, 
  image_url, notes, created_at
)
```

### Storage Structure
- **Bucket**: `user.hair.images`
- **Organization**: `{user_id}/{angle}.jpeg`
- **Security**: Row-level security policies
- **Access**: Public read, authenticated write

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HairApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TOGETHER_AI_API_KEY=your_together_ai_api_key
```

### 4. Supabase Setup
1. Create a new Supabase project
2. Run the database migrations (see `sql/` folder for complete setup):
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     username TEXT UNIQUE,
     full_name TEXT,
     hair_goal TEXT,
     allergies TEXT,
     hair_color TEXT,
     hair_condition TEXT,
     hair_concerns_preferences TEXT,
     profile_pic_up_url TEXT,
     profile_pic_back_url TEXT,
     profile_pic_left_url TEXT,
     profile_pic_right_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create hair_analysis_results table
   CREATE TABLE hair_analysis_results (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     analysis_data JSONB,
     image_references JSONB,
     image_url TEXT,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. Set up storage bucket:
   ```sql
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('user.hair.images', 'user.hair.images', true);

   -- Set up storage policies
   CREATE POLICY "Users can upload their own images" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'user.hair.images' AND auth.uid()::text = (storage.foldername(name))[1]);

   CREATE POLICY "Users can view their own images" ON storage.objects
   FOR SELECT USING (bucket_id = 'user.hair.images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 5. Together AI Setup
1. Sign up for Together AI account
2. Generate API key
3. Add API key to environment variables

### 6. Run the Application
```bash
# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## 📱 App Structure

### Navigation Flow
```
AuthScreen
├── HomeScreen (Dashboard)
│   ├── ProfileScreen
│   ├── AnalysisOptionsScreen
│   │   ├── AnalysisResultScreen (General Analysis)
│   │   └── HomeScreen (Dashboard Update)
│   ├── HairAIScreen
│   ├── MenuScreen
│   └── ProgressTrackerScreen
└── RoutineScreen
```

### Key Screens

#### 🏠 HomeScreen (Dashboard)
- **Purpose**: Main dashboard showing hair analysis results
- **Features**: 
  - Overall hair health score display
  - Color analysis with visual swatches
  - Scalp health assessment
  - AI-generated recommendations
  - Trending hair care recipes
  - Quick analysis trigger
  - Real-time data fetching from database

#### 👤 ProfileScreen
- **Purpose**: User profile management and image upload
- **Features**:
  - Profile information editing
  - Multi-angle image upload (Top, Back, Left, Right)
  - Image preview and replacement
  - Hair goals and preferences
  - Allergies and concerns tracking
  - AI analysis trigger after saving

#### 🔍 AnalysisOptionsScreen
- **Purpose**: Choose analysis type and upload images
- **Features**:
  - General Analysis: Single image + question
  - Dashboard Update: 4 images for comprehensive analysis
  - Image upload interface
  - Question input for general analysis
  - Default navigation to options screen

#### 📊 AnalysisResultScreen
- **Purpose**: Display general analysis results
- **Features**:
  - AI response display
  - Question and answer format
  - Image reference
  - Share and save options

## 🤖 AI Analysis System

### Analysis Types

#### 1. Dashboard Update (4 Images)
- **Model**: `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free`
- **Input**: 4 image URLs + detailed prompt
- **Output**: Structured analysis with 5 sections
- **Use Case**: Comprehensive hair health assessment
- **Parsing**: Intelligent parsing of AI response into structured data

#### 2. General Analysis (1 Image)
- **Model**: `meta-llama/Llama-Vision-Free`
- **Input**: 1 image + user question
- **Output**: Direct answer to specific question
- **Use Case**: Specific hair concerns and advice

### Analysis Sections
1. **Global Hair State Score**: Overall health percentage with justification
2. **Detailed Scalp Analysis**: Scalp condition assessment
3. **Detailed Color Analysis**: Hair color identification and characteristics
4. **Key Observations & Potential Issues**: Specific findings and concerns
5. **Recommendations**: Actionable advice with icon hints

### Color Detection System
- **Automatic Detection**: AI identifies actual hair color from images
- **Professional References**: Maps to professional hair dye colors
- **Visual Swatches**: Displays color with hex codes
- **Color Mapping**: Supports multiple hair colors (Brown, Blonde, Black, Red, etc.)
- **Complex Color Handling**: Parses detailed color descriptions

## 🎨 Design System

### Color Palette
```javascript
const colors = {
  // Primary Colors
  sageGreen: "#9CAF88",      // Natural, calming green
  clayPeach: "#E8B4A0",      // Warm, earthy peach
  goldenHoney: "#D4A574",    // Rich, warm honey
  deepCharcoal: "#2C2C2C",   // Deep, sophisticated charcoal
  softIvory: "#F8F6F3",      // Clean, soft ivory
  
  // Supporting Colors
  warmBeige: "#F5F1ED",      // Warm background
  mutedSage: "#7A8B6A",      // Darker sage for contrast
  softCoral: "#F4C2A1",      // Soft coral accent
  warmGray: "#8B8B8B",       // Neutral gray
  cream: "#FDFBF7",          // Pure cream
};
```

### Typography
- **Headers**: Poppins-Bold for strong, modern headings
- **Body Text**: Open Sans for excellent readability
- **Font Sizes**: Responsive sizing system (xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32)

### Visual Elements
- **Shadows**: Soft, natural shadows for depth
- **Border Radius**: Consistent 12px rounded corners
- **Spacing**: Unified padding and margin system
- **Gradients**: Subtle gradients for visual interest

## 🔧 Configuration & Customization

### Theme System
The app uses a comprehensive theme system in `src/styles/theme.js`:
```javascript
const theme = {
  colors: {
    background: "#F8F6F3",
    primary: "#9CAF88",
    secondary: "#E8B4A0",
    accent: "#D4A574",
    text: "#2C2C2C",
    // ... more colors
  },
  fonts: {
    main: "Open Sans",
    title: "Poppins-Bold",
    body: "Open Sans",
  },
  fontSizes: {
    xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32
  }
  // ... more theme properties
};
```

### AI Prompt Customization
AI prompts can be customized in `src/services/AIService.js`:
- Analysis instructions
- Output format requirements
- Visual analysis criteria
- Recommendation guidelines
- Evidence-based analysis emphasis

### Storage Configuration
Storage settings in `src/services/SupabaseService.js`:
- Bucket configuration
- File naming conventions
- Upload quality settings
- Error handling
- Base64 encoding for reliability

## 🔒 Security & Privacy

### Data Protection
- **User Authentication**: Supabase Auth with email/password
- **Row-Level Security**: Database policies restrict data access
- **Image Privacy**: Images stored per user with access controls
- **API Security**: Environment variables for sensitive keys

### Privacy Features
- **Local Storage**: Sensitive data not stored locally
- **Secure Uploads**: Images uploaded directly to Supabase
- **Session Management**: Automatic session handling
- **Data Retention**: User controls their own data

## 🚀 Recent Updates & Improvements

### ✅ Completed Features
- **UI/UX Redesign**: Complete visual overhaul with natural, luxurious theme
- **AI Analysis Fixes**: Resolved parsing issues and improved response handling
- **Navigation Improvements**: Fixed screen navigation and flow
- **Image Upload**: Reliable base64 upload system
- **Dashboard Integration**: Real-time data fetching and display
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimization**: Memoized data fetching and optimized rendering

### 🔧 Technical Improvements
- **Hybrid AI Approach**: Vision model for single images, text model for multi-images
- **Structured Data Parsing**: Intelligent parsing of AI responses
- **Environment Variables**: Secure credential management
- **Database Optimization**: Efficient queries and data structure
- **Code Organization**: Clean, maintainable codebase

### 🎨 Design Enhancements
- **Natural Color Palette**: Earthy, calming colors
- **Consistent Typography**: Professional font hierarchy
- **Modern UI Elements**: Soft shadows, rounded corners, gradients
- **Accessibility**: High contrast and readable text
- **Responsive Design**: Adapts to different screen sizes

## 🐛 Troubleshooting

### Common Issues

#### Image Upload Failures
- **Check Supabase URL**: Verify environment variables
- **Storage Permissions**: Ensure bucket policies are correct
- **File Size**: Check image file size limits
- **Network**: Verify internet connectivity
- **Base64 Encoding**: Ensure proper image encoding

#### AI Analysis Errors
- **API Key**: Verify Together AI API key is valid
- **Model Availability**: Check model status
- **Image Format**: Ensure images are in supported formats
- **Rate Limits**: Check API usage limits
- **Vision Model Limitation**: Only one image per vision request

#### Navigation Issues
- **Screen Registration**: Verify screens are registered in navigation
- **Dependencies**: Check React Navigation installation
- **Screen Names**: Ensure consistent screen naming

### Debug Mode
Enable debug logging by checking console output:
```javascript
// Debug logs are already implemented throughout the app
console.log('Debug information:', data);
```

## 📈 Performance Optimization

### Image Optimization
- **Compression**: Images compressed before upload
- **Quality Settings**: Configurable image quality
- **Caching**: Expo image caching for better performance
- **Lazy Loading**: Images loaded on demand
- **Base64 Encoding**: Reliable upload method

### AI Response Optimization
- **Caching**: Analysis results cached in database
- **Async Processing**: Non-blocking AI requests
- **Error Handling**: Graceful fallbacks for API failures
- **Loading States**: User feedback during processing
- **Structured Parsing**: Efficient data extraction

## 🔄 Updates & Maintenance

### Regular Maintenance
- **Dependency Updates**: Regular npm updates
- **Security Patches**: Monitor for security vulnerabilities
- **API Monitoring**: Track AI service performance
- **User Feedback**: Monitor app store reviews

### Feature Updates
- **AI Model Updates**: Upgrade to newer AI models
- **UI Improvements**: Enhance user experience
- **New Analysis Types**: Add more hair analysis features
- **Integration**: Add more hair care product integrations

## 📞 Support & Contact

### Documentation
- **API Documentation**: Together AI and Supabase docs
- **React Native Docs**: Official React Native documentation
- **Expo Docs**: Expo platform documentation

### Community
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join development community
- **Stack Overflow**: Technical questions and answers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Together AI**: For providing the AI vision capabilities
- **Supabase**: For the backend infrastructure
- **Expo**: For the development platform
- **React Native Community**: For the amazing ecosystem

---

**Root & Glow** - Transforming hair care through intelligent analysis and personalized recommendations. 🌟

*Last updated: July 2024*
