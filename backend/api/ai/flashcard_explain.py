from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("AI_API_KEY"))


def generate_flashcard_explanation(word, meaning, user_question=None):
    """
    Generate explanation for a flashcard using Gemini AI.

    Args:
        word (str): The English word/phrase
        meaning (str): The Vietnamese meaning
        user_question (str, optional): User's specific question about the word

    Returns:
        str: AI's explanation in Vietnamese

    Raises:
        Exception: If AI call fails
    """
    # Construct the prompt
    base_prompt = (
        f"Bạn là trợ lý dạy tiếng Anh. Giải thích từ vựng sau cho học viên người Việt:\n\n"
        f"Từ: {word}\n"
        f"Nghĩa: {meaning}\n\n"
    )

    if user_question:
        prompt = (
            f"{base_prompt}"
            f"Câu hỏi của học viên: {user_question}\n\n"
            f"Hãy trả lời câu hỏi của học viên một cách chi tiết, dễ hiểu. "
            f"Giải thích bằng tiếng Việt, có thể đưa thêm ví dụ minh họa. "
            f"Độ dài khoảng 3-5 câu."
        )
    else:
        prompt = (
            f"{base_prompt}"
            f"Hãy giải thích:\n"
            f"1. Cách phát âm và lưu ý phát âm (nếu có)\n"
            f"2. Cách sử dụng từ này trong câu\n"
            f"3. Các từ đồng nghĩa hoặc trái nghĩa phổ biến\n"
            f"4. 1-2 ví dụ câu minh họa\n\n"
            f"Giải thích bằng tiếng Việt, ngắn gọn, dễ hiểu. Độ dài khoảng 4-6 câu."
        )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        explanation = response.text.strip()

        # Fallback if response is empty
        if not explanation:
            return "Xin lỗi, AI không thể tạo giải thích cho từ này. Vui lòng thử lại."

        return explanation

    except Exception as e:
        error_message = str(e)
        print(f"Error in generate_flashcard_explanation: {error_message}")

        # Handle 503 UNAVAILABLE (model overloaded)
        if "503" in error_message and "UNAVAILABLE" in error_message:
            return "Server AI đang hơi bận, bạn hãy đợi một chút và thử lại nhé 😊"

        # Re-raise for view to handle
        raise
