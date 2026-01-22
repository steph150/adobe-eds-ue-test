#!/bin/bash

# AEM Agentic AI Development Environment Setup Script
# This script checks for and installs required dependencies for AEM Edge Delivery Services development

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}*************************************************${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}*************************************************${NC}\n"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_info "Detected macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_info "Detected Linux"
    else
        OS="unknown"
        print_warning "Unknown OS: $OSTYPE"
    fi
}

# Check if Homebrew is installed (macOS)
check_homebrew() {
    if [[ "$OS" == "macos" ]]; then
        if ! command -v brew &> /dev/null; then
            print_warning "Homebrew is not installed"
            print_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            # Add Homebrew to PATH for Apple Silicon Macs
            if [[ $(uname -m) == 'arm64' ]]; then
                echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
                eval "$(/opt/homebrew/bin/brew shellenv)"
            fi
            
            print_success "Homebrew installed successfully"
        else
            print_success "Homebrew is already installed"
        fi
    fi
}

# Check and install bash
check_bash() {
    print_header "Checking bash installation"
    
    if ! command -v bash &> /dev/null; then
        print_error "bash is not installed"
        
        if [[ "$OS" == "macos" ]]; then
            print_info "Installing bash via Homebrew..."
            brew install bash
        elif [[ "$OS" == "linux" ]]; then
            print_info "Installing bash via apt-get..."
            sudo apt-get update && sudo apt-get install -y bash
        fi
        
        print_success "bash installed successfully"
    else
        BASH_VERSION=$(bash --version | head -n1)
        print_success "bash is installed: $BASH_VERSION"
    fi
}

# Check and install git
check_git() {
    print_header "Checking git installation"
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        
        if [[ "$OS" == "macos" ]]; then
            print_info "Installing git via Homebrew..."
            brew install git
        elif [[ "$OS" == "linux" ]]; then
            print_info "Installing git via apt-get..."
            sudo apt-get update && sudo apt-get install -y git
        fi
        
        print_success "git installed successfully"
    else
        GIT_VERSION=$(git --version)
        print_success "git is installed: $GIT_VERSION"
    fi
}

# Check and install GitHub CLI
check_github_cli() {
    print_header "Checking GitHub CLI installation"
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed"
        
        if [[ "$OS" == "macos" ]]; then
            print_info "Installing GitHub CLI via Homebrew..."
            brew install gh
        elif [[ "$OS" == "linux" ]]; then
            print_info "Installing GitHub CLI via apt-get..."
            type -p curl >/dev/null || sudo apt install curl -y
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh -y
        fi
        
        print_success "GitHub CLI installed successfully"
    else
        GH_VERSION=$(gh --version | head -n1)
        print_success "GitHub CLI is installed: $GH_VERSION"
    fi
}

# Install gh-upskill extension
install_gh_upskill() {
    print_header "Installing gh-upskill extension"
    
    # Check if extension is already installed
    if gh extension list | grep -q "trieloff/gh-upskill"; then
        print_success "gh-upskill extension is already installed"
    else
        print_info "Installing gh-upskill extension..."
        gh extension install trieloff/gh-upskill
        print_success "gh-upskill extension installed successfully"
    fi
}

# Load base AGENTS.md from Adobe AEM boilerplate
load_base_agents_md() {
    print_header "Loading base AGENTS.md from Adobe AEM boilerplate"
    
    if [[ -f "AGENTS.md" ]]; then
        print_warning "AGENTS.md already exists"
        print_info "Backing up existing AGENTS.md to AGENTS.md.backup"
        cp AGENTS.md AGENTS.md.backup
    fi
    
    print_info "Downloading AGENTS.md from adobe/aem-boilerplate (agents-md branch)..."
    
    # Download AGENTS.md from the specific branch
    if curl -fsSL "https://raw.githubusercontent.com/adobe/aem-boilerplate/agents-md/AGENTS.md" -o AGENTS.md; then
        print_success "Base AGENTS.md downloaded successfully"
    else
        print_error "Failed to download AGENTS.md"
        
        # Restore backup if download failed and backup exists
        if [[ -f "AGENTS.md.backup" ]]; then
            print_info "Restoring from backup..."
            mv AGENTS.md.backup AGENTS.md
        fi
        
        print_warning "You can manually download it from: https://github.com/adobe/aem-boilerplate/blob/agents-md/AGENTS.md"
        return 1
    fi
    
    # Remove backup if download succeeded
    if [[ -f "AGENTS.md.backup" ]]; then
        rm AGENTS.md.backup
    fi
}

