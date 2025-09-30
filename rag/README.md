# RAG en español (esqueleto)

Coloca tus guías y protocolos (PDF/MD) en `rag/corpus-es/`. Ejecuta:

```bash
pip install -r rag/requirements.txt
python rag/ingest.py
python rag/search_api.py  # opcional API de búsqueda local
```

Por defecto utiliza un encoder multilingüe (descarga al primer uso).
