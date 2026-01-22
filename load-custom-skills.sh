#!/usr/bin/env bash
set -Eeo pipefail
IFS=$'\n\t'

# Load custom skills from moarora1/agenticai-development repository
# This script merges custom skills with existing Adobe skills

PROGRAM_NAME="load-custom-skills"
VERSION="1.0.0"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log() {
    if [[ -z "${QUIET:-}" ]]; then
        printf '%s\n' "$*" >&2
    fi
}

die() {
    print_error "$*"
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

cleanup() {
    if [[ -n "${_CUSTOM_TMPDIR:-}" && -d "${_CUSTOM_TMPDIR}" ]]; then
        rm -rf "${_CUSTOM_TMPDIR}" || true
    fi
}
trap cleanup EXIT

copy_tree() {
    # $1: src dir, $2: dest dir
    local src="$1" dest="$2"
    if command -v rsync >/dev/null 2>&1; then
        rsync -a "$src/" "$dest/"
    else
        tar -C "$src" -cf - . | tar -C "$dest" -xpf -
    fi
}

three_way_merge_file() {
    # Performs a 3-way merge using git merge-file
    # $1: current file (destination)
    # $2: incoming file (source)
    # $3: base file (common ancestor - empty if new)
    # $4: description for logging
    local current="$1"
    local incoming="$2"
    local base="$3"
    local desc="$4"
    
    local temp_dir
    temp_dir=$(mktemp -d)
    local merged="$temp_dir/merged"
    
    # Copy current to merged (we'll merge into this)
    cp "$current" "$merged"
    
    # Perform 3-way merge
    # git merge-file: merged base incoming
    if git merge-file -p "$merged" "$base" "$incoming" > "$temp_dir/result" 2>/dev/null; then
        # Merge succeeded without conflicts
        if ! diff -q "$current" "$temp_dir/result" >/dev/null 2>&1; then
            cp "$temp_dir/result" "$current"
            log "    Successfully merged $desc"
            rm -rf "$temp_dir"
            return 0
        else
            log "    $desc unchanged (no differences after merge)"
            rm -rf "$temp_dir"
            return 2
        fi
    else
        # Merge has conflicts - try to auto-resolve or use incoming for new content
        if [[ ! -s "$base" ]]; then
            # No base (new content) - accept incoming changes
            cp "$incoming" "$current"
            log "    Added new content to $desc"
            rm -rf "$temp_dir"
            return 0
        else
            # Has conflicts - use a smart merge strategy
            log "    Merge conflict in $desc - using smart resolution"
            
            # Strategy: keep current, append new lines from incoming not in current
            local result="$temp_dir/smart_merged"
            cat "$current" > "$result"
            
            local new_lines=0
            while IFS= read -r line; do
                [[ -z "$line" || "${#line}" -lt 3 ]] && continue
                local pattern
                pattern=$(echo "$line" | sed 's/[[:space:]]\+/ /g' | cut -c1-50)
                if ! grep -qF "$pattern" "$current" 2>/dev/null; then
                    echo "$line" >> "$result"
                    new_lines=$((new_lines + 1))
                fi
            done < "$incoming"
            
            cp "$result" "$current"
            rm -rf "$temp_dir"
            if [[ $new_lines -gt 0 ]]; then
                log "    Smart merged $desc (added $new_lines lines)"
                return 0
            else
                return 2
            fi
        fi
    fi
}

merge_text_file() {
    # $1: source file, $2: destination file, $3: file description
    local src_file="$1" dest_file="$2" file_desc="$3"
    
    # Try to get base version from git
    local temp_dir
    temp_dir=$(mktemp -d)
    local base_file="$temp_dir/base.txt"
    
    # Get relative path for git (handle both absolute and relative paths)
    local rel_path=""
    if git rev-parse --git-dir >/dev/null 2>&1; then
        local git_root
        git_root=$(git rev-parse --show-toplevel 2>/dev/null)
        if [[ -n "$git_root" ]]; then
            # Convert to absolute path first
            local abs_dest_file
            if [[ "$dest_file" = /* ]]; then
                abs_dest_file="$dest_file"
            else
                abs_dest_file="$(pwd)/$dest_file"
            fi
            # Get relative path from git root
            rel_path="${abs_dest_file#$git_root/}"
        else
            rel_path=$(basename "$dest_file")
        fi
    fi
    
    # Try to get base from git merge-base
    if [[ -n "$rel_path" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
        local remote_commit current_commit merge_base
        remote_commit=$(git rev-parse origin/agents-skills-update 2>/dev/null || echo "")
        current_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
        
        if [[ -n "$remote_commit" && -n "$current_commit" ]]; then
            merge_base=$(git merge-base "$current_commit" "$remote_commit" 2>/dev/null || echo "")
            if [[ -n "$merge_base" ]]; then
                git show "$merge_base:$rel_path" > "$base_file" 2>/dev/null || touch "$base_file"
                log "    Using git base for 3-way merge of $file_desc"
            else
                touch "$base_file"
            fi
        else
            touch "$base_file"
        fi
    else
        touch "$base_file"
    fi
    
    # Perform 3-way merge using git merge-file
    local result
    if three_way_merge_file "$dest_file" "$src_file" "$base_file" "$file_desc"; then
        result=$?
        rm -rf "$temp_dir"
        return $result
    else
        rm -rf "$temp_dir"
        return $?
    fi
}

merge_skill_directory() {
    # $1: source skill dir, $2: destination skill dir, $3: skill name
    local src="$1" dest="$2" skill_name="$3"
    
    if [[ ! -d "$dest" ]]; then
        # Destination doesn't exist, just copy
        log "  Installing new skill: $skill_name"
        mkdir -p "$dest"
        copy_tree "$src" "$dest"
    else
        # Destination exists, merge files using 3-way merge
        log "  Merging skill: $skill_name (3-way merge preserving local changes)"
        
        # Process each file in source
        while IFS= read -r -d '' file; do
            local rel_path="${file#"$src"/}"
            local dest_file="$dest/$rel_path"
            
            if [[ -f "$dest_file" ]]; then
                # File exists - check if it's a text file that should be merged
                local file_ext="${file##*.}"
                case "$file_ext" in
                    md|txt|json|yaml|yml|sh|js|ts|css|html|xml)
                        # Text file - perform 3-way merge
                        if ! diff -q "$file" "$dest_file" >/dev/null 2>&1; then
                            log "    3-way merging: $rel_path"
                            merge_text_file "$file" "$dest_file" "$rel_path"
                        else
                            log "    Skipping $rel_path (identical)"
                        fi
                        ;;
                    *)
                        # Binary or unknown file - skip to preserve existing
                        log "    Skipping existing file: $rel_path (binary)"
                        ;;
                esac
            else
                # File doesn't exist - copy it
                log "    Adding new file: $rel_path"
                mkdir -p "$(dirname "$dest_file")"
                cp "$file" "$dest_file"
            fi
        done < <(find "$src" -type f -print0)
    fi
}

discover_and_merge_skills() {
    # $1: source skills directory, $2: destination skills directory
    local src_skills_dir="$1"
    local dest_skills_dir="$2"
    
    if [[ ! -d "$src_skills_dir" ]]; then
        print_warning "No skills directory found in custom repository"
        return 1
    fi
    
    local skill_count=0
    
    # Find all skill directories (those containing SKILL.md)
    while IFS= read -r -d '' skill_file; do
        local skill_dir skill_name
        skill_dir=$(dirname "$skill_file")
        skill_name=$(basename "$skill_dir")
        
        merge_skill_directory "$skill_dir" "$dest_skills_dir/$skill_name" "$skill_name"
        skill_count=$((skill_count + 1))
    done < <(find "$src_skills_dir" -type f -name 'SKILL.md' -print0)
    
    if [[ $skill_count -eq 0 ]]; then
        print_warning "No SKILL.md files found in custom repository"
        return 1
    fi
    
    print_success "Merged $skill_count custom skill(s)"
    return 0
}

generate_discover_skills() {
    cat <<'SCRIPT'
#!/usr/bin/env bash
set -Eo pipefail
IFS=$'\n\t'

# Discover available skills in both project and global directories
# Usage: .agents/discover-skills

PROJECT_SKILLS_DIR=".claude/skills"
GLOBAL_SKILLS_DIR="$HOME/.claude/skills"

process_skills_directory() {
  local skills_dir="$1"
  local location_label="$2"

  if [[ ! -d "$skills_dir" ]]; then
    return 0
  fi

  local count=0
  # Count skills first
  while IFS= read -r -d '' skill_file; do
    count=$((count + 1))
  done < <(find "$skills_dir" -type f -name 'SKILL.md' -print0)

  if [[ $count -eq 0 ]]; then
    return 0
  fi

  echo "$location_label ($count skill(s)):"
  # Generate underline matching label length
  local len=${#location_label}
  if [[ $len -gt 0 ]]; then
    local underline=""
    for ((i=0; i<len; i++)); do
      underline+="="
    done
    echo "$underline"
  fi
  echo ""

  # Iterate SKILL.md files robustly (handles spaces)
  while IFS= read -r -d '' skill_file; do
    skill_dir=$(dirname "$skill_file")
    skill_name=$(basename "$skill_dir")

    # Check for YAML frontmatter
    if head -n 1 "$skill_file" | grep -q "^---$"; then
      # Extract lines between first pair of --- delimiters
      frontmatter=$(awk 'BEGIN{inside=0; c=0} /^---$/ {inside=!inside; if(++c==3) exit} inside==1 {print}' "$skill_file")
      name=$(printf '%s\n' "$frontmatter" | awk -F': *' '/^name:/ {sub(/^name: */,"",$0); print substr($0, index($0,$2))}' 2>/dev/null)
      description=$(printf '%s\n' "$frontmatter" | awk -F': *' '/^description:/ {sub(/^description: */,"",$0); print substr($0, index($0,$2))}' 2>/dev/null)

      echo "Skill: ${name:-$skill_name}"
      echo "Path: $skill_file"
      if [[ -n "$description" ]]; then
        echo "Description: $description"
      fi
    else
      echo "Skill: $skill_name"
      echo "Path: $skill_file"
      echo "Description:"
      head -n 5 "$skill_file"
    fi

    echo ""
    echo "---"
    echo ""
  done < <(find "$skills_dir" -type f -name 'SKILL.md' -print0)
}

echo "Available Skills:"
echo "=================="
echo ""

# Check project skills
process_skills_directory "$PROJECT_SKILLS_DIR" "Project Skills (.claude/skills)"

# Check global skills
process_skills_directory "$GLOBAL_SKILLS_DIR" "Personal Skills (~/.claude/skills)"

# If no skills found at all
if [[ ! -d "$PROJECT_SKILLS_DIR" && ! -d "$GLOBAL_SKILLS_DIR" ]]; then
  echo "No skills directories found."
  echo "- Project skills: $PROJECT_SKILLS_DIR"
  echo "- Personal skills: $GLOBAL_SKILLS_DIR"
fi
SCRIPT
}

