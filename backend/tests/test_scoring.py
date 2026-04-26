import pytest
from app.services.ai.scoring_engine import calculate_weighted_score, get_skill_level

def test_calculate_weighted_score_perfect():
    # 10 across all levels
    scores = [
        {"difficulty": "Basic", "score": 10.0},
        {"difficulty": "Intermediate", "score": 10.0},
        {"difficulty": "Scenario-based", "score": 10.0}
    ]
    result = calculate_weighted_score(scores)
    assert result == 10.0

def test_calculate_weighted_score_weighted():
    # Basic: 10 * 0.3 = 3.0
    # Intermediate: 5 * 0.3 = 1.5
    # Scenario: 7 * 0.4 = 2.8
    # Total: 7.3
    scores = [
        {"difficulty": "Basic", "score": 10.0},
        {"difficulty": "Intermediate", "score": 5.0},
        {"difficulty": "Scenario-based", "score": 7.0}
    ]
    result = calculate_weighted_score(scores)
    assert result == 7.3

def test_skill_level():
    assert get_skill_level(2.5) == "Beginner"
    assert get_skill_level(5.0) == "Intermediate"
    assert get_skill_level(8.5) == "Strong"
