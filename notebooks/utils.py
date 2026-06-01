## DO NOT MODIFY ##
from typing import Any
from qdrant_client.http.models.models import QueryResponse
from typing import Callable
from datasets import Dataset
from typing import cast

EXPECTED_AVG_PRECISION = 0.8

def calculate_precision(retrieved_docs: list[int], relevant_docs: list[int]) -> float:
    if not retrieved_docs:
        return 0.0
    
    relevant_retrieved = len(set(retrieved_docs) & set(relevant_docs))
    return relevant_retrieved / len(retrieved_docs)

def evaluate_retrieval(rag_context_retrieval: Callable[[dict[str, Any]], QueryResponse], query_dataset: Dataset) -> float:
    total_precision: float = 0.0
    
    for i in range(len(query_dataset)):
        query: dict[str, Any] = cast(dict[str, Any], query_dataset[i])
        
        query_response: QueryResponse = rag_context_retrieval(query)
        retrieved_docs: list[int] = [cast(int, point.id) for point in query_response.points]
        
        relevant_docs: list[int] = query["result"]["point_ids"]
        
        precision: float = calculate_precision(retrieved_docs, relevant_docs)
        total_precision += precision
    
    achieved_precision = total_precision / len(query_dataset) if len(query_dataset) > 0 else 0.0

    if achieved_precision >= EXPECTED_AVG_PRECISION:
        print(f"You achieved {achieved_precision} enough to pass ✅!")
    else:
        print(f"Expected average precision of {EXPECTED_AVG_PRECISION}, got {achieved_precision} ❌")

## END OF DO NOT MODIFY ##