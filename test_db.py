from sqlalchemy import create_engine, text
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))
    print(result.scalar())





# @app.post("/summarize/{audio_id}")
# async def summarize(audio_id: str):
#     db = SessionLocal()
#     try:
#         record = db.query(Transcript).filter(Transcript.id == audio_id).first()
#         if not record:
#             return {"error": "ID which you entered NOT FOUND"}
        
#         summary = summarize_transcript(record.content)

#         # Save summary to file
#         summary_path = f"storage/summaries/{audio_id}.txt"
#         with open(summary_path, "w") as f:
#             f.write(summary)

#         return {
#             "audio_id": audio_id,
#             "summary": summary
#         }
#     finally:
#         db.close()