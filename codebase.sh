#!/usr/bin/env bash

# List of files to exclude (add your files here)
exclude_list=("codebase.sh" "pnpm-lock.yaml" "flake.lock" "LICENSE" ".github/*" ".envrc" ".gitignore" "*.svg")

is_excluded() {
    local file="$1"
    local filename=$(basename "$file")
    for pattern in "${exclude_list[@]}"; do
        # Handle directory wildcards
        if [[ $pattern == *"/*" ]]; then
            local dir_pattern="${pattern%/*}"
            if [[ $file == $dir_pattern/* ]]; then
                return 0  # True, file is in excluded directory
            fi
        # Handle wildcard patterns
        elif [[ $file == $pattern ]]; then
            return 0  # True, file matches excluded pattern
        fi
    done
    return 1  # False, file is not excluded
}

# Get all tracked files
{ git ls-files; git ls-files --others --exclude-standard; } | sort -u | while read -r file; do
    # Skip if file is in exclude list
    if is_excluded "$file"; then
        continue
    fi
    
    # Skip empty or binary files
    if [[ ! -s "$file" ]] || $(file --mime "$file" | grep -q "charset=binary"); then
        continue
    fi

    # Add the file path as a header
    echo "* $file"
    echo ""
    # Add the file content wrapped in triple backticks
    echo '#+BEGIN_SRC'
    # cat "$file"
    nl -ba -p --number-separator='|' "$file"
    echo '#+END_SRC'
    echo ""
    echo ""
done

