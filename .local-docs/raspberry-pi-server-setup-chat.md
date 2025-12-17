# Raspberry Pi 4 Server Setup Chat

**Chat ID:** `a51b76ac-e171-4e42-9986-dff052c85d86`  
**Total Messages:** 9  
**Date:** Retrieved from Cursor chat history

---

## Message 1: 👤 USER

I have a raspberry pi 4 model b that I want to setup to act as a server to host a web application that I am building. Walk me through the whole process from adding the os to a micro sd card to getting it running

---

## Message 2: 🤖 ASSISTANT



---

## Message 3: 🤖 ASSISTANT

I'll walk you through the complete process of setting up your Raspberry Pi 4 Model B as a web server. Here's a comprehensive guide:

## **1. Preparing the MicroSD Card with Raspberry Pi OS**

### Download and Install Raspberry Pi Imager
1. Download **Raspberry Pi Imager** from [raspberrypi.com/software](https://www.raspberrypi.com/software/)
2. Install it on your Mac
3. Insert your microSD card (minimum 16GB recommended, 32GB+ ideal) into your computer using a card reader

### Flash the OS
1. Open Raspberry Pi Imager
2. Click **"Choose OS"**
   - Select **"Raspberry Pi OS Lite (64-bit)"** for a server (no desktop GUI), or
   - Select **"Raspberry Pi OS (64-bit)"** if you want a desktop environment
3. Click **"Choose Storage"** and select your microSD card
4. Click the **gear icon** (⚙️) or press `Cmd+Shift+X` to open advanced options:
   - **Enable SSH** (important for remote access)
   - Set a **hostname** (e.g., `raspberrypi.local`)
   - Set **username and password** (default user is usually `pi`)
   - Configure **WiFi** (if not using ethernet)
   - Set your **timezone and locale**
5. Click **"Write"** and wait for the process to complete

## **2. First Boot and Initial Setup**

### Boot the Pi
1. Insert the microSD card into your Raspberry Pi
2. Connect ethernet cable (recommended for initial setup)
3. Connect power supply
4. Wait 1-2 minutes for first boot

### Connect via SSH
```bash
ssh pi@raspberrypi.local
# Or use the IP address: ssh pi@192.168.x.x
```

If you don't know the IP address, you can find it using:
```bash
# On your Mac, scan your network
arp -a
# Or use nmap: nmap -sn 192.168.1.0/24
```

### Update the System
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget vim
```

### Configure the Pi
```bash
sudo raspi-config
```
- Expand filesystem (if not auto-expanded)
- Change hostname if needed
- Set up locale and timezone
- Reboot: `sudo reboot`

## **3. Secure Your Raspberry Pi**

### Change Default Password (if not done already)
```bash
passwd
```

### Set Up a Firewall
```bash
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Optional: Set Up SSH Keys
On your Mac:
```bash
ssh-keygen -t ed25519
ssh-copy-id pi@raspberrypi.local
```

Then disable password authentication:
```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

## **4. Install Web Server Stack**

### Option A: NGINX + Node.js (Modern Stack)

**Install NGINX:**
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

**Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

### Option B: NGINX + Python (Flask/Django)

```bash
sudo apt install nginx python3-pip python3-venv -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Option C: Apache + PHP (Traditional LAMP)

```bash
sudo apt install apache2 php libapache2-mod-php mysql-server -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

## **5. Deploy Your Web Application**

### For Node.js App:

1. **Create app directory:**
```bash
mkdir -p ~/apps/myapp
cd ~/apps/myapp
```

2. **Clone or upload your application**
```bash
git clone https://github.com/yourusername/yourapp.git .
# Or use scp from your Mac: scp -r ./myapp pi@raspberrypi.local:~/apps/
```

3. **Install dependencies:**
```bash
npm install
```

4. **Start with PM2:**
```bash
pm2 start app.js --name myapp
pm2 save
pm2 startup
# Follow the command it gives you
```

5. **Configure NGINX as reverse proxy:**
```bash
sudo nano /etc/nginx/sites-available/myapp
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name raspberrypi.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### For Python App:

```bash
cd ~/apps/myapp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

Create a systemd service:
```bash
sudo nano /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Python Web App
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/apps/myapp
Environment="PATH=/home/pi/apps/myapp/venv/bin"
ExecStart=/home/pi/apps/myapp/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start myapp
sudo systemctl enable myapp
```

Configure NGINX similarly to above, pointing to port 8000.

## **6. Make It Accessible from the Internet (Optional)**

### Option A: Port Forwarding
1. Log into your router
2. Forward port 80 and 443 to your Pi's local IP
3. Use a dynamic DNS service (like No-IP or DuckDNS) for a domain name

### Option B: Use Cloudflare Tunnel (Recommended)
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
cloudflared tunnel login
```

### Option C: Use Tailscale (For Private Access)
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

## **7. Set Up SSL/HTTPS with Let's Encrypt**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
sudo systemctl restart nginx
```

## **8. Monitoring and Maintenance**

### Set up automatic updates:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Monitor system resources:
```bash
sudo apt install htop
htop

# Check temperature
vcgencmd measure_temp
```

### Set up log rotation and monitoring:
```bash
# View logs
sudo journalctl -u nginx -f
pm2 logs myapp
```

## **Quick Reference Commands**

```bash
# Check service status
sudo systemctl status nginx
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart myapp

# View IP address
hostname -I

# Check disk space
df -h

# Check memory
free -h
```

---

**What's your web application built with?** (Node.js, Python, PHP, etc.) I can provide more specific instructions for your stack!

---

## Message 4: 👤 USER

ok i have it set up to the point where I enabled ssh without a password.

I will likely be using angular for the frontend since that is what I am most familiar with.

Here are some high level thoughts about the stack:
frontend: angular
backend: c#? I am open to other backend technologies if there is something that is a little better for my use case and wouldn't be too difficult to pickup coming from c#
db: open to your suggestion
ci/cd: I want to containerize this with docker

The application will be a treasure hunt companion app for a real world treasure hunt that I am creating for my wife.

The application needs to feel modern, support saving and displaying images, ability to use the console to access clues that I will hide there should she think to open the console. The overall gist of it is that she will be the main user, log in, have to solve various puzzles to access clues that help her progress in the treasure hunt.

Ask any questions that you might have to help inform the tech stack and architecture early on

---

## Message 5: 🤖 ASSISTANT



---

## Message 6: 🤖 ASSISTANT

This is such a thoughtful project! I love it. Let me ask some questions to help design the optimal architecture for your treasure hunt app:

## **Clarifying Questions:**

### **Scale & Access:**
1. **Remote access needed?** Will she need to access this from outside your home network (e.g., if clues take her around town), or is this all within WiFi range?
2. **Mobile-first?** Will she primarily use a phone/tablet, or laptop?
3. **Offline capability?** Should any parts work offline?

### **Puzzle Mechanics:**
4. **What types of puzzles** are you envisioning? 
   - Text-based riddles?
   - Image-based puzzles (spot the difference, zoom/enhance)?
   - Code/cipher breaking?
   - Form submissions (enter the answer you found)?
   - Time-gated clues?
   - GPS/location-based unlocks?

5. **Image handling:**
   - Will she **upload** photos (proof of finding something)?
   - Or just **view** images you've pre-loaded?
   - Any image manipulation needed (zoom, annotate, filters)?

### **Progression System:**
6. **Linear or branching?** Must solve puzzle 1 → 2 → 3, or can tackle in any order?
7. **Hint system?** Can she unlock hints if stuck?
8. **Save state?** Should progress persist if she closes browser?

### **Timeline:**
9. **When do you need this ready?** This affects whether we optimize for speed or features.

---

## **My Preliminary Tech Stack Recommendation:**

Based on what you've shared, here's what I'd suggest:

### **Backend: Node.js + TypeScript** ⭐ (Recommended over C#)

**Why:**
- ✅ **TypeScript familiarity** - Same language as Angular, easier mental model
- ✅ **Lightweight** - Much lower memory footprint on Raspberry Pi than .NET
- ✅ **Fast development** - Share types/models between frontend & backend
- ✅ **Excellent Docker support** - Smaller images, faster builds
- ✅ **Rich ecosystem** - Great libraries for auth, images, file handling

**C# Alternative:** ASP.NET Core Minimal APIs would work but:
- ⚠️ Uses more RAM (~200MB vs ~50MB for Node)
- ⚠️ Larger Docker images (~200MB vs ~150MB for Node Alpine)
- ⚠️ Context switching between TypeScript and C#

### **Database: PostgreSQL** ⭐ (or SQLite if you want simpler)

**PostgreSQL** for:
- JSON field support (store puzzle state flexibly)
- Better for image metadata
- Room to grow if you want to reuse this

**SQLite** if:
- You want zero-config simplicity
- Truly single-user with low concurrency
- Easier backup (just copy one file)

### **Image Storage:**
- **Local filesystem** on Pi with path references in DB
- **Or MinIO** (S3-compatible, runs in Docker) if you want more sophisticated handling

### **Proposed Architecture:**

```
┌─────────────────────────────────────────┐
│         Angular Frontend                │
│  (Built & served via NGINX)             │
│  - Puzzle UI components                 │
│  - Console Easter eggs                  │
│  - Image viewer/uploader                │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│      Node.js + TypeScript Backend       │
│  (Express or Fastify)                   │
│  - Auth (JWT)                           │
│  - Puzzle logic & progression           │
│  - Image upload/serving API             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    PostgreSQL Database                  │
│  - User state                           │
│  - Puzzle completion tracking           │
│  - Image metadata                       │
│  - Hint unlock history                  │
└─────────────────────────────────────────┘
```

### **Docker Setup:**
```yaml
# docker-compose.yml
services:
  frontend:
    image: nginx:alpine
    volumes:
      - ./dist/angular-app:/usr/share/nginx/html
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://...
    volumes:
      - ./uploads:/app/uploads
  
  db:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
```

---

## **Alternative Stack (If You Really Want C#):**

```
Frontend: Angular
Backend: ASP.NET Core 8 Minimal APIs
DB: PostgreSQL or SQLite
ORM: Entity Framework Core
Auth: ASP.NET Core Identity + JWT
```

This would work fine, just be aware of the Pi's resource constraints.

---

## **Console Easter Eggs Implementation Ideas:**

```typescript
// In your Angular app, add hidden console commands
if (!window['treasureHunt']) {
  window['treasureHunt'] = {
    hint: () => fetch('/api/hints/console').then(r => r.json()),
    decode: (cipher: string) => /* decoding logic */,
    unlock: (code: string) => /* special unlock */,
    '🗝️': () => console.log('You found the secret key!')
  };
  console.log('%c🎁 Welcome to the Treasure Hunt!', 'font-size: 20px; color: gold;');
  console.log('%cType treasureHunt.hint() for a special clue...', 'color: cyan;');
}
```

---

## **Questions for You:**

**Before I recommend the final architecture, please answer:**

1. **Backend preference:** Node.js (TypeScript) or stick with C#?
2. **Database:** PostgreSQL or SQLite?
3. **Does she need remote access** (outside home network)?
4. **What puzzle types** are you planning? (This affects the data model)
5. **Timeline:** Days? Weeks? Months?

Once you answer these, I can give you:
- Complete Docker setup
- Database schema recommendations
- API endpoint structure
- Angular service architecture
- Deployment guide for the Pi

**What do you think?** Any of this resonate with you, or want to explore different options?

---

## Message 7: 👤 USER

she will need to access this outside of the home network. It will be mobile first. Does not need to support offline.

I might have some sort of flavor of each of those puzzle types. She will view images that are preloaded but I'd like for it to support image manipulation. Linear progression. She can submit a request to receive a hint. Progress should persist if she closes her browser. 

We should prioritize features over speed but don't overcomplicate it.

I'd be ok giving Node.js a shot. PostgreSQL. Yes need remote access outside of home network.

---

## Message 8: 🤖 ASSISTANT



---

## Message 9: 🤖 ASSISTANT

Perfect! Now I have a clear picture. Here's your complete architecture and implementation plan:

## **🏗️ Complete Architecture**

### **Tech Stack (Final):**
```
Frontend:  Angular 17+ (PWA-enabled, mobile-first)
Backend:   Node.js + TypeScript + Express
Database:  PostgreSQL 15
Auth:      JWT tokens + refresh tokens
Images:    Sharp (Node image processing library)
Container: Docker + Docker Compose
Hosting:   Raspberry Pi 4
Remote:    Cloudflare Tunnel (zero-config, secure, free)
```

---

## **📊 Database Schema**

```sql
-- Users table (even though single user, good practice)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Puzzles table (your content)
CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    order_number INTEGER UNIQUE NOT NULL,  -- 1, 2, 3... (linear progression)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    puzzle_type VARCHAR(50) NOT NULL, -- 'riddle', 'cipher', 'image', 'form', 'code'
    puzzle_data JSONB NOT NULL,  -- Flexible: store any puzzle-specific data
    solution_hash VARCHAR(255),  -- Hashed correct answer
    image_url VARCHAR(255),      -- Path to puzzle image if applicable
    clue_text TEXT,              -- The reward/clue they get after solving
    console_easter_egg TEXT,     -- Hidden console message
    created_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    UNIQUE(user_id, puzzle_id)
);

