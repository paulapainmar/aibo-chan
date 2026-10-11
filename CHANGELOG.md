# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Cloudflare Worker that receives Discord interactions and verifies their signature.
- D1 database with `users` and `follows` tables.
- `/start` and `/stop` commands.
- Command registration script.

### Removed
- Legacy Python notifier (GitHub Actions, webhook and `animes.json`).