insert_or_replace_block() {
    # $1: target file
    # $2: start marker
    # $3: end marker
    # stdin: block content (without markers)
    local file="$1"; shift
    local start_marker="$1"; shift
    local end_marker="$1"; shift

    local block tmp blockfile
    block=$(cat)

    if [[ ! -f "$file" ]]; then
        printf '%s\n\n%s\n%s\n%s\n' "# AGENTS.md" "$start_marker" "$block" "$end_marker" >"$file"
        return 0
    fi

    if grep -qF "$start_marker" "$file" && grep -qF "$end_marker" "$file"; then
        tmp=$(mktemp)
        blockfile=$(mktemp)
        printf '%s\n' "$block" >"$blockfile"
        awk -v start="$start_marker" -v end="$end_marker" -v fblock="$blockfile" '
            BEGIN{skip=0}
            $0 ~ start {
                print $0
                # print replacement content
                cmd = "cat " fblock
                while ((cmd | getline line) > 0) print line
                close(cmd)
                skip=1
                next
            }
            $0 ~ end && skip==1 { print $0; skip=0; next }
            skip==1 { next }
            { print $0 }
        ' "$file" >"$tmp"
        mv "$tmp" "$file"
        rm -f "$blockfile"
    else
        {
            printf '\n%s\n' "$start_marker"
            printf '%s\n' "$block"
            printf '%s\n' "$end_marker"
        } >>"$file"
    fi
}

