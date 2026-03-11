# Basic FastAPI server for voice agent functionality
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="GrowAI Voice Agent API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GrowAI Voice Agent API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/voice/call")
async def initiate_call():
    # Placeholder for voice call functionality
    return {"message": "Voice call feature - implementation needed"}

@app.post("/voice/assistant")
async def create_assistant():
    # Placeholder for assistant creation
    return {"message": "Assistant creation feature - implementation needed"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
