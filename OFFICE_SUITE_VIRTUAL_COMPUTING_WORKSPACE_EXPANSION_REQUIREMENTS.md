# UniSphere — Office Suite, Virtual Computing & Complete Developer Workspace Expansion

**Document type:** Product Requirements Expansion
**Status:** Proposed — Documentation and repository analysis only
**Priority:** High
**Instruction:** Documentation only. Do not implement features, install dependencies, change application code, modify schemas or alter deployment configurations.

--- 

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 3 November 2026 | Engineering | Initial expansion proposal

--- 

# 1. Integrated Office Suite

## 1.1 Integrated Office Suite Overview

Investigate integrating the following open-source projects:

| UniSphere tool | Project to investigate | Intended functionality |
|---|---|---|
| UniDocs | WordCraft | Word processing |
| UniSheets | GridCraft | Spreadsheets |
| UniSlides | DeckCraft | Presentations |

### Official repositories to investigate:

- WordCraft: https://github.com/storytold/wordcraft
- GridCraft: https://github.com/storytold/gridcraft
- DeckCraft: https://github.com/storytold/deckcraft

Do not assume these projects are production-ready.

Evaluate their:
- Licenses and redistribution requirements.
- Repository activity and maintenance.
- Dependencies and security.
- Native and browser/WASM builds.
- File-format compatibility.
- Accessibility and localization.
- Performance and memory usage.
- Stability and known limitations.
- Commercial usage conditions.
- Integration and embedding options.

Do not copy Microsoft proprietary code, branding or assets. Preserve the independent identity of these projects.

## 1.1 Document editor — UniDocs

### Potential capabilities:
- DOCX editing and creation.
- Rich text formatting.
- Fonts, styles and headings.
- Tables and images.
- Headers and footers.
- Page layout and numbering.
- Footnotes and references.
- Comments and track changes.
- Export to PDF.
- Templates.
- Document version history.
- Autosave.
- Printing.
- AI writing assistant.
- Collaborative editing.
- Document sharing and permissions.

## 1.2 Spreadsheet editor — UniSheets

### Potential capabilities:
- XLSX and CSV support.
- Worksheets and multiple tabs.
- Formulas and functions.
- Cell formatting.
- Sorting and filtering.
- Conditional formatting.
- Charts and graphs.
- Pivot tables.
- Data validation.
- Import and export.
- Financial and statistical calculations.
- Templates.
- AI formula assistance.
- Data analysis assistant.
- Collaborative editing.

## 1.3 Presentation editor — UniSlides

### Potential capabilities:
- PPTX support.
- Slide creation and editing.
- Themes and layouts.
- Text, images, shapes and diagrams.
- Tables and charts.
- Animations and transitions.
- Speaker notes.
- Slide templates.
- Presenter mode.
- PDF export.
- AI presentation generation.
- Collaborative editing.

# 2. Cloud File and Document Workspace

## Provision a unified file management experience.

- Personal cloud drive.
- Organization storage.
- Project file storage.
- Folder management.
- Upload and download.
- File previews.
- File sharing.
- Access permissions.
- Storage quotas.
- Version history.
- Recycle bin and recovery.
- File search.
- Document comments.
- Shared folders.
- Document activity history.
- Secure file links.

### Support common formats including:
- DOCX, XLSX, PPTX, PDF, TXT, Markdown, CSV
- Images, source code and archives.

### Investigate storage costs, limits, encryption, malware scanning and file retention.

--- 

# 3. Integrated Code Editor and IDE

### Editor features
- Syntax highlighting.
- Code completion.
- Multiple files and tabs.
- File explorer.
- Search across files.
- Find and replace.
- Integrated terminal.
- Git integration.
- Extensions or plugin architecture.
- Themes.
- Keyboard shortcuts.
- Language servers.
- Debugging.
- Code formatting.
- Linting.
- Project templates.
- Autosave.
- Workspace management.

### Language support
- Investigate support for:
- C and C++.
- Java.
- Python.
- JavaScript and TypeScript.
- HTML and CSS.
- PHP.
- C#.
- SQL.
- Go.
- Rust.
- Other popular languages.

### Framework and ecosystem support
- React.
- Next.js.
- Node.js.
- Express.
- Flutter.
- Django.
- FastAPI.
- Spring Boot.
- Godot.
- Other frameworks as the platform evolves.

Do not promise full support for every language and framework in the initial release.

# 4. Virtual Machines and Cloud Development Environments

