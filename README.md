# CodeLens — Codebase Visualizer

CodeLens is a full-stack web application for analyzing and visualizing Python codebases. It uses static code analysis to extract structural information from source files and generates interactive graphs to represent file dependencies and function call relationships.

The application supports both local Python projects and public GitHub repositories, providing a visual way to explore code structure and navigate relationships between files.

## Features

- **Repository Analysis:** Analyze local Python projects or public GitHub repositories.
- **Static Code Analysis:** Extract functions, classes, methods, imports, and function calls using Python's Abstract Syntax Tree (AST) module.
- **Dependency Visualization:** Generate interactive graphs showing relationships between Python files.
- **Function Call Graphs:** Visualize function and method call relationships across a codebase.
- **Code Explorer:** Browse repository files and inspect their functions, classes, and imports.
- **Repository Overview:** Display summary statistics, including the number of files, functions, classes, and methods.

## Tech Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Code Analysis | Python AST |
| Visualization | React Flow, Dagre |
| Version Control | Git, GitHub |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/wonminshin/codebase-visualizer.git
cd codebase-visualizer
```

### 2. Set Up the Backend

Install the required Python packages:

```bash
pip install fastapi uvicorn
```

Start the FastAPI server:

```bash
uvicorn backend.app:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

API documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Set Up the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to access the application.

## Implementation

### Static Code Analysis

CodeLens uses Python's built-in `ast` module to parse source files and identify functions, classes, methods, imports, and function calls without executing the code.

The extracted information is used to construct two graph representations:

- **Dependency Graph:** Represents relationships between Python files based on imported modules.
- **Function Call Graph:** Represents detected calls between functions and methods.

### Backend

The FastAPI backend handles repository analysis and graph generation. For GitHub repositories, the application clones the repository into a temporary directory, processes its Python files, and returns the analysis results as JSON.

### Frontend

The frontend is built with Next.js and TypeScript. React Flow is used to render interactive graphs, while Dagre calculates node positions automatically.

Users can switch between graph views, navigate repository files, and inspect code structure through the Explorer and Inspector panels.

## Limitations

CodeLens currently supports Python source files. Because the analysis is static, certain relationships involving dynamic imports, runtime behavior, or indirect function calls may not be fully resolved. Graph readability may also vary depending on repository size and complexity.

## Future Improvements

- Improved import resolution and function call detection
- Graph filtering and navigation for larger repositories
- Expanded automated testing
- Support for additional programming languages