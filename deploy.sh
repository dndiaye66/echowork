#!/bin/bash

# EchoWork Deployment Script for Ubuntu 24.04 with Nginx
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Function to install Node.js
install_nodejs() {
    print_info "Installing Node.js 20.x..."
    if ! command_exists node; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    else
        print_info "Node.js already installed: $(node --version)"
    fi
}

# Function to install PostgreSQL
install_postgresql() {
    print_info "Installing PostgreSQL..."
    if ! command_exists psql; then
        apt-get install -y postgresql postgresql-contrib
        systemctl start postgresql
        systemctl enable postgresql
    else
        print_info "PostgreSQL already installed"
    fi
}

# Function to install Nginx
install_nginx() {
    print_info "Installing Nginx..."
    if ! command_exists nginx; then
        apt-get install -y nginx
        systemctl start nginx
        systemctl enable nginx
    else
        print_info "Nginx already installed"
    fi
}

# Function to setup firewall
# setup_firewall() {
#     print_info "Configuring firewall..."
#     ufw --force enable
#     ufw allow OpenSSH
#     ufw allow 'Nginx Full'
#     print_info "Firewall configured"
# }

# Function to create database
setup_database() {
    print_info "Setting up database..."
    
    read -p "Enter database name [echowork_db]: " DB_NAME
    DB_NAME=${DB_NAME:-echowork_db}
    
    read -p "Enter database user [echowork_user]: " DB_USER
    DB_USER=${DB_USER:-echowork_user}
    
    read -sp "Enter database password: " DB_PASS
    echo
    
    sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

    sudo -u postgres psql -d $DB_NAME <<EOF
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

    print_info "Database setup completed"
    
    # Export for later use
    export DB_NAME DB_USER DB_PASS
}

# Function to deploy backend
deploy_backend() {
    print_info "Deploying backend..."
    
    # Create directories
    mkdir -p /var/www/echowork/backend
    mkdir -p /var/log/echowork
    chown -R www-data:www-data /var/log/echowork
    
    # Copy backend files
    cd /var/www/echowork
    if [ -d "backend" ]; then
        cd backend
        
        # Install dependencies
        npm install --production=false
        
        # Create .env file
        cat > .env <<EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
PORT=3000
FRONTEND_URL=http://localhost
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
        
        chmod 600 .env
        
        # Generate Prisma client and run migrations
        npm run prisma:generate
        npx prisma migrate deploy
        
        # Seed database
        print_info "Do you want to seed the database with sample data? (y/n)"
        read -p "> " SEED_DB
        if [ "$SEED_DB" = "y" ] || [ "$SEED_DB" = "Y" ]; then
            npm run prisma:seed
        fi
        
        # Build backend
        npm run build
        
        # Install production dependencies
        npm ci --only=production
        
        print_info "Backend deployed successfully"
    else
        print_error "Backend directory not found"
        exit 1
    fi
}

