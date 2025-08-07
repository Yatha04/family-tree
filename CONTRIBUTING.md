# Contributing to Family Tree

Thank you for your interest in contributing to Family Tree! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and considerate of others.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/family-tree.git
   cd family-tree
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/family-tree.git
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Making Changes

1. **Create a new branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly

4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add user authentication feature"
   git commit -m "fix: resolve family tree rendering issue"
   ```

## Pull Request Process

1. **Update your branch** with the latest changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Screenshots if UI changes were made
   - Link to any related issues

4. **Wait for review** and address any feedback

## Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper TypeScript interfaces for props

### CSS/Styling
- Use Tailwind CSS classes
- Follow the existing design patterns
- Keep styles consistent with the current theme

### Git Commit Messages
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on different browsers if UI changes are made

## Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots if applicable

## Feature Requests

When suggesting new features:
- Explain the use case clearly
- Consider the impact on existing functionality
- Provide mockups or examples if possible

## Questions?

If you have questions about contributing, please:
1. Check existing issues and discussions
2. Open a new issue with the "question" label
3. Join our community discussions

Thank you for contributing to Family Tree! 🌳