# Load skills from Adobe repository
load_adobe_skills() {
    print_header "Loading skills from Adobe repository" 
    print_info "Loading skills from adobe/helix-website repository..."
    
    # Run gh upskill command
    if gh upskill adobe/helix-website; then
        print_success "Skills loaded successfully from adobe/helix-website"
    else
        print_warning "Failed to load skills. You can manually run: gh upskill adobe/helix-website"
    fi
}

# Load custom skills from agenticai-development repository
load_custom_skills() {
    print_header "Loading custom skills"
    
    # Allow environment variables to override defaults
    local custom_repo="${CUSTOM_SKILLS_REPO:-moarora1/agenticai-development}"
    local custom_branch="${CUSTOM_SKILLS_BRANCH:-agents-skills-update}"
    local custom_skills_path="${CUSTOM_SKILLS_PATH:-.claude/skills}"
    local custom_dest_dir="${CUSTOM_SKILLS_DEST:-.claude/skills}"
    
    # Check if the custom skills loader script exists
    if [[ -f "load-custom-skills.sh" ]]; then
        print_info "Running custom skills loader..."
        print_info "Repository: $custom_repo (branch: $custom_branch)"
        
        if bash load-custom-skills.sh \
            --repo "$custom_repo" \
            --branch "$custom_branch" \
            --skills-path "$custom_skills_path" \
            --dest-dir "$custom_dest_dir"; then
            print_success "Custom skills merged successfully"
        else
            print_warning "Failed to load custom skills. You can manually run: load-custom-skills.sh"
        fi
    else
        print_warning "Custom skills loader not found at load-custom-skills.sh"
        print_info "Skipping custom skills loading"
    fi
}

# Check and install nvm
check_nvm() {
    print_header "Checking nvm (Node Version Manager) installation"
    
    # Check if nvm is already installed
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        print_success "nvm is already installed"
        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        print_info "Installing nvm..."
        
        # Install nvm
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        
        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Add nvm to shell profile
        if [[ "$SHELL" == *"zsh"* ]]; then
            PROFILE_FILE="$HOME/.zshrc"
        else
            PROFILE_FILE="$HOME/.bashrc"
        fi
        
        if ! grep -q 'NVM_DIR' "$PROFILE_FILE" 2>/dev/null; then
            cat >> "$PROFILE_FILE" << 'EOF'

# nvm configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
EOF
            print_info "Added nvm to $PROFILE_FILE"
        fi
        
        print_success "nvm installed successfully"
    fi
    
    # Verify nvm is loaded
    if command -v nvm &> /dev/null; then
        NVM_VERSION=$(nvm --version)
        print_success "nvm version: $NVM_VERSION"
    else
        print_warning "nvm installed but not loaded. Please restart your terminal or run: source ~/.nvm/nvm.sh"
    fi
}

# Check and install Node.js using nvm
check_nodejs() {
    print_header "Checking Node.js installation"
    
    REQUIRED_NODE_MAJOR="22"
    
    # Ensure nvm is loaded
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        print_info "Installing Node.js $REQUIRED_NODE_MAJOR using nvm..."
        
        nvm install 22
        nvm use 22
        nvm alias default 22
        
        print_success "Node.js installed successfully"
    else
        NODE_VERSION=$(node --version | sed 's/v//')
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
        
        print_info "Found Node.js version: v$NODE_VERSION"
        
        if [ "$NODE_MAJOR_VERSION" -ne "$REQUIRED_NODE_MAJOR" ]; then
            print_warning "Node.js version must be $REQUIRED_NODE_MAJOR.x.x. Found: v$NODE_VERSION"
            print_info "Installing Node.js $REQUIRED_NODE_MAJOR using nvm..."
            
            # Install Node.js 22 using nvm
            nvm install 22
            nvm use 22
            nvm alias default 22
            
            # Verify installation
            NODE_VERSION=$(node --version | sed 's/v//')
            print_success "Node.js switched to v$NODE_VERSION"
        else
            print_success "Node.js version is correct: v$NODE_VERSION"
        fi
    fi
}