# Function to deploy frontend
deploy_frontend() {
    print_info "Deploying frontend..."
    
    cd /var/www/echowork
    
    read -p "Enter your domain (e.g., example.com) or leave empty for localhost: " DOMAIN
    DOMAIN=${DOMAIN:-localhost}
    
    # Create .env file
    if [ "$DOMAIN" = "localhost" ]; then
        cat > .env <<EOF
VITE_API_URL=http://localhost/api
EOF
    else
        cat > .env <<EOF
VITE_API_URL=http://${DOMAIN}/api
EOF
    fi
    
    # Install dependencies and build
    npm install
    npm run build
    
    # Copy to web root
    mkdir -p /var/www/echowork/public_html
    cp -r dist/* /var/www/echowork/public_html/
    
    # Set permissions
    chown -R www-data:www-data /var/www/echowork/public_html
    chmod -R 755 /var/www/echowork/public_html
    
    print_info "Frontend deployed successfully"
    
    export DOMAIN
}

# Function to configure Nginx
configure_nginx() {
    print_info "Configuring Nginx..."
    
    # Copy nginx configuration
    if [ -f "/var/www/echowork/nginx.conf" ]; then
        cp /var/www/echowork/nginx.conf /etc/nginx/sites-available/echowork
        
        # Update domain in config
        sed -i "s/your-domain.com/${DOMAIN}/g" /etc/nginx/sites-available/echowork
        sed -i 's|root /var/www/echowork;|root /var/www/echowork/public_html;|g' /etc/nginx/sites-available/echowork
        
        # Enable site
        ln -sf /etc/nginx/sites-available/echowork /etc/nginx/sites-enabled/
        
        # Remove default site
        rm -f /etc/nginx/sites-enabled/default
        
        # Test and reload Nginx
        nginx -t
        systemctl reload nginx
        
        print_info "Nginx configured successfully"
    else
        print_error "Nginx configuration file not found"
        exit 1
    fi
}

# Function to setup systemd service
setup_systemd_service() {
    print_info "Setting up systemd service..."
    
    if [ -f "/var/www/echowork/echowork-backend.service" ]; then
        cp /var/www/echowork/echowork-backend.service /etc/systemd/system/
        
        # Reload systemd
        systemctl daemon-reload
        
        # Start and enable service
        systemctl start echowork-backend
        systemctl enable echowork-backend
        
        print_info "Backend service started successfully"
        systemctl status echowork-backend --no-pager
    else
        print_error "Systemd service file not found"
        exit 1
    fi
}

# Function to setup SSL
setup_ssl() {
    print_info "Do you want to setup SSL with Let's Encrypt? (y/n)"
    read -p "> " SETUP_SSL
    
    if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
        if [ "$DOMAIN" = "localhost" ]; then
            print_warning "Cannot setup SSL for localhost. Please configure a domain first."
            return
        fi
        
        # Install certbot
        apt-get install -y certbot python3-certbot-nginx
        
        read -p "Enter your email address for SSL certificate: " SSL_EMAIL
        
        # Obtain certificate
        certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --email ${SSL_EMAIL} --agree-tos --no-eff-email
        
        # Update backend .env for HTTPS
        cd /var/www/echowork/backend
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|g" .env
        
        # Restart backend
        systemctl restart echowork-backend
        
        # Update frontend .env for HTTPS
        cd /var/www/echowork
        cat > .env <<EOF
VITE_API_URL=https://${DOMAIN}/api
EOF
        
        # Rebuild frontend
        npm run build
        cp -r dist/* /var/www/echowork/public_html/
        
        print_info "SSL configured successfully"
    fi
}

# Main deployment function
main() {
    print_info "Starting EchoWork deployment on Ubuntu 24.04..."
    
    # Check if running as root
    check_root
    
    # Update system
    print_info "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    
    # Install dependencies
    print_info "Installing system dependencies..."
    apt-get install -y build-essential curl wget git openssl
    
    # Install services
    install_nodejs
    install_postgresql
    install_nginx
    
    # Setup firewall
    setup_firewall
    
    # Setup database
    setup_database
    
    # Deploy application
    deploy_backend
    deploy_frontend
    
    # Configure services
    configure_nginx
    setup_systemd_service
    
    # Setup SSL (optional)
    setup_ssl
    
    # Print summary
    echo
    print_info "=========================================="
    print_info "Deployment completed successfully!"
    print_info "=========================================="
    echo
    print_info "Application URLs:"
    if [ "$DOMAIN" = "localhost" ]; then
        print_info "  Frontend: http://localhost"
        print_info "  Backend API: http://localhost/api"
    else
        print_info "  Frontend: http://${DOMAIN}"
        print_info "  Backend API: http://${DOMAIN}/api"
    fi
    echo
    print_info "Service management:"
    print_info "  Status:  sudo systemctl status echowork-backend"
    print_info "  Restart: sudo systemctl restart echowork-backend"
    print_info "  Logs:    sudo journalctl -u echowork-backend -f"
    echo
    print_info "Nginx management:"
    print_info "  Status:  sudo systemctl status nginx"
    print_info "  Reload:  sudo systemctl reload nginx"
    print_info "  Logs:    sudo tail -f /var/log/nginx/error.log"
    echo
    print_info "=========================================="
}

# Run main function
main
