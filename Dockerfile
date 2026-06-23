# OpenMontage — all-in-one container.
#
# Why this exists: hosts with old glibc (e.g. RHEL/CentOS/Rocky 8 → glibc 2.28)
# cannot run Remotion 4.x, which requires glibc >= 2.31. This Debian 12
# (bookworm, glibc 2.36) image runs the whole stack — Python via uv, Node 22,
# FFmpeg, and a system Chromium for Remotion — so the host OS no longer matters.
#
# Chromium is installed via apt (NOT downloaded from storage.googleapis.com),
# which also avoids the chrome-headless-shell download that is slow/blocked in
# some regions. remotion-composer/remotion.config.ts auto-detects /usr/bin/chromium
# and switches Remotion to new-headless mode so the modern browser launches.
#
# Build:  docker build -t openmontage .
# Demo:   docker run --rm -it -v "$PWD/projects:/app/projects" openmontage make uv-demo
# Shell:  docker run --rm -it -v "$PWD/projects:/app/projects" -v "$PWD/.env:/app/.env" openmontage bash

FROM node:22-bookworm

# System dependencies:
#   ffmpeg            — composition / encoding (all render runtimes)
#   chromium          — Remotion's browser (apt build runs on this glibc)
#   fonts-*           — Latin + CJK glyphs so rendered text isn't tofu
#   ca-certificates   — TLS for any API calls
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ffmpeg \
      chromium \
      fonts-liberation \
      fonts-noto-cjk \
      fonts-noto-color-emoji \
      ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# uv (Python package/venv manager) — copied from the official image, no curl needed.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Point Remotion at the apt-installed Chromium (config also auto-detects this).
ENV REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

WORKDIR /app

# Install dependencies first (better layer caching). Copy the manifests, then
# the rest of the source.
COPY pyproject.toml uv.lock .python-version ./
COPY remotion-composer/package.json remotion-composer/package-lock.json* remotion-composer/
RUN uv sync --extra dev \
 && cd remotion-composer && npm install

# Now copy the full project source.
COPY . .

# Default to an interactive shell; override with e.g. `make uv-demo`.
CMD ["bash"]