merge_agents_md() {
    # $1: source AGENTS.md path
    # $2: destination AGENTS.md path (default: AGENTS.md)
    local src_agents="$1"
    local dest_agents="${2:-AGENTS.md}"
    
    if [[ ! -f "$src_agents" ]]; then
        print_warning "AGENTS.md not found in custom repository"
        return 1
    fi
    
    print_info "Performing 3-way merge on AGENTS.md sections..."
    
    # If destination doesn't exist, copy entire source file
    if [[ ! -f "$dest_agents" ]]; then
        print_info "Creating new AGENTS.md from custom repository"
        cp "$src_agents" "$dest_agents"
        print_success "Created AGENTS.md"
        return 0
    fi
    
    local sections_merged=0
    local sections_skipped=0
    local temp_dir
    temp_dir=$(mktemp -d)
    
    # Create a base version (empty for now - could be from git history)
    local base_agents="$temp_dir/base_AGENTS.md"
    
    # Try to get the common ancestor from git
    if git rev-parse --git-dir >/dev/null 2>&1; then
        # Get merge-base with remote
        local remote_commit
        remote_commit=$(git rev-parse origin/agents-skills-update 2>/dev/null || echo "")
        local current_commit
        current_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
        
        if [[ -n "$remote_commit" && -n "$current_commit" ]]; then
            local merge_base
            merge_base=$(git merge-base "$current_commit" "$remote_commit" 2>/dev/null || echo "")
            
            if [[ -n "$merge_base" ]]; then
                git show "$merge_base:AGENTS.md" > "$base_agents" 2>/dev/null || touch "$base_agents"
                print_info "Using git merge-base for 3-way merge"
            else
                touch "$base_agents"
            fi
        else
            touch "$base_agents"
        fi
    else
        touch "$base_agents"
    fi
    
    # Extract all level 2 headings (## ) from source file
    local src_sections
    src_sections=$(grep '^## ' "$src_agents" | sed 's/^## //')
    
    if [[ -z "$src_sections" ]]; then
        print_warning "No sections (## headings) found in source AGENTS.md"
        rm -rf "$temp_dir"
        return 1
    fi
    
    print_info "Found $(echo "$src_sections" | wc -l | tr -d ' ') sections in source AGENTS.md"
    
    # Also get sections from destination to handle deletions
    local dest_sections
    dest_sections=$(grep '^## ' "$dest_agents" | sed 's/^## //' || echo "")
    
    # Merge each section using 3-way merge
    local all_sections
    all_sections=$(printf '%s\n%s' "$src_sections" "$dest_sections" | sort -u)
    
    while IFS= read -r section_name; do
        [[ -z "$section_name" ]] && continue
        
        # Extract section content from source
        local src_section_file="$temp_dir/src_${section_name// /_}.txt"
        awk -v section="$section_name" '
            $0 == "## " section {flag=1; print; next}
            /^## / && flag {exit}
            flag {print}
        ' "$src_agents" > "$src_section_file"
        
        # Extract section from destination
        local dest_section_file="$temp_dir/dest_${section_name// /_}.txt"
        awk -v section="$section_name" '
            $0 == "## " section {flag=1; print; next}
            /^## / && flag {exit}
            flag {print}
        ' "$dest_agents" > "$dest_section_file"
        
        # Extract section from base
        local base_section_file="$temp_dir/base_${section_name// /_}.txt"
        if [[ -f "$base_agents" && -s "$base_agents" ]]; then
            awk -v section="$section_name" '
                $0 == "## " section {flag=1; print; next}
                /^## / && flag {exit}
                flag {print}
            ' "$base_agents" > "$base_section_file"
        else
            touch "$base_section_file"
        fi
        
        # Determine merge strategy
        if [[ ! -s "$dest_section_file" && -s "$src_section_file" ]]; then
            # New section in source - add it
            print_info "  New section: '$section_name' - adding to AGENTS.md"
            
            local temp_file
            temp_file=$(mktemp)
            local inserted=0
            
            while IFS= read -r line || [[ -n "$line" ]]; do
                if [[ "$inserted" -eq 0 && "$line" =~ ^\<\!-- ]]; then
                    printf '\n## %s\n' "$section_name" >> "$temp_file"
                    tail -n +2 "$src_section_file" >> "$temp_file"
                    echo "" >> "$temp_file"
                    inserted=1
                fi
                echo "$line" >> "$temp_file"
            done < "$dest_agents"
            
            if [[ "$inserted" -eq 0 ]]; then
                {
                    printf '\n## %s\n' "$section_name"
                    tail -n +2 "$src_section_file"
                } >> "$temp_file"
            fi
            
            mv "$temp_file" "$dest_agents"
            sections_merged=$((sections_merged + 1))
            
        elif [[ -s "$dest_section_file" && ! -s "$src_section_file" ]]; then
            # Section removed in source - keep destination (preserve local)
            log "  Keeping local section: '$section_name' (removed in source)"
            sections_skipped=$((sections_skipped + 1))
            
        elif [[ -s "$dest_section_file" && -s "$src_section_file" ]]; then
            # Section exists in both - perform 3-way merge
            if ! diff -q "$src_section_file" "$dest_section_file" >/dev/null 2>&1; then
                print_info "  3-way merging section: '$section_name'"
                
                # Perform 3-way merge on section
                local merged_section="$temp_dir/merged_${section_name// /_}.txt"
                cp "$dest_section_file" "$merged_section"
                
                if three_way_merge_file "$merged_section" "$src_section_file" "$base_section_file" "$section_name"; then
                    # Replace section in destination with merged content
                    local temp_file
                    temp_file=$(mktemp)
                    
                    awk -v section="$section_name" -v merged_file="$merged_section" '
                        BEGIN {skip=0; replaced=0}
                        $0 == "## " section {
                            while ((getline line < merged_file) > 0) print line
                            close(merged_file)
                            skip=1
                            replaced=1
                            next
                        }
                        /^## / && skip {skip=0}
                        !skip {print}
                    ' "$dest_agents" > "$temp_file"
                    
                    mv "$temp_file" "$dest_agents"
                    print_success "  Merged section: '$section_name'"
                    sections_merged=$((sections_merged + 1))
                else
                    log "  Skipping section: '$section_name' (no changes after merge)"
                    sections_skipped=$((sections_skipped + 1))
                fi
            else
                log "  Skipping section: '$section_name' (identical)"
                sections_skipped=$((sections_skipped + 1))
            fi
        fi
        
    done <<< "$all_sections"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    if [[ $sections_merged -eq 0 ]]; then
        print_info "No sections needed updating (all are identical)"
        return 0
    fi
    
    print_success "3-way merged $sections_merged section(s), skipped $sections_skipped section(s)"
    return 0
}

