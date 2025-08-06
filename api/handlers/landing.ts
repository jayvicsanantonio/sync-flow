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
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            --bg-primary: #000000;
            --bg-secondary: #050505;
            --bg-card: #0a0a0a;
            --bg-hover: #111111;
            --text-primary: #ffffff;
            --text-secondary: #a1a1aa;
            --text-tertiary: #71717a;
            --border: #27272a;
            --accent: #0070f3;
            --accent-hover: #0051cc;
            --accent-light: rgba(0, 112, 243, 0.1);
            --success: #10b981;
            --success-light: rgba(16, 185, 129, 0.1);
            --warning: #f59e0b;
            --warning-light: rgba(245, 158, 11, 0.1);
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #0070f3 0%, #00d4ff 100%);
            --gradient-3: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
            --max-width: 1200px;
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          body {
            font-family: var(--font-sans);
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
          }
          
          .container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 24px;
          }
          
          /* Hero Section */
          .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            background: radial-gradient(ellipse at top, var(--bg-secondary) 0%, var(--bg-primary) 50%);
          }
          
          .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 50%, rgba(0, 112, 243, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .hero-content {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 80px 0;
          }
          
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 16px;
            background: var(--accent-light);
            border: 1px solid var(--accent);
            border-radius: 100px;
            font-size: 13px;
            font-weight: 500;
            color: var(--accent);
            margin-bottom: 24px;
            animation: pulse-border 2s infinite;
          }
          
          @keyframes pulse-border {
            0%, 100% { border-color: var(--accent); }
            50% { border-color: transparent; }
          }
          
          .hero-title {
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 24px;
            background: linear-gradient(to right, var(--text-primary) 40%, var(--text-secondary));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .hero-subtitle {
            font-size: clamp(1.1rem, 2vw, 1.5rem);
            color: var(--text-secondary);
            max-width: 700px;
            margin: 0 auto 48px;
            line-height: 1.5;
          }
          
          .hero-cta {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 16px 32px;
            background: var(--accent);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s;
            box-shadow: 0 4px 14px 0 rgba(0, 112, 243, 0.4);
          }
          
          .hero-cta:hover {
            background: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(0, 112, 243, 0.5);
          }
          
          .hero-visual {
            margin-top: 64px;
            display: flex;
            justify-content: center;
            gap: 32px;
            flex-wrap: wrap;
          }
          
          .ecosystem-badge {
            padding: 24px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.3s;
          }
          
          .ecosystem-badge:hover {
            transform: translateY(-4px);
            border-color: var(--accent);
            box-shadow: 0 10px 40px rgba(0, 112, 243, 0.1);
          }
          
          .ecosystem-icon {
            font-size: 48px;
          }
          
          .ecosystem-text h3 {
            font-size: 18px;
            margin-bottom: 4px;
          }
          
          .ecosystem-text p {
            color: var(--text-secondary);
            font-size: 14px;
          }
          
          .sync-arrow {
            font-size: 32px;
            color: var(--success);
            animation: bounce-horizontal 2s infinite;
          }
          
          @keyframes bounce-horizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
          }
          
          /* Features Section */
          .features {
            padding: 120px 0;
            background: var(--bg-secondary);
            position: relative;
          }
          
          .section-header {
            text-align: center;
            margin-bottom: 80px;
          }
          
          .section-badge {
            display: inline-block;
            padding: 6px 12px;
            background: var(--success-light);
            color: var(--success);
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          
          .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            margin-bottom: 16px;
          }
          
          .section-subtitle {
            font-size: 18px;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
          }
          
          .feature-card {
            padding: 32px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
          }
          
          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--gradient-2);
            transform: scaleX(0);
            transition: transform 0.3s;
          }
          
          .feature-card:hover {
            transform: translateY(-4px);
            border-color: transparent;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .feature-card:hover::before {
            transform: scaleX(1);
          }
          
          .feature-icon {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--accent-light);
            border-radius: 12px;
            margin-bottom: 24px;
            font-size: 28px;
          }
          
          .feature-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          
          .feature-description {
            color: var(--text-secondary);
            line-height: 1.6;
          }
          
          /* How It Works Section */
          .how-it-works {
            padding: 120px 0;
            background: var(--bg-primary);
          }
          
          .steps-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 48px;
            margin-top: 64px;
          }
          
          .step {
            text-align: center;
            position: relative;
          }
          
          .step-number {
            width: 64px;
            height: 64px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gradient-2);
            border-radius: 50%;
            font-size: 24px;
            font-weight: 700;
            color: white;
          }
          
          .step-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          
          .step-description {
            color: var(--text-secondary);
          }
          
          .step:not(:last-child)::after {
            content: '→';
            position: absolute;
            top: 32px;
            right: -24px;
            color: var(--text-tertiary);
            font-size: 24px;
          }
          
          /* Transparency Section */
          .transparency {
            padding: 120px 0;
            background: var(--bg-secondary);
          }
          
          .transparency-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: start;
          }
          
          .current-status {
            padding: 32px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--warning-light);
            border-radius: 8px;
            margin-bottom: 24px;
          }
          
          .status-icon {
            color: var(--warning);
            font-size: 20px;
          }
          
          .status-text {
            font-size: 14px;
            font-weight: 600;
            color: var(--warning);
          }
          
          .current-status h3 {
            font-size: 24px;
            margin-bottom: 16px;
          }
          
          .current-status p {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 24px;
          }
          
          .sync-direction {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: var(--bg-hover);
            border-radius: 8px;
            margin-bottom: 12px;
          }
          
          .sync-icon {
            font-size: 24px;
          }
          
          .sync-details {
            flex: 1;
          }
          
          .sync-label {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .sync-status {
            font-size: 12px;
            color: var(--text-secondary);
          }
          
          .status-check {
            color: var(--success);
          }
          
          .status-progress {
            color: var(--warning);
          }
          
          .roadmap {
            padding: 32px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
          }
          
          .roadmap h3 {
            font-size: 24px;
            margin-bottom: 24px;
          }
          
          .roadmap-item {
            padding: 20px;
            background: var(--bg-hover);
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 3px solid var(--accent);
            transition: all 0.3s;
          }
          
          .roadmap-item:hover {
            transform: translateX(8px);
            background: var(--accent-light);
          }
          
          .roadmap-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .roadmap-description {
            font-size: 14px;
            color: var(--text-secondary);
          }
          
          /* FAQ Section */
          .faq {
            padding: 120px 0;
            background: var(--bg-primary);
          }
          
          .faq-container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .faq-item {
            margin-bottom: 16px;
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
          }
          
          .faq-item:hover {
            border-color: var(--accent);
          }
          
          .faq-question {
            padding: 24px;
            background: var(--bg-card);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s;
          }
          
          .faq-question:hover {
            background: var(--bg-hover);
          }
          
          .faq-arrow {
            transition: transform 0.3s;
            color: var(--text-secondary);
          }
          
          .faq-item.active .faq-arrow {
            transform: rotate(180deg);
          }
          
          .faq-answer {
            padding: 0 24px;
            background: var(--bg-card);
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s;
            color: var(--text-secondary);
          }
          
          .faq-item.active .faq-answer {
            padding: 0 24px 24px;
            max-height: 500px;
          }
          
          /* CTA Section */
          .cta-section {
            padding: 120px 0;
            background: var(--bg-secondary);
            text-align: center;
          }
          
          .cta-box {
            max-width: 600px;
            margin: 0 auto;
            padding: 64px;
            background: var(--gradient-2);
            border-radius: 24px;
            position: relative;
            overflow: hidden;
          }
          
          .cta-box::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
          
          .cta-content {
            position: relative;
            z-index: 1;
          }
          
          .cta-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 16px;
            color: white;
          }
          
          .cta-description {
            font-size: 18px;
            margin-bottom: 32px;
            color: rgba(255, 255, 255, 0.9);
          }
          
          .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 16px 40px;
            background: white;
            color: var(--accent);
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 700;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          }
          
          /* Footer */
          .footer {
            padding: 48px 0;
            background: var(--bg-primary);
            border-top: 1px solid var(--border);
            text-align: center;
          }
          
          .footer-text {
            color: var(--text-tertiary);
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
                <span>✨</span> Trusted by thousands of productivity enthusiasts
              </div>
              <h1 class="hero-title">Your Tasks, Finally United</h1>
              <p class="hero-subtitle">
                Stop the chaos of managing tasks in two places. Sync Flow seamlessly bridges 
                Apple Reminders and Google Tasks, ensuring you never miss what matters.
              </p>
              <a href="${authUrl}" class="hero-cta">
                <span>🚀</span> Start Syncing Now - It's Free
              </a>
              
              <div class="hero-visual">
                <div class="ecosystem-badge">
                  <div class="ecosystem-icon">🍎</div>
                  <div class="ecosystem-text">
                    <h3>Apple Reminders</h3>
                    <p>Your native iOS tasks</p>
                  </div>
                </div>
                <div class="sync-arrow">⇄</div>
                <div class="ecosystem-badge">
                  <div class="ecosystem-icon">🔷</div>
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
                <div class="feature-icon">⚡</div>
                <h3 class="feature-title">Real-Time Webhook Sync</h3>
                <p class="feature-description">
                  Changes happen instantly. Add a task in Apple Reminders, and it appears in 
                  Google Tasks within seconds. No delays, no manual refreshing—just seamless synchronization.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">🔐</div>
                <h3 class="feature-title">Enterprise-Grade Security</h3>
                <p class="feature-description">
                  Your data is protected with OAuth 2.0 authentication and encrypted connections. 
                  We never store your tasks—we simply bridge the gap between your existing services.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <h3 class="feature-title">Priority & Metadata Preservation</h3>
                <p class="feature-description">
                  Task priorities, URLs, and tags seamlessly transfer between platforms. 
                  Our intelligent mapping ensures no detail gets lost in translation.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">🌐</div>
                <h3 class="feature-title">Global Edge Performance</h3>
                <p class="feature-description">
                  Built on Vercel's Edge Network, Sync Flow delivers lightning-fast performance 
                  no matter where you are. Your tasks sync at the speed of thought.
                </p>
              </div>
              
              <div class="feature-card">
                <div class="feature-icon">🔄</div>
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
                  <span class="status-icon">⚠️</span>
                  <span class="status-text">Current Limitation</span>
                </div>
                <h3>Sync Status Overview</h3>
                <p>
                  We're committed to being upfront about our current capabilities. 
                  Here's exactly what's working and what's coming:
                </p>
                
                <div class="sync-direction">
                  <span class="sync-icon">🍎→🔷</span>
                  <div class="sync-details">
                    <div class="sync-label">Apple to Google (Push-Based)</div>
                    <div class="sync-status">
                      <span class="status-check">✓</span> Fully operational • Real-time sync
                    </div>
                  </div>
                </div>
                
                <div class="sync-direction">
                  <span class="sync-icon">🔷→🍎</span>
                  <div class="sync-details">
                    <div class="sync-label">Google to Apple (Pull-Based)</div>
                    <div class="sync-status">
                      <span class="status-progress">⏳</span> In active development • Coming soon
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
                <h3>🚀 Exciting Features Coming Soon</h3>
                
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
                  <span class="faq-arrow">▼</span>
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
                  <span class="faq-arrow">▼</span>
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
                  <span class="faq-arrow">▼</span>
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
                  <span class="faq-arrow">▼</span>
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
                  <span class="faq-arrow">▼</span>
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
                  <span>🎯</span> Get Started Free
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <div class="container">
            <p class="footer-text">
              © 2024 Sync Flow. Built with ❤️ for productivity enthusiasts everywhere.
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
