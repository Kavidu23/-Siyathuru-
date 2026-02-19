# Contributing to Siyathuru - AI-Driven Social Networking for Community Platform

This guide explains how to set up your development environment and contribute to the **Siyathuru project**.

---

## 📝 Commit Message Guidelines

Use this simple structure for commit messages:

```text
<type>(<scope>): <summary>
```

### Types

* `feat` – new feature  
* `fix` – bug fix  
* `refactor` – code change, no feature/fix  
* `docs` – documentation only  
* `chore` – tooling/cleanup
* `test` - add or fix tests
* `chore` - config, cleanup, tooling
* `build` - dependencies, build config
* `ci` - CI/CD pipeline changes

## Scope

**Frontend:** frontend, frontend-auth, frontend-ui, frontend-chat, frontend-socket

**Backend:** backend, backend-auth, backend-api, backend-db, backend-socket

**Database:** db, schema, seed

**Testing:** unit-test, integration-test, system-test, uat

**DevOps/CI:** ci, docker, pipeline

**Docs/Report/Video:** report, docs, video, changelog

## Summary Line Rules

**Format**: Present tense, imperative mood, lowercase, no period at the end

- ✅ Good: add user login validation
- ✅ Good: refactor nitro card component
- ❌ Bad: Added user login validation
- ❌ Bad: Implemented feedback rate limiting

## Examples of Conventional Commits

1. **feat(frontend-auth):** add user login form validation  
2. **feat(backend-api):** implement appointment CRUD endpoints  
3. **feat(backend-socket):** enable real-time chat messaging  
4. **refactor(db):** normalize user schema relationships  
5. **test(unit-test):** add user service unit tests  
6. **ci(pipeline):** add GitHub Actions test workflow  
7. **docs(report):** update testing and CI sections

### PR Description

- Clearly explain **what** was changed
- Briefly mention **why** the change was needed
- Use bullet points for changes if possible
- Keep the description **clear and concise**

### Optional

- Mention impact (e.g., improves validation, increases test coverage)
- State **no breaking changes** if applicable

## ✅ Final Checklist

* [ ] Code is formatted with Prettier.  
* [ ] No ESLint errors/warnings.  

## Maintainer

Built by Kavidu Lakshan (Rateralalage Thilakarathna).
