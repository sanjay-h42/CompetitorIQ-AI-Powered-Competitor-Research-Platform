import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gemini_configured" in data


def test_project_validation_competitor_limits():
    # 0 competitors must fail with 422
    payload_empty = {
        "company_name": "TestCo",
        "website_url": "https://testco.com",
        "industry": "Tech",
        "target_market": "Developers",
        "competitors": []
    }
    resp = client.post("/api/projects", json=payload_empty)
    assert resp.status_code == 422

    # > 5 competitors must fail with 422
    payload_too_many = {
        "company_name": "TestCo",
        "website_url": "https://testco.com",
        "industry": "Tech",
        "target_market": "Developers",
        "competitors": [
            {"name": f"Comp{i}", "website_url": f"https://comp{i}.com"}
            for i in range(6)
        ]
    }
    resp = client.post("/api/projects", json=payload_too_many)
    assert resp.status_code == 422


def test_project_validation_duplicate_competitor():
    payload_dup = {
        "company_name": "TestCo",
        "website_url": "https://testco.com",
        "industry": "Tech",
        "target_market": "Developers",
        "competitors": [
            {"name": "Comp A", "website_url": "https://comp-a.com"},
            {"name": "Comp A Dup", "website_url": "https://comp-a.com"}
        ]
    }
    resp = client.post("/api/projects", json=payload_dup)
    assert resp.status_code == 422


def test_project_crud_lifecycle():
    # Create valid project
    payload = {
        "company_name": "Atlas Analytics",
        "website_url": "https://atlasanalytics.io",
        "industry": "Product Analytics",
        "target_market": "Product Managers",
        "description": "Fast product metrics and user journey tracking.",
        "competitors": [
            {"name": "Mixpanel", "website_url": "https://mixpanel.com"},
            {"name": "Amplitude", "website_url": "https://amplitude.com"}
        ]
    }
    create_resp = client.post("/api/projects", json=payload)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    project_id = created_data["id"]
    assert created_data["company_name"] == "Atlas Analytics"
    assert len(created_data["competitors"]) == 2

    # List projects
    list_resp = client.get("/api/projects")
    assert list_resp.status_code == 200
    projects = list_resp.json()
    assert any(p["id"] == project_id for p in projects)

    # Get project detail
    detail_resp = client.get(f"/api/projects/{project_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == project_id

    # Delete project
    del_resp = client.delete(f"/api/projects/{project_id}")
    assert del_resp.status_code == 204

    # Confirm 404 after deletion
    get_after_del = client.get(f"/api/projects/{project_id}")
    assert get_after_del.status_code == 404


def test_seed_demo_and_retrieve_report():
    # Call demo seed
    seed_resp = client.post("/api/demo/seed")
    assert seed_resp.status_code == 201
    project_data = seed_resp.json()
    assert project_data["company_name"] == "DevPulse AI"
    job_id = project_data["latest_job_id"]
    assert job_id is not None

    # Get research job status
    job_resp = client.get(f"/api/research/{job_id}")
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert job_data["status"] == "COMPLETED"
    assert job_data["progress_percent"] == 100
    assert len(job_data["analyses"]) >= 2

    # Get report
    report_resp = client.get(f"/api/research/{job_id}/report")
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert "DevPulse AI" in report_data["title"]
    assert len(report_data["strategic_recommendations"]) > 0

    # Get sources
    sources_resp = client.get(f"/api/research/{job_id}/sources")
    assert sources_resp.status_code == 200
    assert len(sources_resp.json()) > 0

    # Export markdown
    export_resp = client.get(f"/api/research/{job_id}/export/markdown")
    assert export_resp.status_code == 200
    assert "# Competitive Intelligence Report" in export_resp.text
