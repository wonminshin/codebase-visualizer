from fastapi import FastAPI
from analyzer.main import (
    analyze_project,
    build_dependency_graph,
    build_call_graph,
    build_summary
)
app = FastAPI()

@app.get("/")
def root():
    return {
        "message": "CodeLens API is running"
    }


@app.get("/analyze")
def analyze():
    project = analyze_project("analyzer/sample")
    return {
        "summary": build_summary(project),
        "project": project,
        "dependency_graph": build_dependency_graph(project),
        "call_graph": build_call_graph(project)
    }