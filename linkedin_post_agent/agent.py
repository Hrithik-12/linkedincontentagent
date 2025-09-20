"""
LinkedIn Post Generator Root Agent

This module defines the root agent for the LinkedIn post generation application.
It uses a sequential agent with an initial post generator, then parallel agents for hashtag 
generation and visual finding, followed by a refinement loop.
"""

from google.adk.agents import LoopAgent, SequentialAgent, ParallelAgent

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

# Create the Refinement Loop Agent
refinement_loop = LoopAgent(
    name="PostRefinementLoop",
    max_iterations=3,
    sub_agents=[
        post_reviewer,
        post_refiner,
    ],
    description="Iteratively reviews and refines a LinkedIn post until quality requirements are met",
)

# Create the Sequential Pipeline
root_agent = SequentialAgent(
    name="LINKEDINPOSTGENERATIONPIPELINE",
    sub_agents=[
        initial_post_generator,  # Step 1: Generate initial post
        enhancement_parallel,    # Step 2: Generate hashtags and find visuals in parallel
        refinement_loop,         # Step 3: Review and refine the post in a loop
    ],
    description="Generates a LinkedIn post, enhances it with hashtags and visuals, then refines it",
)