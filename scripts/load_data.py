"""
Load PubMed articles data into MongoDB.

Loads both sample_articles.jsonl and pubmed_articles.jsonl into separate collections
with appropriate indexes for efficient searching.
"""

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

from pymongo import ASCENDING, TEXT, MongoClient
from pymongo.errors import BulkWriteError

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "medical_search"
DATA_DIR = Path("/data")
BATCH_SIZE = 1000


def load_jsonl(file_path: Path) -> List[Dict[str, Any]]:
    """Load JSONL file into list of dictionaries."""
    print(f"Loading {file_path.name}...")
    documents = []

    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            try:
                doc = json.loads(line.strip())
                documents.append(doc)
            except json.JSONDecodeError as e:
                print(f"Warning: Skipping line {line_num} due to JSON error: {e}")
                continue

    print(f"Loaded {len(documents):,} documents from {file_path.name}")
    return documents


def insert_documents_batch(collection, documents: List[Dict[str, Any]], batch_size: int = BATCH_SIZE):
    """Insert documents in batches to avoid memory issues."""
    total = len(documents)
    inserted = 0

    for i in range(0, total, batch_size):
        batch = documents[i:i + batch_size]
        try:
            result = collection.insert_many(batch, ordered=False)
            inserted += len(result.inserted_ids)
            print(f"Inserted {inserted:,}/{total:,} documents...")
        except BulkWriteError as e:
            # Some documents might already exist (duplicate _id), continue anyway
            inserted += e.details.get('nInserted', 0)
            print(f"Partial insert: {inserted:,}/{total:,} documents (some may be duplicates)")

    return inserted


def create_indexes(collection, collection_name: str):
    """Create indexes for efficient searching and filtering."""
    print(f"Creating indexes for {collection_name}...")

    # Text index for full-text search on title and abstract
    collection.create_index(
        [("title", TEXT), ("abstract", TEXT)],
        name="text_search_idx"
    )

    # Index on year for filtering
    collection.create_index([("year", ASCENDING)], name="year_idx")

    # Index on journal for filtering
    collection.create_index([("journal", ASCENDING)], name="journal_idx")

    # Index on PMID for quick lookups
    collection.create_index([("pmid", ASCENDING)], name="pmid_idx")

    print(f"Indexes created for {collection_name}")


def load_collection(db, collection_name: str, data_file: Path, title: str):
    """Load data from JSONL file into a MongoDB collection."""
    if not data_file.exists():
        print(f"Warning: {data_file} not found, skipping {collection_name}\n")
        return False

    print("=" * 60)
    print(title)
    print("=" * 60)

    # Load documents from file
    documents = load_jsonl(data_file)
    collection = db[collection_name]

    # Clear existing data
    existing_count = collection.count_documents({})
    if existing_count > 0:
        print(f"Clearing {existing_count:,} existing documents...")
        collection.delete_many({})

    # Insert documents in batches
    inserted = insert_documents_batch(collection, documents)
    print(f"Total inserted: {inserted:,} documents\n")

    # Create indexes
    create_indexes(collection, collection_name)
    print()

    return True


def main():
    """Main function to load data into MongoDB."""
    print("Starting data load process...\n")

    # Connect to MongoDB
    print("Connecting to MongoDB...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.server_info()  # Force connection check
        print("Connected to MongoDB\n")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)

    db = client[DATABASE_NAME]

    # Load sample articles
    load_collection(
        db=db,
        collection_name="sample_articles",
        data_file=DATA_DIR / "sample_articles.jsonl",
        title="LOADING SAMPLE ARTICLES"
    )

    # Load full dataset
    load_collection(
        db=db,
        collection_name="pubmed_articles",
        data_file=DATA_DIR / "pubmed_articles.jsonl",
        title="LOADING FULL PUBMED DATASET"
    )

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Database: {DATABASE_NAME}")
    print(f"Collections:")
    print(f"  - sample_articles: {db['sample_articles'].count_documents({}):,} documents")
    print(f"  - pubmed_articles: {db['pubmed_articles'].count_documents({}):,} documents")
    print()
    print("Data load complete!")
    print()
    print("You can view the data at: http://localhost:8081")
    print("   (Mongo Express - username: admin, password: admin)")

    client.close()


if __name__ == "__main__":
    main()