-- Hints table
CREATE TABLE hints (
    id SERIAL PRIMARY KEY,
    puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
    hint_order INTEGER NOT NULL,  -- 1st hint, 2nd hint, etc.
    hint_text TEXT NOT NULL,
    cost INTEGER DEFAULT 0,  -- Optional: "hint coins" mechanic
    UNIQUE(puzzle_id, hint_order)
);

-- Hint requests/usage
CREATE TABLE hint_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id INTEGER REFERENCES puzzles(id) ON DELETE CASCADE,
    hint_id INTEGER REFERENCES hints(id) ON DELETE CASCADE,
    requested_at TIMESTAMP DEFAULT NOW(),
    was_helpful BOOLEAN  -- She can rate if hint helped
);

-- Session/refresh tokens
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Activity log for fun stats at the end
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,  -- 'login', 'puzzle_attempt', 'hint_request'
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## **🔌 API Endpoints Structure**

### **Authentication:**
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Get JWT + refresh token
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Invalidate refresh token
GET    /api/auth/me                - Get current user info
```

### **Puzzles & Progress:**
```
GET    /api/puzzles/current        - Get current unlocked puzzle
GET    /api/puzzles/:id            - Get specific puzzle details
POST   /api/puzzles/:id/attempt    - Submit answer attempt
GET    /api/puzzles/:id/image      - Get puzzle image (with manipulation params)
GET    /api/progress               - Get overall progress summary
```

### **Hints:**
```
GET    /api/puzzles/:id/hints      - Get available hints (locked/unlocked)
POST   /api/puzzles/:id/hints/:hintId/request - Request a hint
```

### **Console Easter Eggs:**
```
GET    /api/console/secret         - Special endpoint for console commands
POST   /api/console/unlock/:code   - Unlock special console features
```

### **Admin (for you to manage content):**
```
POST   /api/admin/puzzles          - Create puzzle
PUT    /api/admin/puzzles/:id      - Update puzzle
GET    /api/admin/stats            - View her progress (from another device)
```

---

## **🐳 Docker Compose Setup**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: treasure_hunt_db
    environment:
      POSTGRES_DB: treasure_hunt
      POSTGRES_USER: treasure_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U treasure_user -d treasure_hunt"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: treasure_hunt_api
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://treasure_user:${DB_PASSWORD}@db:5432/treasure_hunt
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./images:/app/images:ro  # Pre-loaded puzzle images
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # Frontend (NGINX serving Angular build)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: treasure_hunt_frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro  # For SSL certs if using
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  default:
    name: treasure_hunt_network
```

