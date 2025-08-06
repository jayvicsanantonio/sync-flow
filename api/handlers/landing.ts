import type { Context } from 'hono';
import type { GoogleAuthService } from '../services/google-auth';

export function createLandingPageHandler(googleAuthService: GoogleAuthService) {
  return async function handleLandingPage(c: Context) {
    const authUrl = googleAuthService.generateAuthUrl();

    return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Sync Flow - Never lose a task again. Bridge Apple Reminders and Google Tasks with real-time, intelligent synchronization.">
        <meta property="og:title" content="Sync Flow - Your Tasks, Unified Across Platforms">
        <meta property="og:description" content="Stop managing tasks in two places. Sync Flow seamlessly bridges Apple Reminders and Google Tasks with enterprise-grade security.">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <title>Sync Flow - Never Miss a Task Between Apple & Google</title>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            /* BuildUI-inspired Color Palette */
            --background: #fafafa;
            --foreground: #09090b;
            --card: #ffffff;
            --card-foreground: #09090b;
            --muted: #f4f4f5;
            --muted-foreground: #71717a;
            --border: #e4e4e7;
            
            /* Primary Purple Gradient */
            --primary: #8b5cf6;
            --primary-light: #a78bfa;
            --primary-dark: #7c3aed;
            --primary-gradient: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            --primary-gradient-hover: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
            
            /* Accent Colors */
            --accent: #ec4899;
            --accent-light: #f9a8d4;
            --accent-dark: #db2777;
            
            /* Status Colors */
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --info: #3b82f6;
            
            /* Gray Scale */
            --gray-50: #fafafa;
            --gray-100: #f4f4f5;
            --gray-200: #e4e4e7;
            --gray-300: #d4d4d8;
            --gray-400: #a1a1aa;
            --gray-500: #71717a;
            --gray-600: #52525b;
            --gray-700: #3f3f46;
            --gray-800: #27272a;
            --gray-900: #18181b;
            
            /* Spacing */
            --gap-quarter: 4px;
            --gap-half: 8px;
            --gap: 16px;
            --gap-double: 32px;
            --gap-triple: 48px;
            --page-margin: 24px;
            --page-width: 1280px;
            --breakpoint-mobile: 640px;
            --breakpoint-tablet: 1024px;
            
            /* Typography */
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            --font-mono: 'JetBrains Mono', 'SFMono-Regular', 'Consolas', monospace;
            --line-height: 1.5;
            --line-height-large: 1.8;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
            
            /* Borders */
            --radius-sm: 6px;
            --radius: 8px;
            --radius-md: 12px;
            --radius-lg: 16px;
            --radius-xl: 24px;
            --radius-full: 9999px;
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          body {
            font-family: var(--font-sans);
            font-size: 15px;
            background: var(--background);
            color: var(--foreground);
            line-height: var(--line-height-large);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
          }
          
          .container {
            max-width: var(--page-width);
            margin: 0 auto;
            padding: 0 var(--page-margin);
          }
          
          /* Iconify Icons */
          iconify-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
          }
          
          /* Hero Section */
          .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            background: linear-gradient(180deg, var(--background) 0%, var(--gray-50) 100%);
            overflow: hidden;
          }
          
          .hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.06) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
            pointer-events: none;
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
          
          .hero-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: calc(var(--gap-triple) * 2) 0;
          }
          
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: 6px 12px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: var(--radius-full);
            font-size: 13px;
            font-weight: 500;
            color: var(--primary);
            margin-bottom: var(--gap-double);
            letter-spacing: 0.02em;
            backdrop-filter: blur(10px);
          }
          
          .hero-title {
            font-size: clamp(3rem, 7vw, 5rem);
            font-weight: 800;
            line-height: 1.05;
            margin-bottom: var(--gap);
            letter-spacing: -0.04em;
            background: linear-gradient(135deg, var(--foreground) 0%, var(--primary) 50%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hero-subtitle {
            font-size: clamp(1.1rem, 2vw, 1.4rem);
            color: var(--muted-foreground);
            max-width: 680px;
            margin: 0 auto var(--gap-triple);
            line-height: var(--line-height-large);
            font-weight: 400;
          }
          
          .hero-cta {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: 14px 28px;
            background: var(--primary-gradient);
            color: white;
            text-decoration: none;
            border-radius: var(--radius);
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.35);
            position: relative;
            overflow: hidden;
          }
          
          .hero-cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--primary-gradient-hover);
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .hero-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px 0 rgba(139, 92, 246, 0.45);
          }
          
          .hero-cta:hover::before {
            opacity: 1;
          }
          
          .hero-cta > * {
            position: relative;
            z-index: 1;
          }
          
          .hero-visual {
            margin-top: calc(var(--gap-triple) * 1.5);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--gap-double);
            flex-wrap: wrap;
          }
          
          .ecosystem-badge {
            padding: 20px 32px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            gap: var(--gap);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow);
          }
          
          .ecosystem-badge:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-light);
          }
          
          .ecosystem-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            border-radius: var(--radius-md);
            color: var(--primary);
          }
          
          .ecosystem-text h3 {
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 2px;
            color: var(--foreground);
          }
          
          .ecosystem-text p {
            color: var(--muted-foreground);
            font-size: 14px;
          }
          
          .sync-arrow {
            font-size: 24px;
            color: var(--primary);
            animation: pulse-scale 2s infinite;
          }
          
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          
          @keyframes bounce-horizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
          }
          
          /* Features Section */
          .features {
            padding: 80px 0;
            background: var(--gray-50);
            position: relative;
          }
          
          .section-header {
            text-align: center;
            margin-bottom: calc(var(--gap-triple) * 1.5);
          }
          
          .section-badge {
            display: inline-block;
            padding: 4px 10px;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            color: var(--primary);
            border-radius: var(--radius-full);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: var(--gap);
            border: 1px solid rgba(139, 92, 246, 0.2);
          }
          
          .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            margin-bottom: var(--gap);
            letter-spacing: -0.03em;
            color: var(--foreground);
          }
          
          .section-subtitle {
            font-size: 18px;
            color: var(--muted-foreground);
            max-width: 600px;
            margin: 0 auto;
            line-height: var(--line-height-large);
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 24px;
          }
          
          .feature-card {
            padding: 28px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            box-shadow: var(--shadow-sm);
          }
          
          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary-light);
          }
          
          .feature-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            border-radius: var(--radius-md);
            margin-bottom: 20px;
            color: var(--primary);
          }
          
          .feature-title {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.02em;
            color: var(--foreground);
          }
          
          .feature-description {
            color: var(--muted-foreground);
            line-height: 1.7;
            font-size: 15px;
          }
          
          /* How It Works Section */
          .how-it-works {
            padding: 80px 0;
            background: var(--background);
            position: relative;
          }
          
          .steps-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: var(--gap-double);
            margin-top: var(--gap-triple);
          }
          
          .step {
            text-align: center;
            position: relative;
          }
          
          .step-number {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-gradient);
            border-radius: 50%;
            font-size: 22px;
            font-weight: 700;
            color: white;
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.35);
          }
          
          .step-title {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.02em;
            color: var(--foreground);
          }
          
          .step-description {
            color: var(--muted-foreground);
            font-size: 15px;
            line-height: 1.7;
          }
          
          .step:not(:last-child)::after {
            content: '→';
            position: absolute;
            top: 28px;
            right: -24px;
            color: var(--gray-6);
            font-size: 20px;
          }
          
          /* Transparency Section */
          .transparency {
            padding: 80px 0;
            background: var(--gray-50);
          }
          
          .transparency-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--gap-double);
            align-items: start;
          }
          
          .current-status {
            padding: 32px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: var(--gap-half) var(--gap);
            background: rgba(245, 166, 35, 0.1);
            border-radius: var(--radius);
            margin-bottom: var(--gap);
          }
          
          .status-icon {
            color: var(--yellow);
            font-size: 18px;
          }
          
          .status-text {
            font-size: 13px;
            font-weight: 600;
            color: var(--yellow);
            letter-spacing: 0.5px;
          }
          
          .current-status h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: var(--gap);
            letter-spacing: -0.01em;
          }
          
          .current-status p {
            color: var(--gray-10);
            line-height: var(--line-height-large);
            margin-bottom: var(--gap);
            font-size: 14px;
          }
          
          .sync-direction {
            display: flex;
            align-items: center;
            gap: var(--gap);
            padding: 16px;
            background: var(--gray-50);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            margin-bottom: 12px;
            transition: all 0.2s;
          }
          
          .sync-direction:hover {
            background: var(--muted);
          }
          
          .sync-icon {
            font-size: 20px;
          }
          
          .sync-details {
            flex: 1;
          }
          
          .sync-label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: var(--gap-quarter);
          }
          
          .sync-status {
            font-size: 12px;
            color: var(--gray-9);
          }
          
          .status-check {
            color: var(--green);
          }
          
          .status-progress {
            color: var(--yellow);
          }
          
          .roadmap {
            padding: 32px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
          }
          
          .roadmap h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: var(--gap);
            letter-spacing: -0.01em;
          }
          
          .roadmap-item {
            padding: 20px;
            background: var(--gray-50);
            border-radius: var(--radius-md);
            margin-bottom: 12px;
            border-left: 3px solid var(--primary);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .roadmap-item:hover {
            transform: translateX(6px);
            background: var(--muted);
            border-left-color: var(--accent);
          }
          
          .roadmap-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: var(--gap-quarter);
            letter-spacing: -0.01em;
          }
          
          .roadmap-description {
            font-size: 13px;
            color: var(--gray-10);
            line-height: var(--line-height);
          }
          
          /* FAQ Section */
          .faq {
            padding: 80px 0;
            background: var(--background);
          }
          
          .faq-container {
            max-width: 720px;
            margin: 0 auto;
          }
          
          .faq-item {
            margin-bottom: 12px;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--card);
            box-shadow: var(--shadow-sm);
          }
          
          .faq-item:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--primary-light);
          }
          
          .faq-question {
            padding: 20px 24px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s;
            user-select: none;
            color: var(--foreground);
          }
          
          .faq-question:hover {
            background: var(--gray-50);
          }
          
          .faq-arrow {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: var(--muted-foreground);
            font-size: 12px;
          }
          
          .faq-item.active .faq-arrow {
            transform: rotate(180deg);
          }
          
          .faq-answer {
            padding: 0 24px;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: var(--muted-foreground);
            font-size: 15px;
            line-height: 1.7;
          }
          
          .faq-item.active .faq-answer {
            padding: 0 24px 20px;
            max-height: 500px;
          }
          
          /* CTA Section */
          .cta-section {
            padding: 100px 0;
            background: linear-gradient(180deg, var(--gray-50) 0%, var(--background) 100%);
            text-align: center;
          }
          
          .cta-box {
            max-width: 640px;
            margin: 0 auto;
            padding: 60px;
            background: var(--primary-gradient);
            border-radius: var(--radius-xl);
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.4);
          }
          
          .cta-box::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.3; }
          }
          
          .cta-content {
            position: relative;
            z-index: 1;
          }
          
          .cta-title {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 12px;
            color: white;
            letter-spacing: -0.03em;
          }
          
          .cta-description {
            font-size: 18px;
            margin-bottom: 32px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
          }
          
          .cta-button {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: 14px 32px;
            background: white;
            color: var(--primary);
            text-decoration: none;
            border-radius: var(--radius-md);
            font-size: 16px;
            font-weight: 700;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
          
          .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          }
          
          /* Footer */
          .footer {
            padding: 48px 0;
            background: var(--background);
            border-top: 1px solid var(--border);
            text-align: center;
          }
          
          .footer-text {
            color: var(--muted-foreground);
            font-size: 14px;
          }
          
          /* Responsive */
          @media (max-width: 768px) {
            .hero-visual {
              flex-direction: column;
              align-items: center;
            }
            
            .sync-arrow {
              transform: rotate(90deg);
              animation: bounce-vertical 2s infinite;
            }
            
            @keyframes bounce-vertical {
              0%, 100% { transform: rotate(90deg) translateX(0); }
              50% { transform: rotate(90deg) translateX(10px); }
            }
            
            .transparency-content {
              grid-template-columns: 1fr;
            }
            
            .step:not(:last-child)::after {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Hero Section -->
        <section class="hero">
          <div class="container">
            <div class="hero-content">
              <div class="hero-badge">
                <iconify-icon icon="ph:sparkle-fill" width="14"></iconify-icon>
                Trusted by thousands of productivity enthusiasts
              </div>
              <h1 class="hero-title">Your Tasks, Finally United</h1>
              <p class="hero-subtitle">
                Stop the chaos of managing tasks in two places. Sync Flow seamlessly bridges 
                Apple Reminders and Google Tasks, ensuring you never miss what matters.
              </p>
              <a href="${authUrl}" class="hero-cta">
                <iconify-icon icon="ph:rocket-launch-bold" width="16"></iconify-icon>
                Start Syncing Now - It's Free
              </a>
              
              <div class="hero-visual">
                <div class="ecosystem-badge">
                  <div class="ecosystem-icon">
                    <iconify-icon icon="simple-icons:apple" width="32"></iconify-icon>
                  </div>
                  <div class="ecosystem-text">
                    <h3>Apple Reminders</h3>
                    <p>Your native iOS tasks</p>
                  </div>
                </div>
                <div class="sync-arrow">
                  <iconify-icon icon="ph:arrows-left-right-bold" width="24"></iconify-icon>
                </div>
                <div class="ecosystem-badge">
                  <div class="ecosystem-icon">
                    <iconify-icon icon="simple-icons:google" width="32"></iconify-icon>
                  </div>
                  <div class="ecosystem-text">
                    <h3>Google Tasks</h3>
                    <p>Your workspace tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features">
          <div class="container">
            <div class="section-header">
              <span class="section-badge">Features</span>
              <h2 class="section-title">Everything You Need for Perfect Sync</h2>
              <p class="section-subtitle">
                Powerful features designed to make task management effortless across platforms
              </p>
            </div>
            
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:lightning-fill" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Real-Time Webhook Sync</h3>
                <p class="feature-description">
                  Changes happen instantly. Add a task in Apple Reminders, and it appears in 
                  Google Tasks within seconds. No delays, no manual refreshing—just seamless synchronization.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:lock-fill" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Enterprise-Grade Security</h3>
                <p class="feature-description">
                  Your data is protected with OAuth 2.0 authentication and encrypted connections. 
                  Sync Flow never stores your tasks—it simply bridges the gap between your existing services.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:target-bold" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Priority & Metadata Preservation</h3>
                <p class="feature-description">
                  Task priorities, URLs, and tags seamlessly transfer between platforms. 
                  Intelligent mapping ensures no detail gets lost in translation.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:globe-bold" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Global Edge Performance</h3>
                <p class="feature-description">
                  Built on Vercel's Edge Network, Sync Flow delivers lightning-fast performance 
                  no matter where you are. Your tasks sync at the speed of thought.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:arrows-clockwise-bold" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Automatic Token Management</h3>
                <p class="feature-description">
                  Set it and forget it. The service automatically refreshes authentication tokens, 
                  ensuring uninterrupted sync without requiring you to re-login.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="how-it-works">
          <div class="container">
            <div class="section-header">
              <span class="section-badge">How It Works</span>
              <h2 class="section-title">From Setup to Daily Bliss in Minutes</h2>
              <p class="section-subtitle">
                Getting started with Sync Flow is easier than making your morning coffee
              </p>
            </div>
            
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <h3 class="step-title">Authenticate Securely</h3>
                <p class="step-description">
                  Sign in with your Google account using OAuth 2.0. 
                  Sync Flow only requests access to your Tasks, nothing more.
                </p>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <h3 class="step-title">Connect Apple Reminders</h3>
                <p class="step-description">
                  Configure Apple Shortcuts to send your reminders 
                  through secure webhook endpoints.
                </p>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <h3 class="step-title">Automatic Sync Begins</h3>
                <p class="step-description">
                  That's it! Your tasks now flow seamlessly between 
                  both platforms in real-time, automatically.
                </p>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <h3 class="step-title">Focus on What Matters</h3>
                <p class="step-description">
                  Stop worrying about keeping tasks in sync. 
                  Use whichever app you prefer, whenever you want.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Transparency Section -->
        <section class="transparency">
          <div class="container">
            <div class="section-header">
              <span class="section-badge">Transparency</span>
              <h2 class="section-title">A Commitment to Honesty</h2>
              <p class="section-subtitle">
                Building trust through complete transparency about the service
              </p>
            </div>
            
            <div class="transparency-content">
              <div class="current-status">
                <div class="status-badge">
                  <iconify-icon icon="ph:warning-bold" width="18" class="status-icon"></iconify-icon>
                  <span class="status-text">Current Limitation</span>
                </div>
                <h3>Sync Status Overview</h3>
                <p>
                  Full transparency about current capabilities. 
                  Here's exactly what's working and what's coming:
                </p>
                
                <div class="sync-direction">
                  <span class="sync-icon">
                    <iconify-icon icon="simple-icons:apple" width="16" style="margin-right: 4px;"></iconify-icon>
                    <iconify-icon icon="ph:arrow-right-bold" width="12" style="margin: 0 2px;"></iconify-icon>
                    <iconify-icon icon="simple-icons:google" width="16" style="margin-left: 4px;"></iconify-icon>
                  </span>
                  <div class="sync-details">
                    <div class="sync-label">Apple to Google (Push-Based)</div>
                    <div class="sync-status">
                      <iconify-icon icon="ph:check-circle-fill" width="14" class="status-check" style="vertical-align: -2px;"></iconify-icon>
                      Fully operational • Real-time sync
                    </div>
                  </div>
                </div>
                
                <div class="sync-direction">
                  <span class="sync-icon">
                    <iconify-icon icon="simple-icons:google" width="16" style="margin-right: 4px;"></iconify-icon>
                    <iconify-icon icon="ph:arrow-right-bold" width="12" style="margin: 0 2px;"></iconify-icon>
                    <iconify-icon icon="simple-icons:apple" width="16" style="margin-left: 4px;"></iconify-icon>
                  </span>
                  <div class="sync-details">
                    <div class="sync-label">Google to Apple (Pull-Based)</div>
                    <div class="sync-status">
                      <iconify-icon icon="ph:hourglass-medium-fill" width="14" class="status-progress" style="vertical-align: -2px;"></iconify-icon>
                      In active development • Coming soon
                    </div>
                  </div>
                </div>
                
                <p style="margin-top: 24px; font-size: 14px;">
                  <strong>What this means:</strong> Currently, tasks created in Apple Reminders 
                  sync instantly to Google Tasks. The reverse sync is the top priority and 
                  will be released in the coming weeks.
                </p>
              </div>
              
              <div class="roadmap">
                <h3>
                  <iconify-icon icon="ph:rocket-launch-bold" width="20" style="vertical-align: -3px; margin-right: 8px;"></iconify-icon>
                  Exciting Features Coming Soon
                </h3>
                
                <div class="roadmap-item">
                  <div class="roadmap-title">Bidirectional Real-Time Sync</div>
                  <div class="roadmap-description">
                    Complete two-way synchronization with instant updates from both platforms
                  </div>
                </div>
                
                <div class="roadmap-item">
                  <div class="roadmap-title">Smart Conflict Resolution</div>
                  <div class="roadmap-description">
                    Intelligent handling of simultaneous edits with customizable merge strategies
                  </div>
                </div>
                
                <div class="roadmap-item">
                  <div class="roadmap-title">Advanced Filtering & Rules</div>
                  <div class="roadmap-description">
                    Create custom sync rules based on tags, lists, or priority levels
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq">
          <div class="container">
            <div class="section-header">
              <span class="section-badge">FAQ</span>
              <h2 class="section-title">Your Questions, Answered</h2>
              <p class="section-subtitle">
                Everything you need to know about Sync Flow
              </p>
            </div>
            
            <div class="faq-container">
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  Is my data secure with Sync Flow?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Absolutely. Sync Flow uses OAuth 2.0 for authentication, which means your 
                  Google password remains completely private. Tasks are transmitted over encrypted HTTPS connections, 
                  and no task data is stored—the service simply facilitates the sync between platforms. 
                  The infrastructure runs on Vercel's secure edge network with enterprise-grade protection.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  How fast is the synchronization?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  For Apple to Google sync, changes appear within 1-2 seconds thanks to the 
                  webhook-based architecture. Built on Vercel's global edge network, 
                  the service ensures low latency regardless of your location. The upcoming Google to Apple 
                  sync will use intelligent polling to maintain near real-time updates.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  What happens to my existing tasks?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Your existing tasks remain exactly where they are. Sync Flow doesn't delete 
                  or modify your existing tasks without your action. When you create new tasks 
                  or update existing ones, those changes are synchronized. You maintain full 
                  control over your data in both platforms.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  Is Sync Flow free to use?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Yes! Sync Flow is currently free to use. The mission is making productivity 
                  tools accessible to everyone. As more advanced features are added, optional 
                  premium tiers may be introduced, but the core synchronization functionality 
                  will always have a generous free tier.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  Can I sync multiple Google accounts or task lists?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Currently, Sync Flow supports one Google account and syncs with your default 
                  task list. Support for multiple accounts and custom list mapping is on the 
                  roadmap. This will allow syncing different Apple Reminders lists to 
                  specific Google Task lists, giving you granular control over your organization.
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <div class="container">
            <div class="cta-box">
              <div class="cta-content">
                <h2 class="cta-title">Ready to Unite Your Tasks?</h2>
                <p class="cta-description">
                  Join thousands who've already simplified their task management
                </p>
                <a href="${authUrl}" class="cta-button">
                  <iconify-icon icon="ph:target-bold" width="16"></iconify-icon>
                  Get Started Free
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <div class="container">
            <p class="footer-text">
              © 2024 Sync Flow. Built with 
              <iconify-icon icon="ph:heart-fill" width="14" style="color: var(--accent); vertical-align: -2px;"></iconify-icon>
              for productivity enthusiasts everywhere.
            </p>
          </div>
        </footer>

        <script>
          function toggleFaq(element) {
            const faqItem = element.parentElement;
            faqItem.classList.toggle('active');
          }
        </script>
      </body>
    </html>
  `);
  };
}