usage() {
    cat <<EOF
Usage: $PROGRAM_NAME [OPTIONS]

Load and merge custom skills from a GitHub repository.

OPTIONS:
    -r, --repo REPO          GitHub repository (format: owner/repo)
                            Default: moarora1/agenticai-development
    -b, --branch BRANCH      Branch name to clone
                            Default: agents-skills-update
    -s, --skills-path PATH   Relative path to skills directory in repo
                            Default: .claude/skills
    -d, --dest-dir DIR       Destination directory for merged skills
                            Default: .claude/skills
    -h, --help              Show this help message
    -v, --version           Show version information

EXAMPLES:
    # Use default settings
    $PROGRAM_NAME

    # Use custom repository and branch
    $PROGRAM_NAME --repo myorg/custom-skills --branch main

    # Specify all options
    $PROGRAM_NAME -r myorg/skills -b production -s skills -d .custom/skills

EOF
    exit 0
}

show_version() {
    echo "$PROGRAM_NAME version $VERSION"
    exit 0
}

main() {
    # Default values
    local repo="moarora1/agenticai-development"
    local branch="agents-skills-update"
    local skills_rel_path=".claude/skills"
    local dest_skills_dir=".claude/skills"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -r|--repo)
                repo="$2"
                shift 2
                ;;
            -b|--branch)
                branch="$2"
                shift 2
                ;;
            -s|--skills-path)
                skills_rel_path="$2"
                shift 2
                ;;
            -d|--dest-dir)
                dest_skills_dir="$2"
                shift 2
                ;;
            -h|--help)
                usage
                ;;
            -v|--version)
                show_version
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    print_header "Loading Custom Skills from $repo"
    
    # Verify required commands
    require_cmd gh
    require_cmd git
    require_cmd tar
    
    # Create temporary directory
    _CUSTOM_TMPDIR=$(mktemp -d)
    log "Created temp dir: $_CUSTOM_TMPDIR"
    
    local clone_dir="$_CUSTOM_TMPDIR/custom-repo"
    
    # Clone the repository
    print_info "Cloning $repo (branch: $branch)..."
    if ! gh repo clone "$repo" "$clone_dir" -- -b "$branch" >/dev/null 2>&1; then
        die "Failed to clone repository. Make sure you have access to $repo"
    fi
    
    print_success "Repository cloned successfully"
    
    # Ensure destination directory exists
    mkdir -p "$dest_skills_dir"
    
    # Merge skills
    local src_skills_dir="$clone_dir/$skills_rel_path"
    print_info "Merging custom skills..."
    
    if discover_and_merge_skills "$src_skills_dir" "$dest_skills_dir"; then
        # Update .agents/discover-skills script
        print_info "Updating .agents/discover-skills script..."
        mkdir -p .agents
        local discover=".agents/discover-skills"
        generate_discover_skills >"$discover"
        chmod +x "$discover"
        print_success "Updated discover-skills script"
        
        # Merge AGENTS.md file
        local src_agents="$clone_dir/AGENTS.md"
        merge_agents_md "$src_agents" "AGENTS.md"
        
        print_success "Custom skills loaded and merged successfully!"
        echo ""
        print_info "Skills have been merged without overwriting existing files"
        print_info "AGENTS.md Skills section has been updated"
        print_info "Run './.agents/discover-skills' to see all available skills"
    else
        print_warning "No custom skills were loaded"
        return 1
    fi
}

# Run main function
main "$@"
