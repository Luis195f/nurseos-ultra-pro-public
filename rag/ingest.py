import os, glob, pickle
from sentence_transformers import SentenceTransformer, util

CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus-es")
INDEX_PATH = os.path.join(os.path.dirname(__file__), "index-faiss.pkl")
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def iter_docs():
    for path in glob.glob(os.path.join(CORPUS_DIR, "**/*"), recursive=True):
        if os.path.isfile(path) and os.path.getsize(path)>0:
            with open(path, "rb") as f:
                try:
                    text = f.read().decode("utf-8", errors="ignore")
                except Exception:
                    continue
            yield path, text

def main():
    os.makedirs(CORPUS_DIR, exist_ok=True)
    model = SentenceTransformer(MODEL_NAME)
    texts, metas = [], []
    for path, text in iter_docs():
        texts.append(text)
        metas.append({"path": path})
    if not texts:
        print("No hay documentos en corpus-es/.")
        return
    emb = model.encode(texts, convert_to_tensor=True, show_progress_bar=True)
    with open(INDEX_PATH, "wb") as f:
        pickle.dump({"emb": emb.cpu(), "metas": metas, "model": MODEL_NAME, "texts": texts}, f)
    print("Índice RAG creado:", INDEX_PATH)

if __name__ == "__main__":
    main()