# Check and install npm
check_npm() {
    print_header "Checking npm installation"
    
    REQUIRED_NPM_MAJOR="9"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        print_info "npm should have been installed with Node.js. Reinstalling Node.js..."
        check_nodejs
    else
        NPM_VERSION=$(npm --version)
        NPM_MAJOR_VERSION=$(echo $NPM_VERSION | cut -d. -f1)
        
        print_info "Found npm version: $NPM_VERSION"
        
        if [ "$NPM_MAJOR_VERSION" -lt "$REQUIRED_NPM_MAJOR" ]; then
            print_warning "npm version must be $REQUIRED_NPM_MAJOR.0.0 or higher. Found: $NPM_VERSION"
            print_info "Upgrading npm..."
            npm install -g npm@latest
            
            # Verify upgrade
            NPM_VERSION=$(npm --version)
            print_success "npm upgraded to $NPM_VERSION"
        else
            print_success "npm version is sufficient: $NPM_VERSION"
        fi
    fi
}

# Install AEM CLI
install_aem_cli() {
    print_header "Installing AEM CLI"
    
    if command -v aem &> /dev/null; then
        print_success "AEM CLI is already installed"
        aem --version
    else
        print_info "Installing @adobe/aem-cli globally..."
        npm install -g @adobe/aem-cli
        print_success "AEM CLI installed successfully"
    fi
}

# Install project dependencies
install_project_dependencies() {
    print_header "Installing project dependencies"
    
    if [ -f "package.json" ]; then
        print_info "Installing npm dependencies..."
        npm install
        print_success "Project dependencies installed successfully"
    else
        print_warning "No package.json found in current directory"
    fi
}

# Verify installation
verify_installation() {
    print_header "Verifying installation"
    
    echo ""
    print_info "Installation Summary:"
    echo "----------------------------------------"
    
    if command -v bash &> /dev/null; then
        echo "bash:    $(bash --version | head -n1)"
    fi
    
    if command -v git &> /dev/null; then
        echo "git:     $(git --version)"
    fi
    
    if command -v gh &> /dev/null; then
        echo "GitHub CLI: $(gh --version | head -n1)"
    fi
    
    # Load nvm for verification
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if command -v nvm &> /dev/null; then
        echo "nvm:     $(nvm --version)"
    fi
    
    if command -v node &> /dev/null; then
        echo "Node.js: $(node --version)"
    fi
    
    if command -v npm &> /dev/null; then
        echo "npm:     $(npm --version)"
    fi
    
    if command -v aem &> /dev/null; then
        echo "AEM CLI: $(aem --version 2>&1 | head -n1)"
    fi
    
    echo "----------------------------------------"
    echo ""
    print_success "All components verified successfully!"
}

# Main execution
main() {
    print_header "AEM Agentic AI Development Environment Setup"
    
    echo "This script will check for and install required dependencies:"
    echo "  - bash (latest)"
    echo "  - git (latest)"
    echo "  - GitHub CLI (latest)"
    echo "  - nvm (Node Version Manager)"
    echo "  - Node.js (22.x.x via nvm)"
    echo "  - npm (9.0.0 or higher)"
    echo "  - AEM CLI (latest)"
    echo "  - Base AGENTS.md (from adobe/aem-boilerplate)"
    echo "  - gh-upskill extension"
    echo "  - Adobe skills (from adobe/helix-website)"
    echo "  - Custom skills (from moarora1/agenticai-development)"
    echo ""
    
    # Detect operating system
    detect_os
    
    # Check/install Homebrew on macOS
    if [[ "$OS" == "macos" ]]; then
        check_homebrew
    fi
    
    # Check and install required software
    check_bash
    check_git
    check_github_cli
    check_nvm
    check_nodejs
    check_npm
    
    # Load base AGENTS.md from Adobe AEM boilerplate
    load_base_agents_md
    
    # Install GitHub CLI extensions
    install_gh_upskill
    
    # Load skills from Adobe repository
    load_adobe_skills
    
    # Load custom skills (merges with Adobe skills)
    load_custom_skills
    
    # Install AEM CLI
    install_aem_cli
    
    # Install project dependencies if package.json exists
    install_project_dependencies
    
    # Verify all installations
    verify_installation
    
    print_header "Setup Complete!"
    print_success "Your AEM Agentic AI development environment is ready!"
    echo ""
    print_info "Next steps:"
    echo "  1. Review loaded skills in .claude/skills/ directory"
    echo "  2. Start the development server: aem up"
    echo "  3. Open http://localhost:3000 in your browser"
    echo "  4. Start developing your AEM Edge Delivery blocks!"
    echo ""
    print_info "Additional commands:"
    echo "  - Reload Adobe skills: gh upskill adobe/helix-website"
    echo "  - Reload custom skills: ./.agents/load-custom-skills.sh"
    echo "  - List skills: ls .claude/skills/"
    echo "  - Discover skills: ./.agents/discover-skills"
    echo ""
}

# Run main function
main
