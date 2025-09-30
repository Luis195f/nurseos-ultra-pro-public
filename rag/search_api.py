import pickle, os
from fastapi import FastAPI, Query
from sentence_transformers import SentenceTransformer, util
import torch

INDEX_PATH = os.path.join(os.path.dirname(__file__), "index-faiss.pkl")
app = FastAPI(title="RAG Search ES")

@app.get("/search")
def search(q: str = Query(...), k: int = 3):
    with open(INDEX_PATH, "rb") as f:
        idx = pickle.load(f)
    model = SentenceTransformer(idx["model"])
    qv = model.encode([q], convert_to_tensor=True)
    sims = util.cos_sim(qv, idx["emb"]).squeeze(0)
    topk = torch.topk(sims, k)
    results = []
    for score, i in zip(topk.values.tolist(), topk.indices.tolist()):
        results.append({"score": float(score), "path": idx["metas"][i]["path"], "text": idx["texts"][i][:500]})
    return {"q": q, "results": results}
