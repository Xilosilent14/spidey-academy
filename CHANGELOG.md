# Changelog

All notable changes to Spidey Academy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to incrementing service-worker cache versions on each release.

## [SW v23] — 2026-05-23

### Added
- Mystery egg variable reward
- Streak flame chip with 4 visual tiers
- 48-hour streak grace period so a missed day does not punish a 3-year-old
- Return-day celebration when Asher comes back after time away
- Hint cascade at 5s / 10s / 15s of inactivity
- Session-length warning to prompt a healthy break
- Audio enhancer with DynamicsCompressor and voice ducking under music
- Structured analytics event hook

### Changed
- Asher-sized 100px primary CTAs across all activities
- Kids-UI depth pass: bevel, drop shadow, and idle bob on interactive elements
- SES / lockdown hardening: inline PWA bootstrap moved into `main.js`
- Voice replay button on the prompt
- TTS fallback chain so Silk and Fire tablets always get a voice

### Fixed
- Player name now falls back to the active ecosystem profile when local copy is missing
