# OpenAI Web Job Match Helper

Local prototype for using the OpenAI Responses API with the hosted `web_search` tool to find Vietnam IT jobs from a CV.

## Setup

From the repo root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r tools/openai_web_match/requirements.txt
```

Create a local env file:

```bash
cp tools/openai_web_match/.env.example tools/openai_web_match/.env
```

Then edit `tools/openai_web_match/.env` and set:

```bash
OPENAI_API_KEY=sk-
```

That file is locally ignored by Git.

## Run

```bash
.venv/bin/python tools/openai_web_match/openai_web_job_match.py \
  --cv sample_cvs/ai_ml_fresher_do_an_khang.txt \
  --role "AI/ML Engineer Fresher" \
  --location "Vietnam"
```

Save output:

```bash
.venv/bin/python tools/openai_web_match/openai_web_job_match.py \
  --cv sample_cvs/qa_intern_pham_gia_huy.txt \
  --role "QA Engineer Intern" \
  --save storage/app/openai-job-match.json
```

## Notes

- Defaults search toward `itviec.com`, `vietnamworks.com`, and `linkedin.com`.
- Use `--domain topcv.vn` or `--domain careerbuilder.vn` to add more Vietnam job sites.
- Use `--no-domain-filter` if you want broader web results.
- Use `--raw` if you want to inspect the model text before JSON parsing.

## Use In The Web App

The Laravel page at `/career-match` has two modes:

- `Fast demo`: no API call, uses the deterministic local matcher.
- `Live web`: calls the OpenAI Responses API with `web_search`.

For local hackathon testing, the web app can read `OPENAI_API_KEY` from this ignored file:

```bash
tools/openai_web_match/.env
```

For deployment or teammate machines, prefer the normal root Laravel `.env`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_WEB_SEARCH_MODEL=gpt-5.5
OPENAI_WEB_SEARCH_DOMAINS=itviec.com,vietnamworks.com,linkedin.com
```
