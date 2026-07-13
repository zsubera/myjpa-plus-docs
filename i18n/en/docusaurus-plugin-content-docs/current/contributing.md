---
sidebar_position: 1
title: Contributing
---

# Contributing

Thank you for your interest in contributing to MyJpa-Plus!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development

### Prerequisites

- Java 17+
- Maven 3.8+

### Build

```bash
mvn clean install
```

### Run Tests

```bash
mvn test
```

### Code Style

The project uses Spotless for code formatting. Run before committing:

```bash
mvn spotless:apply
```

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality
- Update documentation as needed
- Follow existing code conventions
- Ensure all CI checks pass

## Reporting Issues

- Use GitHub Issues
- Include reproduction steps
- Include Java/Spring Boot version
- Include stack trace if applicable