---

## **📱 Angular Project Structure**

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── puzzle.service.ts
│   │   │   │   ├── hint.service.ts
│   │   │   │   └── console-easter-egg.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── puzzle.model.ts
│   │   │       └── progress.model.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── puzzle/
│   │   │   │   ├── puzzle-view/
│   │   │   │   ├── puzzle-riddle/
│   │   │   │   ├── puzzle-cipher/
│   │   │   │   ├── puzzle-image/  (with manipulation controls)
│   │   │   │   └── puzzle-form/
│   │   │   ├── progress/
│   │   │   │   └── progress-tracker/
│   │   │   └── hints/
│   │   │       └── hint-modal/
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── image-viewer/  (zoom, filters, etc.)
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── confetti-animation/  (when puzzle solved!)
│   │   │   └── pipes/
│   │   │
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── sounds/  (optional: success sounds, ambiance)
│   │
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
```

---

## **🔒 Remote Access Setup (Cloudflare Tunnel)**

This is the **easiest and most secure** way to expose your Pi to the internet:

### **Why Cloudflare Tunnel:**
- ✅ No port forwarding needed
- ✅ No dynamic DNS needed
- ✅ Free SSL/HTTPS automatically
- ✅ DDoS protection
- ✅ Works behind any router/firewall
- ✅ Can add authentication layer

### **Setup Steps:**

```bash
# On your Raspberry Pi
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb

