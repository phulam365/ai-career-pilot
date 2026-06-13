#!/usr/bin/env python3
"""Match a CV against current Vietnam IT jobs using OpenAI web_search."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from docx import Document
from openai import OpenAI
from pypdf import PdfReader


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_DOMAINS = ["itviec.com", "vietnamworks.com", "linkedin.com"]


def load_local_env() -> None:
    load_dotenv(REPO_ROOT / ".env.openai", override=False)
    load_dotenv(SCRIPT_DIR / ".env", override=False)


def read_cv(path: Path) -> str:
    suffix = path.suffix.lower()

    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")

    if suffix == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if suffix == ".docx":
        document = Document(str(path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    raise ValueError("Unsupported CV format. Use .txt, .pdf, or .docx.")


def compact_text(text: str, max_chars: int) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if len(text) <= max_chars:
        return text

    return text[:max_chars].rstrip() + "\n\n[CV truncated for API request]"


def build_prompt(cv_text: str, role: str | None, location: str) -> str:
    role_instruction = role or "auto-detect the most suitable IT role"

    return f"""
You are helping build AI Career Pilot for the Vietnam IT market.

Task:
1. Search the live web for current Vietnam IT job postings or job search result pages.
2. Prefer ITviec, VietnamWorks, and LinkedIn Jobs. Only use other Vietnam career sites if needed.
3. Match the CV against the jobs you find.
4. Return exactly 3 ranked job matches.

Target role: {role_instruction}
Target location: {location}

Scoring rules:
- suitable_rate must be an integer from 0 to 100.
- Score based on skills, projects, experience level, education, and Vietnam job-market fit.
- Do not invent job URLs. Use URLs found by web search.
- If an exact job posting is not accessible, use the most relevant search/result URL and say so in source_note.
- Keep advice practical for a hackathon demo.

Return ONLY valid JSON with this shape:
{{
  "cv_summary": {{
    "detected_role": "string",
    "detected_skills": ["string"],
    "experience_level": "string"
  }},
  "results": [
    {{
      "rank": 1,
      "title": "string",
      "company": "string",
      "source": "ITviec | VietnamWorks | LinkedIn | other",
      "url": "string",
      "location": "string",
      "suitable_rate": 85,
      "job_description_summary": "string",
      "matched_skills": ["string"],
      "missing_skills": ["string"],
      "over_points": ["string"],
      "under_points": ["string"],
      "roadmap": ["string"],
      "source_note": "string"
    }}
  ]
}}

CV text:
\"\"\"
{cv_text}
\"\"\"
""".strip()


def normalize_domains(domains: list[str]) -> list[str]:
    normalized: list[str] = []

    for domain in domains:
        domain = domain.strip().lower()
        domain = re.sub(r"^https?://", "", domain)
        domain = domain.strip("/")

        if domain and domain not in normalized:
            normalized.append(domain)

    return normalized


def response_to_dict(response: Any) -> dict[str, Any]:
    if hasattr(response, "model_dump"):
        return response.model_dump()

    if hasattr(response, "to_dict"):
        return response.to_dict()

    return json.loads(response.model_dump_json())


def visit_payload(value: Any, visitor) -> None:
    if isinstance(value, dict):
        visitor(value)
        for child in value.values():
            visit_payload(child, visitor)
    elif isinstance(value, list):
        for child in value:
            visit_payload(child, visitor)


def collect_metadata(payload: dict[str, Any]) -> tuple[list[dict[str, str]], list[str]]:
    sources_by_url: dict[str, dict[str, str]] = {}
    queries: list[str] = []

    def visitor(node: dict[str, Any]) -> None:
        if node.get("type") == "url_citation" and node.get("url"):
            sources_by_url[node["url"]] = {
                "url": str(node["url"]),
                "title": str(node.get("title") or node.get("url")),
            }

        action = node.get("action")
        if isinstance(action, dict):
            query = action.get("query")
            if isinstance(query, str) and query not in queries:
                queries.append(query)

        for source in node.get("sources") or []:
            if isinstance(source, dict) and source.get("url"):
                sources_by_url[source["url"]] = {
                    "url": str(source["url"]),
                    "title": str(source.get("title") or source.get("url")),
                }

    visit_payload(payload, visitor)

    return list(sources_by_url.values()), queries


def parse_model_json(text: str) -> dict[str, Any] | None:
    text = text.strip()

    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        try:
            parsed = json.loads(fence.group(1))
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            pass

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            parsed = json.loads(text[start : end + 1])
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            return None

    return None


def run_match(args: argparse.Namespace) -> dict[str, Any]:
    load_local_env()

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "OPENAI_API_KEY is missing. Put it in tools/openai_web_match/.env "
            "or export it in your shell."
        )

    cv_path = Path(args.cv).expanduser().resolve()
    if not cv_path.exists():
        raise FileNotFoundError(f"CV file not found: {cv_path}")

    cv_text = compact_text(read_cv(cv_path), args.max_cv_chars)
    if len(cv_text.split()) < 40:
        raise ValueError("CV text is too short for reliable job matching.")

    domains = normalize_domains([*DEFAULT_DOMAINS, *(args.domain or [])])
    tool: dict[str, Any] = {
        "type": "web_search",
        "search_context_size": args.context_size,
    }

    if domains and not args.no_domain_filter:
        tool["filters"] = {"allowed_domains": domains}

    model = args.model or os.getenv("OPENAI_WEB_SEARCH_MODEL") or "gpt-5.5"
    client = OpenAI()
    response = client.responses.create(
        model=model,
        tools=[tool],
        tool_choice="required",
        input=build_prompt(cv_text=cv_text, role=args.role, location=args.location),
    )

    payload = response_to_dict(response)
    sources, queries = collect_metadata(payload)
    raw_text = getattr(response, "output_text", "") or ""
    result = parse_model_json(raw_text) or {"raw_text": raw_text}
    result["_meta"] = {
        "model": model,
        "cv_file": str(cv_path),
        "domain_filter": [] if args.no_domain_filter else domains,
        "web_search_queries": queries,
        "sources": sources,
    }
    if args.raw:
        result["_meta"]["raw_output_text"] = raw_text

    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Use OpenAI web_search to match a CV with Vietnam IT jobs.",
    )
    parser.add_argument("--cv", required=True, help="Path to .txt, .pdf, or .docx CV")
    parser.add_argument("--role", help="Optional target role, e.g. Backend Developer Fresher")
    parser.add_argument("--location", default="Vietnam", help="Target location")
    parser.add_argument("--model", help="Override OPENAI_WEB_SEARCH_MODEL")
    parser.add_argument(
        "--context-size",
        choices=["low", "medium", "high"],
        default="medium",
        help="How much web result context to provide to the model",
    )
    parser.add_argument(
        "--domain",
        action="append",
        help="Allowed search domain. Repeat to add domains. Defaults to major Vietnam job sites.",
    )
    parser.add_argument(
        "--no-domain-filter",
        action="store_true",
        help="Disable the default Vietnam job-site domain filter.",
    )
    parser.add_argument(
        "--max-cv-chars",
        type=int,
        default=12000,
        help="Maximum CV text characters sent to the API.",
    )
    parser.add_argument("--raw", action="store_true", help="Print raw model text too.")
    parser.add_argument("--save", help="Optional JSON output path.")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        result = run_match(args)
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    output = json.dumps(result, ensure_ascii=False, indent=2)
    print(output)

    if args.save:
        save_path = Path(args.save).expanduser().resolve()
        save_path.parent.mkdir(parents=True, exist_ok=True)
        save_path.write_text(output + "\n", encoding="utf-8")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
