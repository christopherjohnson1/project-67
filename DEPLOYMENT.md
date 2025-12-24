# Deployment Guide - Raspberry Pi

This guide explains how to deploy the Treasure Hunt application to your Raspberry Pi.

## Prerequisites

Before deploying, ensure your Raspberry Pi has:

1. **Docker and Docker Compose installed**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

2. **Git installed**
   ```bash
   sudo apt-get install git
   ```

3. **Project cloned**
   ```bash
   git clone <your-repository-url> /home/pi/treasure-hunt
   cd /home/pi/treasure-hunt
   ```

## Initial Setup

1. **Clone the repository** (if not already done)
   ```bash
   cd /home/pi
   git clone <your-repository-url> treasure-hunt
   cd treasure-hunt
   ```

2. **Make deployment scripts executable**
   ```bash
   chmod +x deploy.sh quick-deploy.sh
   ```

3. **Create environment file** (if needed)
   ```bash
   # Copy example env files if they exist
   cp backend/.env.example backend/.env
   ```

4. **Run initial deployment**
   ```bash
   ./deploy.sh
   ```

## Deployment Options

### Full Deployment (Recommended)

Use this when:
- First time deploying
- Dependencies have changed (package.json, requirements.txt, etc.)
- Docker configuration changed
- Major updates

```bash
./deploy.sh
```

This script will:
- ✓ Pull latest changes from Git
- ✓ Stop running containers
- ✓ Clean up old images
- ✓ Rebuild containers with latest code
- ✓ Start containers
- ✓ Show status and logs

**Time:** ~10-15 minutes on Raspberry Pi (due to building)

### Quick Deployment

Use this when:
- Only code changes (no dependency changes)
- Minor bug fixes or feature updates
- Need faster deployment

```bash
./quick-deploy.sh
```

This script will:
- ✓ Pull latest changes
- ✓ Restart containers (no rebuild)

**Time:** ~30 seconds

### Skip Rebuild Option

If you've already built the images and just need to update code:

```bash
./deploy.sh --no-rebuild
```

## Accessing the Application

After deployment:

- **Frontend (Web App):** http://your-pi-ip-address or http://localhost
- **Backend API:** http://your-pi-ip-address:3000 or http://localhost:3000
- **Database:** localhost:5432 (internal access only)

### Find Your Raspberry Pi IP Address
```bash
hostname -I
```

## Monitoring

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
# Frontend logs
docker-compose logs -f frontend

# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f db
```

### Check Container Status
```bash
docker-compose ps
```

### Check Container Health
```bash
docker-compose ps --format "table {{.Name}}\t{{.Status}}"
```

## Management Commands

### Stop Application
```bash
docker-compose down
```

### Start Application
```bash
docker-compose up -d
```

### Restart Application
```bash
docker-compose restart
```

### Restart Specific Service
```bash
docker-compose restart frontend
docker-compose restart backend
```

### View Resource Usage
```bash
docker stats
```

## Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker-compose logs [service-name]
   ```

2. Check if ports are in use:
   ```bash
   sudo lsof -i :80    # Frontend
   sudo lsof -i :3000  # Backend
   sudo lsof -i :5432  # Database
   ```

3. Rebuild completely:
   ```bash
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Out of Disk Space

Raspberry Pi can run out of space with Docker images:

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune

# Check disk usage
df -h
docker system df
```

### Application Not Accessible

1. Check if containers are running:
   ```bash
   docker-compose ps
   ```

2. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 3000
   ```

3. Verify network:
   ```bash
   curl http://localhost
   curl http://localhost:3000/api/health
   ```

### Memory Issues on Raspberry Pi

If the Pi runs out of memory during build:

1. Add swap space:
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # Change CONF_SWAPSIZE=100 to CONF_SWAPSIZE=2048
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

2. Build services one at a time:
   ```bash
   docker-compose build backend
   docker-compose build frontend
   docker-compose up -d
   ```

## Automated Deployments

### Set Up Cron Job for Automatic Updates

To automatically pull and deploy updates:

```bash
# Edit crontab
crontab -e

# Add this line to deploy every day at 2 AM
0 2 * * * cd /home/pi/treasure-hunt && ./deploy.sh >> /home/pi/treasure-hunt/deploy.log 2>&1
```

### Set Up Git Webhook

For automatic deployment when you push to GitHub:

1. Install webhook listener:
   ```bash
   sudo apt-get install webhook
   ```

2. Configure webhook (advanced - see GitHub webhook documentation)

## Backup and Restore

### Backup Database

```bash
# Backup
docker-compose exec db pg_dump -U treasurehunt treasurehunt > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U treasurehunt treasurehunt < backup_20231221.sql
```

### Backup User Data

```bash
# Backup uploads folder
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

## Security Considerations

1. **Change default credentials** in production
2. **Set up SSL/HTTPS** using Let's Encrypt
3. **Configure firewall** to limit access
4. **Keep system updated**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```

## Performance Optimization

For Raspberry Pi 3/4:

1. **Enable Docker buildkit** for faster builds:
   ```bash
   echo 'export DOCKER_BUILDKIT=1' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Limit container memory** (if needed):
   Edit `docker-compose.yml` and add memory limits

3. **Use external SSD** instead of SD card for better performance

## Support

For issues or questions:
- Check deployment logs: `cat deploy.log`
- View container logs: `docker-compose logs`
- Check application health: `curl http://localhost:3000/api/health`

## Deployment Log

All deployments are logged to `deploy.log` in the project directory. Check this file for deployment history and troubleshooting.

```bash
# View recent deployments
tail -50 deploy.log

# Search for errors
grep -i error deploy.log
```


