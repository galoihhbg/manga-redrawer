# Manga Image Processor

A beautiful, responsive web application that uses Google's Gemini AI to remove text from manga images and naturally refill the removed areas with appropriate backgrounds and patterns.

## Overview

This application provides a clean, professional interface for manga image processing using AI-powered text removal. Users can upload their manga panels, process them with Gemini AI, and download the cleaned versions with text removed.

## Features

### Core Functionality
- **API Key Input**: Secure input field for users to enter their own Gemini API key
  - Show/hide toggle for privacy
  - Local storage persistence
  - Visual feedback for saved state

- **Image Upload**: Intuitive drag-and-drop interface
  - Supports PNG, JPG, and WEBP formats
  - Image preview before processing
  - Easy removal of selected images

- **AI Processing**: Gemini 2.0 Flash integration
  - Analyzes manga images
  - Generates edited versions with text removed
  - Natural background inpainting
  - Loading states with visual feedback

- **Before/After Comparison**: Side-by-side view
  - Original image display
  - Processed image display
  - Responsive grid layout

- **Download**: One-click download
  - Saves processed images as PNG
  - Automatic filename generation

### Design & UX
- **Dark Mode**: Beautiful dark theme with light mode toggle
- **Responsive**: Optimized for mobile, tablet, and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Visual Feedback**: Toast notifications for all actions
- **Loading States**: Clear indicators during processing
- **Error Handling**: User-friendly error messages

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Wouter** for routing
- **TanStack Query** for data fetching and state management
- **Shadcn UI** for beautiful, accessible components
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads

### Backend
- **Express.js** server
- **Google Gemini AI SDK** (@google/genai)
- **Zod** for validation
- **TypeScript** throughout

## Architecture

### Data Flow
1. User enters Gemini API key (stored in localStorage)
2. User uploads manga image via drag-and-drop or click
3. Image is converted to base64 and sent to backend
4. Backend forwards to Gemini AI with processing instructions
5. Gemini generates edited image without text
6. Processed image is returned and displayed
7. User can download the result

### API Endpoints
- `POST /api/process-image`: Processes manga images
  - Request: `{ apiKey, image (base64), mimeType }`
  - Response: `{ success, processedImage (base64), error? }`

## Design Guidelines

The application follows a professional, system-based design approach:
- **Color Palette**: Deep charcoal backgrounds with vibrant purple accents (262° 83% 58%)
- **Typography**: Inter for UI, JetBrains Mono for code/API keys
- **Spacing**: Consistent rhythm using Tailwind spacing scale
- **Components**: Shadcn UI with custom theming
- **Interactions**: Subtle hover states and smooth transitions

## Getting Started

### Prerequisites
- Node.js 20+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Running the App
The application is already configured to run. Simply:
1. Ensure the "Start application" workflow is running
2. Open the preview in your browser
3. Enter your Gemini API key in the interface
4. Upload a manga image and click "Process Image"

### Environment Variables
- None required on the server (users provide their own API keys)

## User Workflow

1. **Setup**: Enter your Gemini API key and click "Save Key"
2. **Upload**: Drag and drop a manga image or click to browse
3. **Process**: Click "Process Image" to start AI processing
4. **Compare**: View before/after comparison
5. **Download**: Click "Download" to save the processed image

## Technical Notes

### Gemini Integration
- Uses `gemini-2.0-flash-preview-image-generation` model
- Processes images with text removal instructions
- Returns edited images as base64 PNG data
- Handles large images (15MB limit)

### Security
- API keys never stored on server
- Keys stored in browser localStorage only
- Transmitted only for processing requests
- No persistent storage of user data

### Limitations
- Processing quality depends on Gemini AI capabilities
- Works best with clear, high-contrast manga panels
- Complex backgrounds may vary in quality
- Requires valid Gemini API key with quota

## Recent Changes

### October 14, 2025
- Initial implementation complete
- Full-stack manga image processor
- Gemini AI integration
- Beautiful responsive UI
- Dark/light theme support
- End-to-end workflow tested

## Future Enhancements

Potential features for future development:
- Batch processing for multiple images
- Image history with persistent storage
- Advanced processing options
- Manual touch-up tools
- Multiple AI model support
- User accounts and preferences
