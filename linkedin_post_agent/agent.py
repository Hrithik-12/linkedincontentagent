"""
LinkedIn Post Generator Root Agent

This module defines the root agent for the LinkedIn post generation application.
It uses a sequential agent that executes specialized sub-agents in a predefined order,
with each agent's output feeding into the next agent in the sequence.
"""

from google.adk.agents import SequentialAgent, ParallelAgent

from .subagents.post_generator import initial_post_generator
from .subagents.post_refiner import post_refiner
from .subagents.post_reviewer import post_reviewer
from .subagents.hashtag_generator import hashtag_generator
from .subagents.visual_finder import visual_finder

# Create the Parallel Enhancement Agent (works on initial post)
enhancement_parallel = ParallelAgent(
    name="PostEnhancementParallel",
    sub_agents=[
        hashtag_generator,
        visual_finder,
    ],
    description="Generates hashtags and finds visuals for the initial LinkedIn post in parallel",
)

# Create the Sequential Pipeline following proper sequential pattern
root_agent = SequentialAgent(
    name="LINKEDINPOSTGENERATIONPIPELINE",
    sub_agents=[
        initial_post_generator,  # Step 1: Generate initial post content
        enhancement_parallel,    # Step 2: Generate hashtags and find visuals in parallel
        post_reviewer,          # Step 3: Review and assess post quality
        post_refiner,           # Step 4: Refine based on review feedback
    ],
    description="Sequential pipeline: generates initial post → enhances with hashtags/visuals → reviews quality → produces final refined post",
)