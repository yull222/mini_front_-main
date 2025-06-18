from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
from bs4 import BeautifulSoup
from readability import Document
import google.generativeai as genai
import os
import hashlib
import json
import time
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Dict, Tuple, Optional

# 환경변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)

# Rate limiting 설정
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per hour"])

# Gemini API 설정
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("⚠️  GOOGLE_API_KEY가 설정되지 않았습니다.")


class GeminiSummarizer:
    def __init__(self):
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = timedelta(hours=24)

        # Gemini 모델 초기화
        if GOOGLE_API_KEY:
            self.model = genai.GenerativeModel("gemini-2.5-flash")

            # 생성 설정
            self.generation_config = genai.types.GenerationConfig(
                temperature=0.3,  # 일관성 있는 요약을 위한 낮은 온도
                max_output_tokens=800,
                top_p=0.8,
                top_k=40,
            )

    def _clean_expired_cache(self):
        """만료된 캐시 항목 정리"""
        current_time = datetime.now()
        expired_keys = [
            key
            for key, expiry_time in self.cache_expiry.items()
            if current_time > expiry_time
        ]
        for key in expired_keys:
            self.cache.pop(key, None)
            self.cache_expiry.pop(key, None)

    def _create_cache_key(self, text: str, settings: Dict) -> str:
        """텍스트와 설정을 기반으로 캐시 키 생성"""
        content = text + json.dumps(settings, sort_keys=True)
        return hashlib.md5(content.encode()).hexdigest()

    def _extract_main_content(self, url: str) -> Tuple[str, str]:
        """웹페이지에서 주요 콘텐츠 추출"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }

        try:
            session = requests.Session()
            session.headers.update(headers)

            response = session.get(url, timeout=20, allow_redirects=True)
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            response.encoding = "utf-8"  # 강제 설정

            # readability로 주요 콘텐츠 추출
            doc = Document(response.text)
            title = doc.title()
            content_html = doc.summary()

            # BeautifulSoup로 텍스트 정리
            soup = BeautifulSoup(content_html, "html.parser")

            # 불필요한 태그 제거
            for tag in soup(
                [
                    "script",
                    "style",
                    "nav",
                    "footer",
                    "header",
                    "aside",
                    "advertisement",
                    "iframe",
                    "noscript",
                    "form",
                ]
            ):
                tag.decompose()

            text_content = soup.get_text(separator=" ", strip=True)
            cleaned_text = re.sub(r"\s+", " ", text_content).strip()

            # 의미 있는 문장만 필터링
            sentences = re.split(r"[.!?]+", cleaned_text)
            meaningful_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
            final_text = ". ".join(meaningful_sentences)

            return title, final_text

        except Exception as e:
            raise Exception(f"웹페이지 접근 실패: {str(e)}")

    def _create_summary_prompt(
        self, text: str, length: str, style: str = "neutral"
    ) -> str:
        """Gemini용 최적화된 요약 프롬프트 생성"""
        length_instructions = {
            "short": "2-3문장으로 핵심만 간결하게",
            "medium": "4-5문장으로 주요 내용을 포괄적으로",
            "long": "6-8문장으로 상세하고 체계적으로",
        }

        style_instructions = {
            "neutral": "객관적이고 중립적인 톤으로",
            "casual": "친근하고 이해하기 쉬운 톤으로",
            "professional": "전문적이고 정확한 톤으로",
        }

        prompt = f"""다음 웹페이지 내용을 반드시 {length_instructions.get(length, '4-5문장')} 이내로, 핵심 정보만 포함하여 요약하세요.

요약 조건:
- 최대 3 문장을 넘기지 마세요
- 가장 중요한 핵심 정보와 논점을 포함하세요
- 반복, 수식어, 배경 설명은 제외하세요
- 자연스럽고 읽기 쉬운 한국어로 작성하세요
- 단문 위주로 요약하세요

웹페이지 내용:
{text}