### Potential capabilities:
- Linux virtual machines.
- Windows virtual machines where licensing permits.
- Ubuntu and Debian environments.
- Developer workspaces.
- Browser-based remote desktop.
- SSH access.
- Terminal access.
- CPU and RAM allocation.
- Storage allocation.
- VM snapshots.
- Start, stop, restart and delete.
- Environment templates.
- Persistent storage.
- Networking controls.
- Port forwarding.
- Environment sharing.
- Resource monitoring.
- Automatic shutdown when idle.

### Development environment templates
Examples:
- Python development environment.
- C/C++ development environment.
- Java development environment.
- Node.js development environment.
- React and Next.js environment.
- Database environment.
- Docker learning environment.
- Linux administration environment.
- Cybersecurity training environment.
- Machine learning environment.

### Architecture investigation
Compare:
- Full virtual machines.
- Containers.
- Firecracker or microVM technologies.
- Remote development environments.
- Browser-based IDEs.
- Existing cloud development providers.

Clearly distinguish containers from virtual machines.
Untrusted workloads must never run inside the main UniSphere API server.
Investigate resource quotas, isolation boundaries, network restrictions, cost management, abuse prevention and automatic cleanup.

--- 

# 5. Database Development Workspace

### Investigate:
- SQL editor.
- PostgreSQL.
- MySQL and MariaDB.
- MongoDB.
- SQLite.
- Database schema visualization.
- ER diagrams.
- Query history.
- Query execution.
- Table management.
- Import and export.
- Database backups.
- Connection management.
- AI SQL assistance.
- Query explanation.
- Query optimization assistance.

### Database credentials must be stored securely and never exposed in frontend code or logs.

# 6. API Development Workspace

### Features:
- HTTP request builder.
- GET, POST, PUT, PATCH and DELETE.
- Headers and query parameters.
- Request bodies.
- Authentication configuration.
- Response viewer.
- Response headers and status codes.
- Request history.
- Collections.
- Environment variables.
- API documentation.
- OpenAPI import and export.
- API testing.
- Webhook testing.
- Team-shared API collections.

--- 

# 7. System Design and Engineering Tools

### Investigate built-in tools for software architecture and engineering.
- Mermaid diagrams.
- UML diagrams.
- ER diagrams.
- Flowcharts.
- Sequence diagrams.
- Architecture diagrams.
- Database modeling.
- System design exercises.
- Markdown documentation.
- Technical specification editor.
- Project planning.
- API documentation.
- Engineering decision records.

--- 

# 8. Git and DevOps Workspace

### Expand the previously defined GitHub-inspired developer workspace.
### Investigate:
- Git repositories.
- Branches and commits.
- Pull requests.
- Code reviews.
- Issues.
- Project boards.
- GitHub and GitLab integration.
- CI/CD pipelines.
- Build logs.
- Deployment integrations.
- Docker learning and management.
- Container registries.
- Environment variables.
- Deployment monitoring.

### Prioritize integration with established Git providers before considering hosting a complete Git platform ourselves.

# 12. Business Model and Resource Management

### Investigate sustainable ways to offer resource-intensive capabilities.

### Potential plans:
- Free basic document editing.
- Free coding environments with limits.
- Paid cloud storage.
- Paid virtual machines.
- Paid compute resources.
- Organization workspaces.
- Team collaboration plans.
- Educational institution plans.
- Premium AI usage.

### Document usage quotas, billing, resource monitoring, cancellation and abuse prevention.

### Never imply unlimited cloud computing without a sustainable resource model.

--- 

# 13. Required Deliverables

### Create or update:

1. Office Suite PRD.
2. WordCraft, GridCraft and DeckCraft Integration Evaluation.
3. Cloud File Workspace PRD.
4. Code Editor and IDE PRD.
5. Virtual Machine and Cloud Development Environment PRD.
6. Database Workspace PRD.
7. API Development Workspace PRD.
8. System Design Toolkit PRD.
9. Git and DevOps Workspace PRD.
10. AI Office and Developer Assistant PRD.
11. Real-Time Collaborative Editing Architecture.
12. Infrastructure and Resource Management Architecture.
13. Security and Isolation Requirements.
14. Pricing and Resource Economics Proposal.
15. Unified Navigation and UX Proposal.
16. Technical Risk Register.
17. Phased Implementation Roadmap.

### For each capability include:
- User stories.
- Requirements.
- Architecture options.
- Dependencies.
- Security.
- Acceptance criteria.
- Cost considerations.
- MVP/future classification.

# 14. Security and Isolation Requirements

### Critical security and isolation requirements for office, computing and AI features:

- Untrusted code execution must use isolated Docker workers (C1-C4 from PHASE0_AUDIT.md must be fixed first)
- Never mount the host Docker socket into untrusted execution containers
