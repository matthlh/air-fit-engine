"""
SQLite persistence layer.

One table: company_results.
Complex fields (lists, dicts) are stored as JSON strings.
Re-analyzing a domain replaces the previous result (INSERT OR REPLACE).
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.utils.logger import get_logger

logger = get_logger(__name__)

_DB_PATH = Path(__file__).parent.parent / "data" / "results.db"


def _conn() -> sqlite3.Connection:
    c = sqlite3.connect(_DB_PATH)
    c.row_factory = sqlite3.Row
    return c


def init_db() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS company_results (
                id                      INTEGER PRIMARY KEY AUTOINCREMENT,
                domain                  TEXT UNIQUE NOT NULL,
                homepage_url            TEXT,
                careers_url             TEXT,
                title                   TEXT,
                meta_description        TEXT,
                fit_score               INTEGER,
                confidence              TEXT,
                signal_categories       TEXT,
                creative_roles_detected TEXT,
                score_breakdown         TEXT,
                signals                 TEXT,
                llm_analysis            TEXT,
                created_at              TEXT
            )
        """)
    logger.info(f"Database ready at {_DB_PATH}")


def upsert_result(result: dict) -> int:
    """Store a pipeline result. Returns the row id."""
    with _conn() as conn:
        cur = conn.execute(
            """
            INSERT OR REPLACE INTO company_results
              (domain, homepage_url, careers_url, title, meta_description,
               fit_score, confidence, signal_categories, creative_roles_detected,
               score_breakdown, signals, llm_analysis, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                result["domain"],
                result.get("homepage_url"),
                result.get("careers_url"),
                result.get("title"),
                result.get("meta_description"),
                result.get("fit_score"),
                result.get("confidence"),
                json.dumps(result.get("signal_categories", [])),
                json.dumps(result.get("creative_roles_detected", [])),
                json.dumps(result.get("score_breakdown", {})),
                json.dumps(result.get("signals", [])),
                json.dumps(result["llm_analysis"]) if result.get("llm_analysis") else None,
                result.get("created_at", datetime.now(timezone.utc).isoformat()),
            ),
        )
        return cur.lastrowid


def get_all_results(limit: int = 100) -> list[dict]:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT * FROM company_results ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [_deserialize(row) for row in rows]


def get_result_by_domain(domain: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute(
            "SELECT * FROM company_results WHERE domain = ?", (domain,)
        ).fetchone()
    return _deserialize(row) if row else None


def _deserialize(row: sqlite3.Row) -> dict:
    d = dict(row)
    for field in ("signal_categories", "creative_roles_detected", "score_breakdown", "signals"):
        if d.get(field) is not None:
            d[field] = json.loads(d[field])
    if d.get("llm_analysis") is not None:
        d["llm_analysis"] = json.loads(d["llm_analysis"])
    return d