# Login to Cloudflare (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create treasure-hunt

# Configure tunnel
nano ~/.cloudflared/config.yml
```

**config.yml:**
```yaml
tunnel: treasure-hunt
credentials-file: /home/pi/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: treasure.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

```bash
# Route your domain to the tunnel
cloudflared tunnel route dns treasure-hunt treasure.yourdomain.com

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**Alternative:** Use Cloudflare's free subdomain: `treasure-hunt.trycloudflare.com`

---

## **🎨 Image Manipulation Features**

Using **Sharp** on backend + **Panzoom** on frontend:

### **Backend endpoint:**
```typescript
GET /api/puzzles/:id/image?brightness=1.2&contrast=1.1&zoom=2&rotate=90
```

### **Frontend controls:**
```typescript
// In your image viewer component
- Zoom in/out (pinch & zoom, slider)
- Brightness/Contrast sliders
- Rotate 90°
- Grayscale/Sepia filters
- Magnifying glass cursor
- Grid overlay (for coordinate puzzles)
```

Libraries:
- **Backend:** `sharp` (fast image processing)
- **Frontend:** `@angular/cdk` for gestures, `panzoom` for zoom/pan

---

## **🎮 Console Easter Egg Implementation**

```typescript
// In your Angular app.component.ts or main.ts

