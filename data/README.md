# Data Directory

## Files

- `demo_questions.json` - 5 standardized demo questions for testing
- `sample_articles.jsonl` - 50 sample articles (25 relevant: 5 per question + 25 random)
- `pubmed_articles.jsonl` - Full dataset (~25,000 articles)

## Demo Questions Schema

`demo_questions.json` contains 5 standardized medical research questions:

```json
[
  {
    "id": 1,
    "category": "Treatment Comparison",
    "query": "What are the latest findings comparing GLP-1 receptor agonists versus SGLT2 inhibitors for type 2 diabetes management?"
  }
]
```

Use these questions to test your search implementation and ensure consistent results.

## Article Schema

Each line in the JSONL files is a JSON object with this structure:

```json
{
  "pmid": "35695847",
  "title": "International Committee on Systematics of Prokaryotes...",
  "abstract": "Minutes of the closed meeting of the International Committee...",
  "authors": "Mousavi SA, Young JPW",
  "journal": "International journal of systematic and evolutionary microbiology",
  "year": 2022,
  "doi": "10.1099/ijsem.0.005453",
  "sjr_quartile": 1,
  "sjr_rank": 0.752
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `pmid` | string | PubMed unique identifier |
| `title` | string | Article title |
| `abstract` | string | Full abstract text (all segments concatenated) |
| `authors` | string | Comma-separated list of authors (LastName Initials format) |
| `journal` | string | Full journal name |
| `year` | integer | Publication year |
| `doi` | string | Digital Object Identifier (may be empty) |
| `sjr_quartile` | integer | Scimago Journal Rank quartile (1-4, null if unavailable) |
| `sjr_rank` | float | Scimago Journal Rank score (null if unavailable) |