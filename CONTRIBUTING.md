# Contributing Guide

Thanks for contributing to this project.

## Project Scope

This repository contains:
- `contracts/`: smart contracts and Hardhat scripts
- `frontend/`: Next.js mint frontend
- `art-engine/`: NFT image/metadata generator
- `scripts/`: utility scripts (IPFS, Merkle, etc.)

## Development Setup

1. Install dependencies per package:
   - `cd contracts && npm install`
   - `cd frontend && npm install`
   - `cd art-engine && npm install`
   - `cd scripts && npm install`
2. Use `.env.example` files as templates.
3. Run tests/build before opening a PR.

## Branch and Commit Conventions

- Create focused branches per feature or fix.
- Keep pull requests small and reviewable.
- Use clear commit messages:
  - `feat: add allowlist mint guard`
  - `fix: correct merkle proof validation`
  - `docs: improve launch runbook`

## Pull Request Checklist

- [ ] Code compiles successfully.
- [ ] Tests pass for affected area.
- [ ] README/docs updated when behavior changes.
- [ ] No secrets committed (`.env`, private keys, API tokens).

## Security Notes

- Never commit private keys or raw seed phrases.
- Use test wallets for local/dev workflows.
- Disclose vulnerabilities privately (see `SECURITY.md`).

## Contact

- Email: info@mohammadnasser.com
- Website: https://mohammadnasser.com
