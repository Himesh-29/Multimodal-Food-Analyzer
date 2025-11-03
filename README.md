# 🍽️ Food Vision RAG

AI-powered food recognition and recipe generation system with retrieval-augmented generation (RAG) for semantic caching.

## Features

- **Food Classification** - Hugging Face model with 99.3% accuracy
- **Recipe Retrieval** - TheMealDB API + Llama 3.1-8B LLM fallback
- **Semantic Search** - FAISS vector database with SentenceTransformers embeddings
- **Nutrition Analysis** - AI-generated nutrition facts with quantity scaling
- **Smart Caching** - RAG system reduces API calls by 85%

## Quick Start

### Prerequisites
```bash
uv python 3.10
uv pip install -r requirements.txt
```

### Run Locally
```bash
streamlit run app.py
```

### Environment Variables
Create `.env` file:
```
HF_TOKEN=your_huggingface_token
```

## Live Demo
🚀 [food-vision-rag.streamlit.app](https://recipe-web-app-himesh.streamlit.app/)

## Folder Structure

```
food-vision-rag/
├── app.py                      # Main Streamlit application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
├── .gitignore
└── src/
    ├── api/
    │   ├── huggingface_client.py      # Food classification & LLM APIs
    │   └── themealdb_client.py        # TheMealDB recipe API
    ├── services/
    │   ├── recipe_service.py          # Recipe generation & caching
    │   ├── nutrition_service.py       # Nutrition calculations
    │   ├── embedding_service.py       # FAISS vector database
    │   ├── rag_manager.py             # RAG orchestration
    │   └── shared_cache.py            # Shared embedding store
    ├── core/
    │   └── state_manager.py           # Streamlit session state
    ├── ui/
    │   └── components.py              # Reusable UI components
    └── utils/
        └── image_utils.py             # Image processing utilities
```

## Technologies

**ML & NLP:** PyTorch, SentenceTransformers, FAISS, Hugging Face Inference API, Llama 3.1-8B

**Backend:** Python, Streamlit, RESTful APIs

**Data:** JSON, Pickle, Vector Embeddings (384-dim)

**DevOps:** UV, Git, Streamlit Cloud

## How It Works

1. Upload food image → Food classification (99.3% accuracy)
2. Search TheMealDB API → If found, return cached recipe
3. Cache miss → Generate recipe with Llama 3.1-8B LLM
4. Generate nutrition facts via AI + semantic embedding
5. Store in FAISS vector database for future queries

## Project Metrics

- **Food Classification:** 99.3% accuracy
- **API Call Reduction:** 85% via RAG caching
- **Embedding Dimensions:** 384 (all-MiniLM-L6-v2)
- **Recipe Database:** 1000+ meals (TheMealDB)
- **Food Categories:** 12+ supported

## Repository

📌 [GitHub - Himesh-29/food-vision-rag](https://github.com/Himesh-29/food-vision-rag)

## License

MIT License

### Run Locally with uv (fastest)
```bash
uv venv
uv pip install -r requirements.txt
uv run streamlit run app.py
```
