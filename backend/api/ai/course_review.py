from google import genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("AI_API_KEY"))

def generate_course_suggestion_from_database(user_prompt, course_data):
    """
    Generate course suggestions based on user prompt and course data from the database.

    Args:
        user_prompt (str): The user's input prompt.
        course_data (list): List of course data dictionaries from the database.
                           Each course should have: id, title, description, language, level

    Returns:
        dict: {
            "course_ids": [list of recommended course IDs],
            "explanation": "Explanation text in Vietnamese"
        }
    """
    # Format course data for AI
    courses_info = "\n".join([
        f"ID: {course['id']}\n"
        f"Tiêu đề: {course['title']}\n"
        f"Mô tả: {course['description']}\n"
        f"Ngôn ngữ: {course['language']}\n"
        f"Cấp độ: {course['level']}\n"
        for course in course_data
    ])

    # System prompt
    system_message = (
        "Bạn là chuyên gia tư vấn khóa học tiếng Anh. "
        "Nhiệm vụ của bạn là dựa trên yêu cầu của người học và danh sách các khóa học có sẵn, "
        "hãy chọn ra 3-5 khóa học phù hợp nhất.\n\n"
        "Trả về kết quả dưới dạng JSON với format:\n"
        "{\n"
        '  "course_ids": [1, 2, 3],\n'
        '  "explanation": "Dựa trên yêu cầu của bạn về..., tôi đề xuất các khóa học sau: ..."\n'
        "}\n\n"
        "Lưu ý:\n"
        "- explanation phải bằng tiếng Việt, dài khoảng 2-4 câu, thân thiện và chuyên nghiệp. Trong câu explanation không cần nói đích danh tên khóa học mình gợi ý cho người học mình đang tư vấn.\n"
        "- Chỉ chọn 3-5 khóa học phù hợp nhất. Không sử dụng các từ chỉ số lượng để đếm số lượng khóa học, vì dựa trên các khóa học bạn đề xuất, tôi còn xem xét lại lần nữa để biết có thực sự gợi ý khóa học đó không.\n"
        "- course_ids phải là danh sách các ID có trong dữ liệu được cung cấp\n"
        "- Nếu không có khóa học phù hợp, trả về course_ids rỗng [] và giải thích lý do"
    )

    # User message
    user_message = (
        f"Yêu cầu của người học: {user_prompt}\n\n"
        f"Danh sách các khóa học có sẵn:\n{courses_info}\n\n"
        "Hãy đề xuất các khóa học phù hợp nhất và trả về JSON theo format đã nêu."
    )

    try:
        # Call Gemini API
        # Gemini doesn't support "system" role, so combine system message with user message
        combined_message = f"{system_message}\n\n{user_message}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=combined_message
        )

        # Extract response text
        response_text = response.text.strip()
        
        # Try to parse JSON from response
        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        result = json.loads(response_text)
        
        # Validate result structure
        if "course_ids" not in result or "explanation" not in result:
            raise ValueError("Invalid response format from AI")
        
        return result
        
    except json.JSONDecodeError:
        # Fallback: return empty result with error explanation
        return {
            "course_ids": [],
            "explanation": "Xin lỗi, AI đang gặp sự cố khi phân tích yêu cầu của bạn. Vui lòng thử lại."
        }
    except Exception as e:
        error_message = str(e)
        print(f"Error in generate_course_suggestion_from_database: {error_message}")
        
        # Check if it's a 503 UNAVAILABLE error (model overloaded)
        if "503" in error_message and "UNAVAILABLE" in error_message:
            return {
                "course_ids": [],
                "explanation": "Server đang hơi mệt một xíu, bạn hãy đợi một xíu và thử lại nha 😊"
            }
        
        return {
            "course_ids": [],
            "explanation": "Đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau."
        }
