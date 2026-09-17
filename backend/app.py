from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    project = analyze_project(folder)
    return {
        "summary": build_summary(project),
        "project": project,
        "dependency_graph": build_dependency_graph(project),
        "call_graph": build_call_graph(project)
    }