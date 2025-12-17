# XP Rewards Configuration
XP_REWARDS = {
    "learn_new": 40,                    # XP for learning new flashcards
    "daily_review_per_card": 8,         # XP per card reviewed (effort)
    "daily_review_per_remembered": 5,   # Bonus XP per card remembered (result)
    # Formula: (total_cards * per_card) + (remembered_cards * per_remembered)
    # Example: Review 10 cards, remember 7 -> (10*8) + (7*5) = 80 + 35 = 115 XP
}

# Review Intervals (in days)
REVIEW_INTERVALS = {
    0: 0,    # Chưa nhớ → ôn ngay hôm nay
    1: 1,    # 1 ngày
    2: 3,    # 3 ngày
    3: 7,    # 7 ngày
    4: 14,   # 14 ngày
    5: 30,   # 30 ngày
    6: 60,   # 60 ngày
    7: 90,   # 90 ngày (max)
}

# AI Models
AI_MODEL = "gemini-2.5-flash"
