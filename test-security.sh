#!/bin/bash

# Local Security and Dependency Testing Script
# This simulates the GitHub Actions workflow locally

echo "🔒 Running Local Security and Dependency Tests"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting security and dependency checks..."

# 1. Security Audit
echo ""
print_status "🔍 Running npm audit..."
cd backend
if npm audit --audit-level=moderate; then
    print_success "No security vulnerabilities found"
else
    print_warning "Security vulnerabilities detected - check output above"
fi

# 2. Check for outdated packages
echo ""
print_status "📦 Checking for outdated packages..."
if npm outdated; then
    print_success "All packages are up to date"
else
    print_warning "Outdated packages found - check output above"
fi

# 3. Check for unused dependencies
echo ""
print_status "🧹 Checking for unused dependencies..."
if npx depcheck; then
    print_success "No unused dependencies found"
else
    print_warning "Unused dependencies detected - check output above"
fi

# 4. Dry run of audit fix
echo ""
print_status "🔧 Testing npm audit fix (dry run)..."
if npm audit fix --dry-run; then
    print_success "Audit fix dry run completed"
else
    print_warning "Audit fix issues detected - check output above"
fi

# 5. Check package-lock.json integrity
echo ""
print_status "🔐 Checking package-lock.json integrity..."
if npm ci --dry-run; then
    print_success "Package lock file is valid"
else
    print_error "Package lock file has issues"
fi

cd ..

echo ""
print_status "✅ Local security and dependency tests completed!"
echo ""
print_status "📋 Summary:"
echo "  - Security audit: $(cd backend && npm audit --audit-level=moderate >/dev/null 2>&1 && echo "PASS" || echo "ISSUES FOUND")"
echo "  - Outdated packages: $(cd backend && npm outdated >/dev/null 2>&1 && echo "NONE" || echo "FOUND")"
echo "  - Unused dependencies: $(cd backend && npx depcheck >/dev/null 2>&1 && echo "NONE" || echo "FOUND")"
echo ""
print_status "🚀 This simulates what GitHub Actions will run automatically!"


