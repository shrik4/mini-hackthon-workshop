import google.generativeai as genai
import json
import asyncio
import random
from typing import List
from pydantic import ValidationError

from models import MarketResearch, Feature, Competitor


class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    async def _retry_with_backoff(self, func, max_retries: int = 4, base_delay: float = 1.0):
        """Retry function with exponential backoff for 503 errors"""
        last_error = None
        
        for attempt in range(max_retries + 1):
            try:
                return await func()
            except Exception as error:
                last_error = error
                
                # Check if it's a 503 error (overloaded)
                if hasattr(error, 'status_code') and error.status_code == 503:
                    if attempt == max_retries:
                        break
                    
                    # Calculate delay with exponential backoff and jitter
                    delay = base_delay * (2 ** attempt) + random.random()
                    print(f"API overloaded, retrying in {delay:.1f}s (attempt {attempt + 1}/{max_retries + 1})...")
                    await asyncio.sleep(delay)
                else:
                    # For non-503 errors, don't retry
                    raise error
        
        raise last_error
    
    async def analyze_market(self, problem_statement: str) -> MarketResearch:
        """Analyze market for the given problem statement"""
        
        prompt = f"""You are a market research expert. Analyze the market for this problem: "{problem_statement}"

Provide a comprehensive market analysis in the following JSON format:
{{
  "summary": "4-6 sentence market overview including size, growth, key trends, and opportunities",
  "competitors": [
    {{
      "name": "Competitor Name",
      "description": "One sentence describing their approach and key differentiator"
    }}
  ]
}}

Focus on:
- Market size and growth potential
- Key market trends and drivers
- 3-5 direct and indirect competitors
- Market gaps and opportunities"""

        async def _generate():
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            
            if not response.text:
                raise Exception("Empty response from Gemini")
            
            try:
                data = json.loads(response.text)
                # Validate and create MarketResearch object
                competitors = [Competitor(**comp) for comp in data.get("competitors", [])]
                return MarketResearch(
                    summary=data["summary"],
                    competitors=competitors
                )
            except (json.JSONDecodeError, ValidationError, KeyError) as e:
                raise Exception(f"Invalid response format: {e}")
        
        try:
            return await self._retry_with_backoff(_generate)
        except Exception as error:
            print(f"Market analysis error: {error}")
            raise Exception(f"Failed to analyze market: {error}")
    
    async def generate_features(
        self, 
        problem_statement: str, 
        market_research: MarketResearch
    ) -> List[Feature]:
        """Generate prioritized features based on problem and market research"""
        
        prompt = f"""You are a product manager and technical architect. Based on this problem: "{problem_statement}"

And this market context: {market_research.model_dump_json()}

Generate 5 prioritized features in the following JSON format:
{{
  "features": [
    {{
      "title": "Feature Name",
      "description": "Detailed description of the feature and its value proposition",
      "priority": "mvp" or "stretch",
      "techStack": "Recommended technology stack for implementation",
      "complexity": 1-5 (1=simple, 5=very complex)
    }}
  ]
}}

Requirements:
- First 3 features should be "mvp" (minimum viable product)
- Last 2 features should be "stretch" (nice-to-have)
- Focus on features that differentiate from competitors
- Consider technical feasibility for a hackathon timeframe
- Include specific tech stack recommendations"""

        async def _generate():
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            
            if not response.text:
                raise Exception("Empty response from Gemini")
            
            try:
                data = json.loads(response.text)
                # Validate and create Feature objects
                features = []
                for feat_data in data.get("features", []):
                    # Handle both techStack and tech_stack
                    if "techStack" in feat_data:
                        feat_data["tech_stack"] = feat_data.pop("techStack")
                    
                    feature = Feature(**feat_data)
                    features.append(feature)
                
                return features
            except (json.JSONDecodeError, ValidationError, KeyError) as e:
                raise Exception(f"Invalid response format: {e}")
        
        try:
            return await self._retry_with_backoff(_generate)
        except Exception as error:
            print(f"Feature generation error: {error}")
            raise Exception(f"Failed to generate features: {error}")