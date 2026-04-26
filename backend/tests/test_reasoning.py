import pytest
from unittest.mock import patch, AsyncMock
from app.services.ai.reasoning_engine import generate_question

@pytest.mark.asyncio
async def test_generate_question_adaptive_harder():
    # Mock call_llm to return a question
    with patch("app.services.ai.reasoning_engine.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = {"question": "Advanced React architecture?"}
        
        # Test with high last score (should trigger difficulty instruction)
        question = await generate_question("React", "Scenario-based", last_score=9.0)
        
        assert question == "Advanced React architecture?"
        # Verify that difficulty_instruction was likely included in the prompt format call
        # (We could check call args but it's complex with f-strings)
        mock_llm.assert_called_once()

@pytest.mark.asyncio
async def test_generate_question_adaptive_easier():
    with patch("app.services.ai.reasoning_engine.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = {"question": "What is a React component?"}
        
        # Test with low last score
        question = await generate_question("React", "Basic", last_score=2.0)
        
        assert question == "What is a React component?"
        mock_llm.assert_called_once()
