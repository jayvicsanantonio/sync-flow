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
        <meta name="description" content="SyncFlow - Never lose a task again. Bridge Apple Reminders and Google Tasks with real-time, intelligent synchronization.">
        <meta property="og:title" content="SyncFlow - Your Tasks, Unified Across Platforms">
        <meta property="og:description" content="Stop managing tasks in two places. SyncFlow seamlessly bridges Apple Reminders and Google Tasks with enterprise-grade security.">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <title>SyncFlow - Never Miss a Task Between Apple & Google</title>
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
          
          /* Hero Section - Simplified & Elegant */
          .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            background: linear-gradient(to bottom, var(--background), rgba(139, 92, 246, 0.02));
            position: relative;
            overflow: hidden;
          }
          
          /* Subtle gradient backdrop */
          .hero::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.08), transparent 50%),
                        radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.08), transparent 50%);
            z-index: 0;
          }
          
          /* Container */
          .hero-container {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: var(--page-width);
            margin: 0 auto;
            padding: 0 var(--page-margin);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
          }
          
          /* Navigation */
          .hero-nav {
            position: absolute;
            top: 24px;
            left: 0;
            right: 0;
            z-index: 10;
            padding: 0 var(--page-margin);
            max-width: var(--page-width);
            margin: 0 auto;
          }
          
          .hero-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 700;
            color: var(--foreground);
          }
          
          .hero-logo-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-gradient);
            border-radius: 8px;
            color: white;
          }
          
          /* Content */
          .hero-content {
            padding: 40px 0;
          }
          
          .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px 6px 16px;
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 50px;
            margin-bottom: 24px;
            font-size: 14px;
            color: var(--muted-foreground);
          }
          
          .hero-badge-accent {
            padding: 2px 8px;
            background: var(--primary);
            color: white;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .hero-title {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.02em;
            margin-bottom: 20px;
            color: var(--foreground);
          }
          
          .hero-gradient-text {
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .hero-subtitle {
            font-size: 1.125rem;
            line-height: 1.7;
            color: var(--muted-foreground);
            margin-bottom: 32px;
            max-width: 480px;
          }
          
          .hero-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-gradient);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.25);
          }
          
          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.35);
          }
          
          .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--card);
            color: var(--foreground);
            text-decoration: none;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s ease;
          }
          
          .btn-secondary:hover {
            background: var(--muted);
            transform: translateY(-1px);
          }
          
          /* Right Visual - Sync Diagram */
          .hero-right {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
          }
          
          .sync-diagram {
            position: relative;
            display: flex;
            align-items: center;
            gap: 60px;
            width: 100%;
            max-width: 600px;
          }
          
          .platform-card {
            flex: 1;
            padding: 32px;
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 20px;
            text-align: center;
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          }
          
          .platform-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
            border-color: var(--primary-light);
          }
          
          .platform-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-50);
            border-radius: 20px;
            font-size: 40px;
          }
          
          .platform-apple .platform-icon {
            background: linear-gradient(135deg, #000 0%, #333 100%);
            color: white;
          }
          
          .platform-google .platform-icon {
            background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
            color: white;
          }
          
          .platform-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
            color: var(--foreground);
          }
          
          .platform-desc {
            font-size: 14px;
            color: var(--muted-foreground);
            margin-bottom: 20px;
          }
          
          .task-list {
            text-align: left;
          }
          
          .task-mini {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: var(--gray-50);
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 13px;
            color: var(--foreground);
            opacity: 0;
            animation: task-fade-in 0.5s ease-out forwards;
          }
          
          .task-mini:nth-child(1) { animation-delay: 0.2s; }
          .task-mini:nth-child(2) { animation-delay: 0.4s; }
          .task-mini:nth-child(3) { animation-delay: 0.6s; }
          
          @keyframes task-fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .task-check {
            width: 16px;
            height: 16px;
            border: 2px solid var(--primary);
            border-radius: 3px;
            flex-shrink: 0;
          }
          
          .task-check.checked {
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
          }
          
          .sync-flow-center {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          
          .sync-badge {
            padding: 12px 20px;
            background: var(--card);
            border: 2px solid var(--primary);
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
            animation: sync-pulse 2s ease-in-out infinite;
          }
          
          @keyframes sync-pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 12px 32px rgba(139, 92, 246, 0.35);
            }
          }
          
          .sync-badge-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-gradient);
            border-radius: 50%;
            color: white;
            animation: rotate-continuous 3s linear infinite;
          }
          
          @keyframes rotate-continuous {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .sync-badge-text {
            font-size: 14px;
            font-weight: 600;
            color: var(--foreground);
          }
          
          .sync-arrows {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            transform: translateY(-50%);
          }
          
          .sync-arrow-line {
            position: absolute;
            top: 0;
            left: 25%;
            right: 25%;
            height: 2px;
            background: linear-gradient(90deg, 
              transparent 0%, 
              var(--primary-light) 20%, 
              var(--primary) 50%, 
              var(--primary-light) 80%, 
              transparent 100%);
            opacity: 0.3;
          }
          
          .sync-particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
          }
          
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary);
            border-radius: 50%;
            top: -1px;
          }
          
          .particle-left {
            animation: particle-left 2s linear infinite;
          }
          
          .particle-right {
            animation: particle-right 2s linear infinite;
          }
          
          @keyframes particle-left {
            from {
              left: 25%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            to {
              left: 75%;
              opacity: 0;
            }
          }
          
          @keyframes particle-right {
            from {
              right: 25%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            to {
              right: 75%;
              opacity: 0;
            }
          }
          
          .particle:nth-child(2) { animation-delay: 0.4s; }
          .particle:nth-child(3) { animation-delay: 0.8s; }
          .particle:nth-child(4) { animation-delay: 1.2s; }
          .particle:nth-child(5) { animation-delay: 1.6s; }
          
          /* Responsive Design - Tablet */
          @media (max-width: 1024px) {
            .hero-container {
              grid-template-columns: 1fr;
              gap: 40px;
              padding-top: 80px;
            }
            
            .hero-content {
              text-align: center;
              max-width: 600px;
              margin: 0 auto;
            }
            
            .hero-subtitle {
              margin-left: auto;
              margin-right: auto;
            }
            
            .hero-actions {
              justify-content: center;
            }
            
            .sync-diagram {
              max-width: 500px;
              gap: 40px;
            }
            
            .platform-card {
              padding: 24px;
            }
            
            .platform-icon {
              width: 60px;
              height: 60px;
              font-size: 30px;
            }
          }
          
          /* Responsive Design - Mobile */
          @media (max-width: 640px) {
            :root {
              --page-margin: 16px;
            }
            
            /* Hero Section Mobile */
            .hero {
              min-height: auto;
              padding: 80px 0 40px;
            }
            
            .hero-nav {
              padding: 0 16px;
            }
            
            .hero-logo {
              font-size: 18px;
            }
            
            .hero-logo-icon {
              width: 32px;
              height: 32px;
            }
            
            .hero-container {
              padding-top: 60px;
            }
            
            .hero-badge {
              font-size: 12px;
              padding: 4px 6px 4px 12px;
            }
            
            .hero-badge-accent {
              font-size: 10px;
              padding: 2px 6px;
            }
            
            .hero-title {
              font-size: 2rem;
              line-height: 1.3;
              margin-bottom: 16px;
            }
            
            .hero-subtitle {
              font-size: 1rem;
              margin-bottom: 24px;
            }
            
            .hero-actions {
              flex-direction: column;
              width: 100%;
              gap: 10px;
            }
            
            .btn-primary,
            .btn-secondary {
              width: 100%;
              justify-content: center;
              padding: 14px 24px;
            }
            
            /* Sync Diagram Mobile */
            .sync-diagram {
              flex-direction: column;
              gap: 30px;
              max-width: 280px;
            }
            
            .platform-card {
              width: 100%;
              padding: 20px;
              border-radius: 16px;
            }
            
            .platform-icon {
              width: 50px;
              height: 50px;
              font-size: 24px;
              border-radius: 12px;
              margin-bottom: 12px;
            }
            
            .platform-name {
              font-size: 16px;
            }
            
            .platform-desc {
              font-size: 12px;
              margin-bottom: 16px;
            }
            
            .task-mini {
              font-size: 12px;
              padding: 6px 10px;
              margin-bottom: 6px;
            }
            
            .task-check {
              width: 14px;
              height: 14px;
            }
            
            /* Sync Flow Center Mobile */
            .sync-flow-center {
              position: relative;
              transform: none;
              left: auto;
              top: auto;
              margin: -15px 0;
              z-index: 10;
            }
            
            .sync-badge {
              padding: 10px 16px;
              font-size: 12px;
            }
            
            .sync-badge-icon {
              width: 24px;
              height: 24px;
            }
            
            .sync-badge-text {
              font-size: 12px;
            }
            
            /* Hide horizontal arrows on mobile */
            .sync-arrows {
              display: none;
            }
            
            /* Add vertical flow indicator */
            .sync-flow-center::before,
            .sync-flow-center::after {
              content: '';
              position: absolute;
              left: 50%;
              width: 2px;
              height: 30px;
              background: linear-gradient(to bottom, transparent, var(--primary-light), transparent);
              transform: translateX(-50%);
            }
            
            .sync-flow-center::before {
              top: -30px;
            }
            
            .sync-flow-center::after {
              bottom: -30px;
            }
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
          
          /* Additional Mobile Responsive Styles */
          @media (max-width: 768px) {
            /* Features Section Mobile */
            .features {
              padding: 60px 0;
            }
            
            .section-header {
              margin-bottom: 40px;
            }
            
            .section-title {
              font-size: 1.75rem;
            }
            
            .section-subtitle {
              font-size: 16px;
              padding: 0 16px;
            }
            
            .features-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .feature-card {
              padding: 24px;
            }
            
            .feature-icon {
              width: 44px;
              height: 44px;
              margin-bottom: 16px;
            }
            
            .feature-title {
              font-size: 18px;
            }
            
            .feature-description {
              font-size: 14px;
            }
            
            /* How It Works Mobile */
            .how-it-works {
              padding: 60px 0;
            }
            
            .steps-container {
              grid-template-columns: 1fr;
              gap: 24px;
              margin-top: 32px;
            }
            
            .step-number {
              width: 50px;
              height: 50px;
              font-size: 20px;
            }
            
            .step-title {
              font-size: 18px;
            }
            
            .step-description {
              font-size: 14px;
              padding: 0 16px;
            }
            
            .step:not(:last-child)::after {
              display: none;
            }
            
            /* Transparency Section Mobile */
            .transparency {
              padding: 60px 0;
            }
            
            .transparency-content {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            
            .current-status,
            .roadmap {
              padding: 24px;
            }
            
            .current-status h3,
            .roadmap h3 {
              font-size: 18px;
            }
            
            .sync-direction {
              padding: 12px;
            }
            
            .sync-label {
              font-size: 13px;
            }
            
            .sync-status {
              font-size: 11px;
            }
            
            .roadmap-item {
              padding: 16px;
            }
            
            .roadmap-title {
              font-size: 14px;
            }
            
            .roadmap-description {
              font-size: 12px;
            }
            
            /* FAQ Mobile */
            .faq {
              padding: 60px 0;
            }
            
            .faq-container {
              padding: 0 16px;
            }
            
            .faq-item {
              margin-bottom: 8px;
            }
            
            .faq-question {
              padding: 16px 20px;
              font-size: 15px;
            }
            
            .faq-answer {
              font-size: 14px;
            }
            
            .faq-item.active .faq-answer {
              padding: 0 20px 16px;
            }
            
            /* CTA Section Mobile */
            .cta-section {
              padding: 60px 0;
            }
            
            .cta-box {
              padding: 40px 24px;
              border-radius: 16px;
              margin: 0 16px;
            }
            
            .cta-title {
              font-size: 28px;
            }
            
            .cta-description {
              font-size: 16px;
              margin-bottom: 24px;
            }
            
            .cta-button {
              padding: 12px 24px;
              font-size: 15px;
            }
            
            /* Footer Mobile */
            .footer {
              padding: 32px 16px;
            }
            
            .footer-text {
              font-size: 13px;
            }
          }
          
          /* Small Mobile Devices */
          @media (max-width: 400px) {
            .features-grid {
              grid-template-columns: 1fr;
            }
            
            .hero-title {
              font-size: 1.75rem;
            }
            
            .section-title {
              font-size: 1.5rem;
            }
            
            .cta-title {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Hero Section - Simplified & Elegant -->
        <section class="hero">
          <!-- Navigation -->
          <nav class="hero-nav">
            <div class="hero-logo">
              <div class="hero-logo-icon">
                <iconify-icon icon="ph:arrows-clockwise-bold" width="20"></iconify-icon>
              </div>
              <span>SyncFlow</span>
            </div>
          </nav>
          
          <!-- Container -->
          <div class="hero-container">
            <!-- Content -->
            <div class="hero-content">
              <div class="hero-badge">
                ⚡ Real-time sync in under 2 seconds
                <span class="hero-badge-accent">FAST</span>
              </div>
              
              <h1 class="hero-title">
                Never lose a task between<br/>
                <span class="hero-gradient-text">Apple & Google</span> again
              </h1>
              
              <p class="hero-subtitle">
                The missing link between Apple Reminders and Google Tasks. 
                Real-time, automatic synchronization that just works.
              </p>
              
              <div class="hero-actions">
                <a href="${authUrl}" class="btn-primary">
                  <iconify-icon icon="ph:rocket-launch-bold" width="16"></iconify-icon>
                  Start Syncing Free
                </a>
                <a href="#how-it-works" class="btn-secondary">
                  <iconify-icon icon="ph:play-circle" width="16"></iconify-icon>
                  See How It Works
                </a>
              </div>
            </div>
            
            <!-- Right Visual - Sync Diagram -->
            <div class="hero-right">
              <div class="sync-diagram">
                <!-- Apple Platform -->
                <div class="platform-card platform-apple">
                  <div class="platform-icon">
                    <iconify-icon icon="simple-icons:apple" width="40"></iconify-icon>
                  </div>
                  <h3 class="platform-name">Apple Reminders</h3>
                  <p class="platform-desc">Native iOS & macOS app</p>
                  <div class="task-list">
                    <div class="task-mini">
                      <div class="task-check checked">
                        <iconify-icon icon="ph:check-bold" width="10"></iconify-icon>
                      </div>
                      <span>Morning workout</span>
                    </div>
                    <div class="task-mini">
                      <div class="task-check"></div>
                      <span>Team meeting notes</span>
                    </div>
                    <div class="task-mini">
                      <div class="task-check"></div>
                      <span>Buy groceries</span>
                    </div>
                  </div>
                </div>
                
                <!-- Sync Flow in Center -->
                <div class="sync-flow-center">
                  <div class="sync-badge">
                    <div class="sync-badge-icon">
                      <iconify-icon icon="ph:arrows-clockwise-bold" width="18"></iconify-icon>
                    </div>
                    <span class="sync-badge-text">SyncFlow</span>
                  </div>
                </div>
                
                <!-- Animated Sync Arrows -->
                <div class="sync-arrows">
                  <div class="sync-arrow-line"></div>
                  <div class="sync-particles">
                    <div class="particle particle-left"></div>
                    <div class="particle particle-left"></div>
                    <div class="particle particle-left"></div>
                    <div class="particle particle-right"></div>
                    <div class="particle particle-right"></div>
                  </div>
                </div>
                
                <!-- Google Platform -->
                <div class="platform-card platform-google">
                  <div class="platform-icon">
                    <iconify-icon icon="simple-icons:google" width="40"></iconify-icon>
                  </div>
                  <h3 class="platform-name">Google Tasks</h3>
                  <p class="platform-desc">Google ecosystem</p>
                  <div class="task-list">
                    <div class="task-mini">
                      <div class="task-check checked">
                        <iconify-icon icon="ph:check-bold" width="10"></iconify-icon>
                      </div>
                      <span>Morning workout</span>
                    </div>
                    <div class="task-mini">
                      <div class="task-check"></div>
                      <span>Team meeting notes</span>
                    </div>
                    <div class="task-mini">
                      <div class="task-check"></div>
                      <span>Buy groceries</span>
                    </div>
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
                  SyncFlow never stores your tasks—it simply bridges the gap between your existing services.
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
                  Built on Vercel's Edge Network, SyncFlow delivers lightning-fast performance 
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
              Getting started with SyncFlow is easier than making your morning coffee
              </p>
            </div>
            
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <h3 class="step-title">Authenticate Securely</h3>
                <p class="step-description">
                  Sign in with your Google account using OAuth 2.0. 
                  SyncFlow only requests access to your Tasks, nothing more.
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
                Everything you need to know about SyncFlow
              </p>
            </div>
            
            <div class="faq-container">
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  Is my data secure with SyncFlow?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Absolutely. SyncFlow uses OAuth 2.0 for authentication, which means your 
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
                  Your existing tasks remain exactly where they are. SyncFlow doesn't delete 
                  or modify your existing tasks without your action. When you create new tasks 
                  or update existing ones, those changes are synchronized. You maintain full 
                  control over your data in both platforms.
                </div>
              </div>
              
              <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(this)">
                  Is SyncFlow free to use?
                  <iconify-icon icon="ph:caret-down-bold" width="12" class="faq-arrow"></iconify-icon>
                </div>
                <div class="faq-answer">
                  Yes! SyncFlow is currently free to use. The mission is making productivity 
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
                  Currently, SyncFlow supports one Google account and syncs with your default 
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
              © 2025 SyncFlow. Built with
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