export function initializeConsoleEasterEggs(
  consoleService: ConsoleEasterEggService
) {
  if (typeof window !== 'undefined') {
    // Add custom console commands
    (window as any).treasureHunt = {
      help: () => {
        console.log('%c🗺️ Available Commands:', 'color: gold; font-size: 14px;');
        console.log('%c  treasureHunt.hint()', 'color: cyan;');
        console.log('%c  treasureHunt.decode(cipher)', 'color: cyan;');
        console.log('%c  treasureHunt.map()', 'color: cyan;');
        console.log('%c  treasureHunt.🔑()', 'color: cyan;');
      },
      
      hint: async () => {
        const hint = await consoleService.getConsoleHint().toPromise();
        console.log(`%c💡 ${hint.text}`, 'color: yellow; font-size: 12px;');
        return hint;
      },
      
      decode: (cipher: string) => {
        // Caesar cipher decoder, etc.
        return consoleService.decodeCipher(cipher);
      },
      
      map: () => {
        console.log(`
          %c
              🏴‍☠️
             /│\\
            / │ \\
           🗝️ │  💎
              │
              🎁
          `,
          'color: gold;'
        );
      },
      
      '🔑': async () => {
        const secret = await consoleService.unlockSecret('console_key');
        console.log(`%c🎉 ${secret}`, 'color: magenta; font-weight: bold;');
      }
    };

    // Welcome message
    console.log(
      '%c🎁 Welcome to the Treasure Hunt! 🗺️',
      'font-size: 24px; color: gold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
    );
    console.log(
      '%cType treasureHunt.help() to see available commands...',
      'color: cyan; font-size: 14px;'
    );
    
    // Hide special clue in console
    console.log(
      '%c ',
      'font-size: 0; padding: 50px 100px; background: url(data:image/png;base64,...) no-repeat;'
    );
  }
}
```

---

## **📋 Next Steps - Development Order**

### **Phase 1: Foundation (Week 1)**
1. ✅ Set up project structure
   - Create GitHub repo
   - Initialize Angular project (`ng new treasure-hunt-frontend`)
   - Initialize Node.js backend (`npm init`)
   - Set up Docker Compose
2. ✅ Database setup
   - Create schema
   - Seed initial data
3. ✅ Basic auth system
   - JWT implementation
   - Login/register pages
4. ✅ Deploy to Pi and test locally

### **Phase 2: Core Features (Week 2)**
5. ✅ Puzzle system
   - Create puzzle models/services
   - Implement puzzle types (start with 1-2)
   - Answer validation
6. ✅ Progress tracking
   - Save state to DB
   - Progress bar UI
7. ✅ Image viewer with basic manipulation

### **Phase 3: Polish (Week 3)**
8. ✅ Hint system
9. ✅ Console easter eggs
10. ✅ Mobile UI polish
11. ✅ Animations and celebrations (confetti!)
12. ✅ Admin panel for you

### **Phase 4: Deployment (Week 4)**
13. ✅ Set up Cloudflare Tunnel
14. ✅ SSL/HTTPS
15. ✅ Final testing on her phone
16. ✅ Load all puzzles/content

---

## **🚀 Want me to help you get started?**

Since you're in **Ask Mode**, I can provide you with:

1. **Complete backend boilerplate** (Node.js + TypeScript + Express)
2. **Angular service architecture** with TypeScript models
3. **Docker configuration files**
4. **Database migration scripts**

**To start building, switch to Agent Mode** and I can:
- Create the entire project structure
- Set up all config files
- Initialize Git repo
- Create starter components

**What would you like to tackle first?** I'd suggest:
1. Set up the basic Docker Compose stack (DB + Backend + Frontend skeleton)
2. Get auth working end-to-end
3. Then build out puzzle types one at a time

Let me know and we'll make this treasure hunt amazing! 🗺️✨

---

