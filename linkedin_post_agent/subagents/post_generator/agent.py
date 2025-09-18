"""
LinkedIn Post Generator Agent

This agent generates the initial LinkedIn post before refinement.
"""

from google.adk.agents.llm_agent import LlmAgent

# Constants
GEMINI_MODEL = "gemini-2.0-flash"

# Define the Initial Post Generator Agent
initial_post_generator = LlmAgent(
    name="InitialPostGenerator",
    model=GEMINI_MODEL,
    instruction="""You are a LinkedIn Post Generator.

    The user will provide a topic or request, and your task is to create a LinkedIn post about it.

    ## CONTENT REQUIREMENTS
    Ensure the post:
    1. Clearly addresses the user’s topic and stays focused on it
    2. Highlights key takeaways, insights, or learnings relevant to the topic
    3. Shares genuine enthusiasm and value
    4. Includes a brief statement about how this knowledge/experience can be applied
    5. Encourages connections, discussions, or engagement with a clear call-to-action

    ## STYLE REQUIREMENTS
    - Professional yet conversational tone
    - Between 1000–1500 characters
    - NO emojis
    - NO hashtags
    - Avoid generic fluff — keep it authentic and topic-focused

    ## OUTPUT INSTRUCTIONS
    - Return ONLY the post content
    - Do not add formatting markers or explanations
    """,
    description="Generates the initial LinkedIn post to start the refinement process",
    output_key="current_post",
)
