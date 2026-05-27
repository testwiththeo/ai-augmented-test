<div align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/playwright-v1.60-blue" alt="Playwright">
  <img src="https://img.shields.io/badge/typescript-%5E5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
</div>

<br />

<div align="center">
  <h1>🤖 AI-Augmented Test Framework</h1>
  <p>
    <strong>A next-generation test automation framework that leverages artificial intelligence to make testing smarter, self-healing, and self-generating.</strong>
  </p>
  <p>
    Built with Playwright · TypeScript · OpenAI · LangChain · ChromaDB
  </p>
  <br />
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-ai-features">AI Features</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## 📋 Overview

Traditional test automation is brittle. A button changes class and your test breaks. A new feature ships and someone has to manually write 50 test cases. A test fails and you spend 30 minutes debugging why.

**AI-Augmented Test Framework** changes that. It combines the power of **Playwright's reliable automation engine** with **OpenAI's language models** to create a test framework that:

- 🔧 **Heals itself** when locators break
- ✍️ **Generates test cases** from feature descriptions
- 🔍 **Analyzes failures** with root cause suggestions
- 🧠 **Learns from history** using vector storage (ChromaDB + RAG)

---

## ✨ Features

### Core Test Engine

| Feature | Status |
|---------|--------|
| ✅ Playwright cross-browser automation | `✓` |
| ✅ Page Object Model pattern | `✓` |
| ✅ TypeScript-first architecture | `✓` |
| ✅ Allure reporting | `✓` |
| ✅ GitHub Actions CI | `✓` |