요약:"""

        return prompt

    def gemini_summarize(
        self, text: str, length: str = "short", style: str = "neutral"
    ) -> Dict:
        """Gemini API를 사용한 고품질 요약"""
        self._clean_expired_cache()

        settings = {"length": length, "style": style, "model": "gemini-2.5-flash"}
        cache_key = self._create_cache_key(text, settings)

        # 캐시 확인
        if cache_key in self.cache:
            return self.cache[cache_key]

        # 텍스트 길이 제한 (Gemini Pro의 컨텍스트 윈도우 고려)
        max_length = 25000
        if len(text) > max_length:
            front_part = text[: max_length // 2]
            back_part = text[-(max_length // 2) :]
            text = front_part + "\n\n[중간 내용 생략]\n\n" + back_part

        try:
            prompt = self._create_summary_prompt(text, length, style)

            response = self.model.generate_content(
                prompt, generation_config=self.generation_config
            )

            if not response.text:
                raise Exception("Gemini API에서 빈 응답을 받았습니다.")

            summary = response.text.strip()

            if len(summary) < 20:
                raise Exception("생성된 요약이 너무 짧습니다.")

            result = {"summary": summary, "model": "gemini-pro", "success": True}

            # 캐시에 저장
            self.cache[cache_key] = result
            self.cache_expiry[cache_key] = datetime.now() + self.cache_duration

            return result

        except Exception as e:
            print(f"Gemini API 오류: {str(e)}")
            fallback_summary = self._extractive_fallback(text, length)
            return {
                "summary": fallback_summary,
                "model": "extractive_fallback",
                "success": False,
                "error": str(e),
            }

    def _extractive_fallback(self, text: str, length: str) -> str:
        """API 실패 시 사용할 추출 요약"""
        sentences = re.split(r"[.!?]+", text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 15]

        if not sentences:
            return "요약할 수 있는 내용이 없습니다."

        sentence_count = {"short": 2, "medium": 4, "long": 6}.get(length, 4)

        if len(sentences) <= sentence_count:
            return ". ".join(sentences) + "."

        # 고급 문장 점수 계산
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            # 위치 점수
            if i < len(sentences) * 0.3:
                position_score = 1.0
            elif i > len(sentences) * 0.7:
                position_score = 0.8
            else:
                position_score = 0.6

            # 길이 점수
            length_score = min(len(sentence) / 80, 1.0)

            # 키워드 밀도 점수
            words = sentence.split()
            important_words = [w for w in words if len(w) > 4 and w.isalpha()]
            keyword_score = len(important_words) / max(len(words), 1)

            total_score = position_score + length_score + keyword_score
            scored_sentences.append((sentence, total_score))

        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        top_sentences = [s[0] for s in scored_sentences[:sentence_count]]

        # 원래 순서대로 재정렬
        original_order_sentences = []
        for sentence in sentences:
            if sentence in top_sentences:
                original_order_sentences.append(sentence)

        return ". ".join(original_order_sentences) + "."


# 전역 요약기 인스턴스
summarizer = GeminiSummarizer()


@app.route("/")
def home():
    return "Flask summarizer is running!"


@app.route("/summarize", methods=["POST"])
@limiter.limit("15 per minute")
def summarize_url():
    start_time = time.time()
    data = request.get_json()

    url = data.get("url")
    length = data.get("length", "short")
    style = data.get("style", "neutral")
    use_ai = data.get("use_ai", True)

    if not url:
        return jsonify({"error": "URL이 제공되지 않았습니다."}), 400

    # URL 형식 검증
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        # 1. 웹페이지 콘텐츠 추출
        title, text_content = summarizer._extract_main_content(url)

        if len(text_content) < 100:
            return (
                jsonify(
                    {
                        "error": "요약할 내용이 충분하지 않습니다. (최소 100자 필요)",
                        "extracted_length": len(text_content),
                    }
                ),
                400,
            )

        # 2. 요약 생성
        if use_ai and GOOGLE_API_KEY:
            result = summarizer.gemini_summarize(text_content, length, style)
            summary = result["summary"]
            summary_method = (
                f"AI 요약 (Gemini)"
                if result["success"]
                else "추출 요약 (AI 실패로 대체)"
            )
        else:
            summary = summarizer._extractive_fallback(text_content, length)
            summary_method = "추출 요약"

        # 3. 결과 통계 계산
        processing_time = round(time.time() - start_time, 2)
        compression_ratio = round((len(summary) / len(text_content)) * 100, 2)

        return (
            jsonify(
                {
                    "title": title,
                    "summary": summary,
                    "original_text_length": len(text_content),
                    "summary_length": len(summary),
                    "compression_ratio": compression_ratio,
                    "summary_method": summary_method,
                    "processing_time": processing_time,
                    "settings": {"length": length, "style": style, "use_ai": use_ai},
                    "timestamp": datetime.now().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "error": f"처리 중 오류 발생: {str(e)}",
                    "processing_time": round(time.time() - start_time, 2),
                }
            ),
            500,
        )


@app.route("/health", methods=["GET"])
def health_check():
    """서비스 상태 확인"""
    return (
        jsonify(
            {
                "status": "healthy",
                "gemini_available": bool(GOOGLE_API_KEY),
                "cache_size": len(summarizer.cache),
                "timestamp": datetime.now().isoformat(),
            }
        ),
        200,
    )


if __name__ == "__main__":
    if not GOOGLE_API_KEY:
        print("⚠️  GOOGLE_API_KEY가 설정되지 않았습니다. 추출 요약만 사용 가능합니다.")
        print(
            "   Google AI Studio(https://aistudio.google.com)에서 API 키를 발급받으세요."
        )
    else:
        print("✅ Gemini API가 성공적으로 설정되었습니다.")

    app.run(debug=True, port=5000)
