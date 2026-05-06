from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
from fastapi.responses import Response

import models, schemas, database, ml_utils

# Create tables
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Warning: Tables might not be created. {e}")

app = FastAPI(title="Customer Segmentation API")

# Setup CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Customer Segmentation API is running."}

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Preprocess to get scaled data and feature list
        df_cleaned, df_scaled, features = ml_utils.preprocess_data(df)
        
        # Calculate elbow method data (default up to k=10)
        elbow_data = ml_utils.calculate_elbow(df_scaled)
        
        # Store in DB
        db_session = models.AnalysisSession(
            filename=file.filename,
            original_data=df.to_json(orient='records'),
            processed_data=df_scaled.to_json(orient='records')
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        # Return summary info to frontend
        preview = df_cleaned.head(10).fillna("").to_dict(orient='records')
        
        return {
            "session_id": db_session.id,
            "filename": file.filename,
            "columns": df.columns.tolist(),
            "numeric_columns": features,
            "row_count": len(df),
            "preview": preview,
            "elbow_data": elbow_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster/{session_id}")
async def perform_clustering(session_id: int, request: schemas.ClusterRequest, db: Session = Depends(database.get_db)):
    db_session = db.query(models.AnalysisSession).filter(models.AnalysisSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found.")
        
    try:
        # Load data
        df = pd.read_json(io.StringIO(db_session.original_data))
        df_scaled = pd.read_json(io.StringIO(db_session.processed_data))
        
        # Perform clustering
        df_clustered, cluster_stats = ml_utils.perform_clustering(
            df, df_scaled, request.features, request.k
        )
        
        # Save results to DB
        db_session.k_value = request.k
        db_session.cluster_results = df_clustered.to_json(orient='records')
        db_session.insights = json.dumps(cluster_stats)
        db.commit()
        
        # Create a smaller preview of clustered data for visualization
        # Also limit rows to avoid massive payload size (e.g., 500 rows for scatter plot)
        sample_size = min(len(df_clustered), 500)
        scatter_data = df_clustered.sample(sample_size).fillna("").to_dict(orient='records')
        
        return {
            "session_id": session_id,
            "k_value": request.k,
            "cluster_stats": cluster_stats,
            "scatter_data": scatter_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{session_id}")
async def download_results(session_id: int, db: Session = Depends(database.get_db)):
    db_session = db.query(models.AnalysisSession).filter(models.AnalysisSession.id == session_id).first()
    if not db_session or not db_session.cluster_results:
        raise HTTPException(status_code=404, detail="Clustered data not found.")
        
    df_clustered = pd.read_json(io.StringIO(db_session.cluster_results))
    csv_data = df_clustered.to_csv(index=False)
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=clustered_{db_session.filename}"}
    )