### 🤖 AI Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Self-Healing Locators** | When a locator fails, AI analyzes the DOM and suggests/corrects the locator automatically. No more flaky tests due to CSS class changes | 🔄 In Progress |
| **AI Test Generator** | Paste a feature description → AI generates 10-15 production-ready test cases with boundary values, edge cases, and negative scenarios | 📅 Planned |
| **Failure Analyzer** | On test failure, AI examines the screenshot, error log, and DOM snapshot to identify root cause and suggest a fix | 📅 Planned |
| **RAG-Based Test Generation** | Using ChromaDB vector store, the framework retrieves semantically similar test cases to generate context-aware new tests | 📅 Planned |

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Test Runner** | [Playwright](https://playwright.dev) - Cross-browser automation with auto-wait |
| **Language** | [TypeScript](https://www.typescriptlang.org) - Static typing for robust test code |
| **AI Engine** | [OpenAI GPT-4o-mini](https://openai.com) - Cost-effective LLM for test intelligence |
| **AI Orchestration** | [LangChain](https://langchain.com) - Prompt chaining, memory, and tool integration |
| **Vector Store** | [ChromaDB](https://www.trychroma.com) - Embedding storage for semantic test case retrieval |
| **Reporting** | [Allure Framework](http://allure.qatools.ru) - Interactive HTML test reports |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) - Automated test execution on push/PR |
| **Data Generator** | [Faker.js](https://fakerjs.dev) - Realistic test data generation |

---

## 📁 Project Structure

```
ai-augmented-test-framework/
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI pipeline
├── src/
│   ├── tests/
│   │   ├── login.spec.ts             # Login flow tests
│   │   ├── products.spec.ts          # Product catalog tests
│   │   ├── cart.spec.ts              # Cart & checkout tests
│   │   └── api/                      # API contract tests
│   ├── pages/
│   │   ├── LoginPage.ts              # POM - Login
│   │   ├── ProductsPage.ts           # POM - Products
│   │   ├── CartPage.ts               # POM - Cart
│   │   └── CheckoutPage.ts           # POM - Checkout
│   ├── ai/
│   │   ├── openai-client.ts          # OpenAI API wrapper
│   │   ├── self-healing.ts           # Self-healing locator engine
│   │   ├── test-generator.ts         # AI test case generator
│   │   ├── failure-analyzer.ts       # AI failure analysis
│   │   ├── langchain-pipeline.ts     # LangChain orchestration
│   │   └── vector-store.ts           # ChromaDB integration
│   ├── data/
│   │   ├── test-data.json            # Static test data
│   │   └── faker-data.ts             # Dynamic data generator
│   └── helpers/
│       ├── report.ts                 # Allure report helpers
│       └── retry.ts                  # Retry mechanism
├── docs/
│   ├── test-strategy.md              # Testing strategy document
│   ├── test-cases.md                 # Comprehensive test case catalog
│   ├── ai-integration.md             # AI integration deep-dive
│   └── bug-reports.md                # Sample bug reports
├── screenshots/                      # Visual evidence (gitignored)
├── test-results/                     # Local test output (gitignored)
├── allure-report/                    # Generated Allure report
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI with quality gates
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- npm or pnpm
- [Git](https://git-scm.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/theodores/ai-augmented-test-framework.git
cd ai-augmented-test-framework

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# (Optional) Set up OpenAI API key for AI features
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests with UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run a specific test file
npx playwright test src/tests/login.spec.ts

# Generate Allure report
npx allure generate allure-results --clean
npx allure open
```

### CI Pipeline

The framework includes a GitHub Actions workflow that:

- Runs tests on every push and pull request
- Generates Allure test reports
- Deploys reports to GitHub Pages
- Provides Slack/email notifications on failure

---

## 🤖 AI Features

### 1. Self-Healing Locators

When a UI element changes (e.g., a button's CSS class gets renamed), traditional frameworks break. This framework detects the failure, captures the DOM snapshot, and asks OpenAI to suggest a working locator and retries automatically.

```typescript
// Example: This locator survives UI changes
await page.click('[data-test="checkout"]');
// If `.btn-checkout` changes to `.checkout-button`, 
// the self-healing engine detects and recovers automatically
```

### 2. AI Test Generator

Describe a feature in plain English, and the AI generates complete, production-ready test cases.

```bash
# Input
"Users should be able to filter products by price range and see results sorted correctly"

# AI Output
- 15 test cases with BVA and EP
- Happy path + 8 negative scenarios
- Edge cases for boundary values
```

### 3. AI Failure Analyzer

When a test fails, the AI analyzes the screenshot, error stack, and DOM state to identify the root cause.

```bash
# Before: You spend 30 minutes debugging
# After: AI tells you in 5 seconds
```

### 4. RAG-Based Test Generation (Coming Soon)

All existing test cases are embedded into ChromaDB. When generating new tests, the framework retrieves semantically similar test cases as context to produce more relevant and context-aware test scenarios.

---

## 📊 Test Reports

![Allure Report](https://img.shields.io/badge/Allure-Report-blue)

Test reports are automatically generated and deployed to GitHub Pages after each CI run.

**🔗 [View Live Test Report](https://theodores.github.io/ai-augmented-test-framework)**

Reports include:
- Test execution summary (passed, failed, skipped, duration)
- Per-test step breakdown with screenshots
- Failure analysis with AI-generated root cause
- Historical trends and flakiness detection

---

## 🗺 Roadmap

### Phase 1 - Foundation (Week 1)
- [x] Playwright + TypeScript project setup
- [x] First test case running in CI
- [ ] 10+ test cases (login, products, cart)
- [ ] Page Object Model implementation
- [ ] Allure reporting integration

### Phase 2 - AI Self-Healing (Week 2)
- [ ] OpenAI API integration
- [ ] Self-healing locator engine
- [ ] DOM snapshot capture + AI analysis
- [ ] 20+ test cases

### Phase 3 - AI Generation & Analysis (Week 3)
- [ ] AI test generator from feature descriptions
- [ ] AI failure analyzer (screenshot + log)
- [ ] LangChain orchestration
- [ ] 30+ test cases

### Phase 4 - RAG & Vector Store (Week 4)
- [ ] ChromaDB setup + embedding pipeline
- [ ] Semantic test case retrieval
- [ ] Context-aware test generation
- [ ] 40+ test cases

### Phase 5 - Polish & Launch (Week 5)
- [ ] 50+ test cases
- [ ] Comprehensive documentation
- [ ] Demo video
- [ ] Portfolio landing page

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and grow. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the [MIT License](./LICENSE).

---

## 👨‍💻 Author

**Theodores** - [theodores.dev](https://theodores.dev) - [GitHub](https://github.com/theodores)

---

<div align="center">
  <sub>Built with ❤️ and a lot of ☕ during late-night coding sessions.</sub>
  <br />
  <sub>If this project helps you, consider giving it a ⭐!</sub>
</div>
