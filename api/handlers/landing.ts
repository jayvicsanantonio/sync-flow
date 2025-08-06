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
            /* Geist Design System - Dark Theme */
            --geist-background: #000;
            --geist-foreground: #fff;
            
            /* Gray Scale */
            --gray-1: #111;
            --gray-2: #222;
            --gray-3: #333;
            --gray-4: #444;
            --gray-5: #555;
            --gray-6: #666;
            --gray-7: #777;
            --gray-8: #888;
            --gray-9: #999;
            --gray-10: #aaa;
            --gray-11: #bbb;
            --gray-12: #ccc;
            
            /* Accent Colors */
            --blue: #0070f3;
            --blue-lighter: #3291ff;
            --blue-light: #0761d1;
            --blue-dark: #0051cc;
            
            --green: #0cce6b;
            --green-lighter: #6ccf7f;
            --green-light: #0ac660;
            --green-dark: #06a854;
            
            --red: #ff0000;
            --red-lighter: #f33;
            --red-light: #e00;
            --red-dark: #c00;
            
            --yellow: #f5a623;
            --yellow-lighter: #ffb347;
            --yellow-light: #f39c12;
            --yellow-dark: #e67e22;
            
            /* Spacing */
            --gap-quarter: 4px;
            --gap-half: 8px;
            --gap: 16px;
            --gap-double: 32px;
            --gap-triple: 48px;
            --page-margin: 24px;
            --page-width: 1000px;
            --breakpoint-mobile: 600px;
            --breakpoint-tablet: 960px;
            
            /* Typography */
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            --font-mono: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
            --line-height: 1.5;
            --line-height-large: 1.7;
            
            /* Shadows */
            --shadow-smallest: 0px 2px 4px rgba(0, 0, 0, 0.1);
            --shadow-small: 0px 4px 8px rgba(0, 0, 0, 0.12);
            --shadow-medium: 0px 8px 16px rgba(0, 0, 0, 0.16);
            --shadow-large: 0px 20px 48px rgba(0, 0, 0, 0.2);
            --shadow-hover: 0px 30px 60px rgba(0, 0, 0, 0.12);
            
            /* Borders */
            --radius-small: 5px;
            --radius: 8px;
            --radius-large: 12px;
            --radius-extra: 16px;
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          body {
            font-family: var(--font-sans);
            font-size: 14px;
            background: var(--geist-background);
            color: var(--geist-foreground);
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
            background: var(--geist-background);
          }
          
          .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 50%, rgba(0, 112, 243, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(12, 206, 107, 0.05) 0%, transparent 50%);
            pointer-events: none;
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
            padding: var(--gap-quarter) var(--gap);
            background: rgba(0, 112, 243, 0.1);
            border: 1px solid var(--blue);
            border-radius: 100px;
            font-size: 12px;
            font-weight: 500;
            color: var(--blue);
            margin-bottom: var(--gap-double);
            letter-spacing: 0.5px;
          }
          
          .hero-title {
            font-size: clamp(2.5rem, 8vw, 4.5rem);
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: var(--gap);
            letter-spacing: -0.03em;
          }
          
          .hero-subtitle {
            font-size: clamp(1rem, 2vw, 1.25rem);
            color: var(--gray-9);
            max-width: 640px;
            margin: 0 auto var(--gap-triple);
            line-height: var(--line-height-large);
          }
          
          .hero-cta {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: 12px 24px;
            background: var(--blue);
            color: var(--geist-foreground);
            text-decoration: none;
            border-radius: var(--radius);
            font-size: 14px;
            font-weight: 500;
            transition: all 0.15s ease;
            border: 1px solid var(--blue);
          }
          
          .hero-cta:hover {
            background: var(--blue-dark);
            border-color: var(--blue-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-medium);
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
            padding: var(--gap) var(--gap-double);
            background: var(--gray-1);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius-large);
            display: flex;
            align-items: center;
            gap: var(--gap);
            transition: all 0.2s ease;
          }
          
          .ecosystem-badge:hover {
            transform: translateY(-2px);
            border-color: var(--gray-4);
            background: var(--gray-2);
          }
          
          .ecosystem-icon {
            font-size: 32px;
          }
          
          .ecosystem-text h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: var(--gap-quarter);
          }
          
          .ecosystem-text p {
            color: var(--gray-9);
            font-size: 13px;
          }
          
          .sync-arrow {
            font-size: 24px;
            color: var(--green);
            animation: pulse 2s infinite;
          }
          
          @keyframes bounce-horizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
          }
          
          /* Features Section */
          .features {
            padding: calc(var(--gap-triple) * 2) 0;
            background: var(--geist-background);
            position: relative;
            border-top: 1px solid var(--gray-2);
          }
          
          .section-header {
            text-align: center;
            margin-bottom: calc(var(--gap-triple) * 1.5);
          }
          
          .section-badge {
            display: inline-block;
            padding: var(--gap-quarter) var(--gap-half);
            background: rgba(12, 206, 107, 0.1);
            color: var(--green);
            border-radius: var(--radius-small);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: var(--gap);
          }
          
          .section-title {
            font-size: clamp(2rem, 4vw, 2.5rem);
            font-weight: 700;
            margin-bottom: var(--gap);
            letter-spacing: -0.02em;
          }
          
          .section-subtitle {
            font-size: 16px;
            color: var(--gray-9);
            max-width: 560px;
            margin: 0 auto;
            line-height: var(--line-height-large);
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: var(--gap);
          }
          
          .feature-card {
            padding: var(--gap-double);
            background: var(--gray-1);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius-large);
            transition: all 0.2s ease;
            position: relative;
          }
          
          .feature-card:hover {
            transform: translateY(-2px);
            border-color: var(--gray-4);
            background: var(--gray-2);
          }
          
          .feature-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-2);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius);
            margin-bottom: var(--gap);
            font-size: 24px;
          }
          
          .feature-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--gap-half);
            letter-spacing: -0.01em;
          }
          
          .feature-description {
            color: var(--gray-10);
            line-height: var(--line-height-large);
            font-size: 14px;
          }
          
          /* How It Works Section */
          .how-it-works {
            padding: calc(var(--gap-triple) * 2) 0;
            background: var(--geist-background);
            border-top: 1px solid var(--gray-2);
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
            width: 56px;
            height: 56px;
            margin: 0 auto var(--gap);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--blue);
            border-radius: 50%;
            font-size: 20px;
            font-weight: 600;
            color: var(--geist-foreground);
          }
          
          .step-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--gap-half);
            letter-spacing: -0.01em;
          }
          
          .step-description {
            color: var(--gray-9);
            font-size: 14px;
            line-height: var(--line-height-large);
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
            padding: calc(var(--gap-triple) * 2) 0;
            background: var(--geist-background);
            border-top: 1px solid var(--gray-2);
          }
          
          .transparency-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--gap-double);
            align-items: start;
          }
          
          .current-status {
            padding: var(--gap-double);
            background: var(--gray-1);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius-large);
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
            padding: var(--gap);
            background: var(--gray-2);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius);
            margin-bottom: var(--gap-half);
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
            padding: var(--gap-double);
            background: var(--gray-1);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius-large);
          }
          
          .roadmap h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: var(--gap);
            letter-spacing: -0.01em;
          }
          
          .roadmap-item {
            padding: var(--gap);
            background: var(--gray-2);
            border-radius: var(--radius);
            margin-bottom: var(--gap-half);
            border-left: 2px solid var(--blue);
            transition: all 0.15s ease;
          }
          
          .roadmap-item:hover {
            transform: translateX(4px);
            background: var(--gray-2);
            border-left-color: var(--blue-lighter);
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
            padding: calc(var(--gap-triple) * 2) 0;
            background: var(--geist-background);
            border-top: 1px solid var(--gray-2);
          }
          
          .faq-container {
            max-width: 720px;
            margin: 0 auto;
          }
          
          .faq-item {
            margin-bottom: var(--gap-half);
            border: 1px solid var(--gray-3);
            border-radius: var(--radius);
            overflow: hidden;
            transition: all 0.15s ease;
            background: var(--gray-1);
          }
          
          .faq-item:hover {
            border-color: var(--gray-4);
          }
          
          .faq-question {
            padding: var(--gap);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.15s ease;
            user-select: none;
          }
          
          .faq-question:hover {
            background: var(--gray-2);
          }
          
          .faq-arrow {
            transition: transform 0.2s ease;
            color: var(--gray-9);
            font-size: 12px;
          }
          
          .faq-item.active .faq-arrow {
            transform: rotate(180deg);
          }
          
          .faq-answer {
            padding: 0 var(--gap);
            max-height: 0;
            overflow: hidden;
            transition: all 0.2s ease;
            color: var(--gray-10);
            font-size: 14px;
            line-height: var(--line-height-large);
          }
          
          .faq-item.active .faq-answer {
            padding: 0 var(--gap) var(--gap);
            max-height: 500px;
          }
          
          /* CTA Section */
          .cta-section {
            padding: calc(var(--gap-triple) * 2) 0;
            background: var(--geist-background);
            text-align: center;
            border-top: 1px solid var(--gray-2);
          }
          
          .cta-box {
            max-width: 560px;
            margin: 0 auto;
            padding: var(--gap-triple);
            background: linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%);
            border-radius: var(--radius-extra);
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 112, 243, 0.3);
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
            font-size: 28px;
            font-weight: 700;
            margin-bottom: var(--gap-half);
            color: white;
            letter-spacing: -0.02em;
          }
          
          .cta-description {
            font-size: 16px;
            margin-bottom: var(--gap-double);
            color: rgba(255, 255, 255, 0.85);
            line-height: var(--line-height);
          }
          
          .cta-button {
            display: inline-flex;
            align-items: center;
            gap: var(--gap-half);
            padding: 12px 28px;
            background: white;
            color: var(--blue);
            text-decoration: none;
            border-radius: var(--radius);
            font-size: 14px;
            font-weight: 600;
            transition: all 0.15s ease;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
          }
          
          /* Footer */
          .footer {
            padding: var(--gap-triple) 0;
            background: var(--geist-background);
            border-top: 1px solid var(--gray-2);
            text-align: center;
          }
          
          .footer-text {
            color: var(--gray-8);
            font-size: 13px;
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
                  We never store your tasks—we simply bridge the gap between your existing services.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">
                  <iconify-icon icon="ph:target-bold" width="24"></iconify-icon>
                </div>
                <h3 class="feature-title">Priority & Metadata Preservation</h3>
                <p class="feature-description">
                  Task priorities, URLs, and tags seamlessly transfer between platforms. 
                  Our intelligent mapping ensures no detail gets lost in translation.
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
                  Set it and forget it. Our service automatically refreshes authentication tokens, 
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
                  We only request access to your Tasks, nothing more.
                </p>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <h3 class="step-title">Connect Apple Reminders</h3>
                <p class="step-description">
                  Configure Apple Shortcuts to send your reminders 
                  through our secure webhook endpoints.
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
              <h2 class="section-title">Our Commitment to Honesty</h2>
              <p class="section-subtitle">
                We believe in building trust through complete transparency about our service
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
                  We're committed to being upfront about our current capabilities. 
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
                  sync instantly to Google Tasks. The reverse sync is our top priority and 
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
                  Absolutely. We use OAuth 2.0 for authentication, which means we never see your 
                  Google password. Your tasks are transmitted over encrypted HTTPS connections, 
                  and we don't store your task data—we simply facilitate the sync between services. 
                  Our infrastructure runs on Vercel's secure edge network with enterprise-grade protection.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  How fast is the synchronization?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  For Apple to Google sync, changes appear within 1-2 seconds thanks to our 
                  webhook-based architecture. We're built on Vercel's global edge network, 
                  ensuring low latency regardless of your location. The upcoming Google to Apple 
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
                  Yes! Sync Flow is currently free to use. We believe in making productivity 
                  tools accessible to everyone. As we add more advanced features, we may 
                  introduce optional premium tiers, but the core synchronization functionality 
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
                  task list. Support for multiple accounts and custom list mapping is on our 
                  roadmap. This will allow you to sync different Apple Reminders lists to 
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
              <iconify-icon icon="ph:heart-fill" width="14" style="color: var(--red); vertical-align: -2px;"></iconify-icon>
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
