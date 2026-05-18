FROM node:25-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  neovim \
  sudo \
  unzip \
  zip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG CMDLINE_TOOLS_VERSION=11076708

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=${ANDROID_HOME}

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
  curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip \
  -o /tmp/cmdline-tools.zip && \
  unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools && \
  mv /tmp/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
  rm -rf /tmp/cmdline-tools /tmp/cmdline-tools.zip && \
  yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "build-tools;34.0.0" \
    "platforms;android-34"

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0

