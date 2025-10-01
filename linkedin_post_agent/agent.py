"""
LinkedIn Post Generator Root Agent

This module defines the root agent for the LinkedIn post generation application.
It uses a sequential agent with an initial post generator, then parallel agents for hashtag 
generation and visual finding, followed by sequential refinement steps.
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

# Create the Sequential Pipeline with manual refinement iterations
root_agent = SequentialAgent(
    name="LINKEDINPOSTGENERATIONPIPELINE",
    sub_agents=[
        initial_post_generator,  # Step 1: Generate initial post
        enhancement_parallel,    # Step 2: Generate hashtags and find visuals in parallel
        # Step 3: Sequential refinement iterations (replacing the loop)
        post_reviewer,          # First review
        post_refiner,           # First refinement
    ],
    description="Generates a LinkedIn post, enhances it with hashtags and visuals, then refines it through sequential review-refine cycles",
)