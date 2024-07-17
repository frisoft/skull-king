#!/usr/bin/env bash

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  clipboard_paste() {
    pbpaste
  }
else
  # Linux
  clipboard_paste() {
    if [ -n "$WAYLAND_DISPLAY" ]; then
      wl-paste
    elif [ -n "$DISPLAY" ]; then
      xclip -selection clipboard -o
    else
      echo "Clipboard paste functionality not available in this environment" >&2
    fi
  }
fi

if [[ "$OSTYPE" != "darwin"* ]] && [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
  echo "Note: You are not in a graphical environment. Clipboard functionality may be limited."
fi

clipboard_paste | (recountdiff && echo "") | patch -p0 -F4 --dry-run --ignore-whitespace --verbose && \
  echo "WORKS!"


# clipboard_paste | (recountdiff && echo "") | patch -p0 -F4 --dry-run --ignore-whitespace --verbose && \
#   clipboard_paste | (recountdiff && echo "") | patch -p0 -F4 --ignore-whitespace
