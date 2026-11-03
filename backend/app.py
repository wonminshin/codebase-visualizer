import subprocess
import tempfile
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi import FastAPI, HTTPException
from backend.ai import retrieve_relevant_code
from analyzer.main import ( analyze_project, build_dependency_graph, build_call_graph,build_summary)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)

@app.get("/")
def root():
    return {
        "message": "CodeLens API currently running"
    }

@app.get("/analyze")
def analyze(folder: str = "analyzer/sample"):
    folder_path = Path(folder)

    if not folder_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Folder not found."
        )

    if not folder_path.is_dir():
        raise HTTPException(
            status_code=400,
            detail="The path must be a folder."
        )

    project = analyze_project(folder)

    return {
        "summary": build_summary(project),
        "project": project,
        "dependency_graph": build_dependency_graph(project),
        "call_graph": build_call_graph(project)
    }

@app.get("/analyze-github")
def analyze_github(repo_url: str):

    if not repo_url.startswith("https://github.com/"):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid GitHub repository URL."
        )

    with tempfile.TemporaryDirectory() as temp_dir:

        result = subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, temp_dir],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=400,
                detail="Could not clone the GitHub repository."
            )

        project = analyze_project(temp_dir)

        return {
            "summary": build_summary(project),
            "project": project,
            "dependency_graph": build_dependency_graph(project),
            "call_graph": build_call_graph(project)
        }

@app.get("/search-code")
def search_code(question: str, folder: str = "analyzer/sample"):
    project = analyze_project(folder)

    results = retrieve_relevant_code(question, project)

    return {
        "question": question,
        "results": results
    }