import { NextResponse } from "next/server";

const ADK_API_BASE = "http://localhost:8000";
const APP_NAME = "linkedin_post_agent"; // Must match your agent name

/**
 * Ensures a session exists on the agent server
 */
async function ensureSession(userId = "user_123", sessionId = "session_123") {
  try {
    const sessionUrl = `${ADK_API_BASE}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`;
    
    const response = await fetch(sessionUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        state: { 
          initialized: true,
          timestamp: new Date().toISOString()
        } 
      }),
    });
    
    const responseText = await response.text();
    console.log("Session creation response:", response.status, responseText);
    
    if (!response.ok && response.status !== 409) { // 409 means session already exists
      throw new Error(`Session creation failed: ${response.status} - ${responseText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Session creation error:", error.message);
    throw error;
  }
}

/**
 * POST /api/generate-post
 * Handles LinkedIn post generation requests
 */
export async function POST(req) {
  try {
    // Extract request data
    const body = await req.json();
    const { topic, context, tone = "professional" } = body;

    if (!topic) {
      return NextResponse.json(
        { ok: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    // Create user message with structured input
    const userMessage = `Create a LinkedIn post about: ${topic}${context ? `\n\nAdditional context: ${context}` : ''}${tone ? `\n\nTone: ${tone}` : ''}`;

    const userId = "user_123";
    const sessionId = `session_${Date.now()}`;

    // Ensure session exists
    await ensureSession(userId, sessionId);

    // Build payload for the LinkedIn post agent
    const payload = {
      app_name: APP_NAME,
      user_id: userId,
      session_id: sessionId,
      new_message: {
        role: "user",
        parts: [{ text: userMessage }],
      },
    };

    console.log("Sending payload to agent:", JSON.stringify(payload, null, 2));

    // Send request to Python agent server
    const agentResponse = await fetch(`${ADK_API_BASE}/run`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    console.log("Agent response status:", agentResponse.status);
    
    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent server error:", agentResponse.status, errorText);
      throw new Error(`Agent server responded with status: ${agentResponse.status} - ${errorText}`);
    }

    const agentData = await agentResponse.json();
    console.log("Agent response:", JSON.stringify(agentData, null, 2));

    // Extract the final response from the agent
    let generatedPost = "No response generated";
    let hashtags = [];
    let visualSuggestions = [];

    // Try to get the session state after the agent run
    try {
      const sessionStateUrl = `${ADK_API_BASE}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}/state`;
      const stateResponse = await fetch(sessionStateUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        console.log("Session state:", JSON.stringify(stateData, null, 2));
        
        // Extract the final post content
        if (stateData.current_post) {
          generatedPost = stateData.current_post;
        }
        
        // Extract hashtags
        if (stateData.suggested_hashtags) {
          const hashtagText = stateData.suggested_hashtags;
          const hashtagMatches = hashtagText.match(/#[\w]+/g);
          if (hashtagMatches) {
            hashtags = hashtagMatches;
          }
        }
        
        // Extract visual recommendations
        if (stateData.visual_recommendations) {
          visualSuggestions = [stateData.visual_recommendations];
        }
        
        // Debug: Log all state keys to see what's available
        console.log("Available state keys:", Object.keys(stateData));
      }
    } catch (stateError) {
      console.error("Error fetching session state:", stateError);
    }
    
    // Fallback: try to extract from agent state in the response
    if (generatedPost === "No response generated" && agentData?.state) {
      console.log("Agent response state:", JSON.stringify(agentData.state, null, 2));
      
      // Extract the final post content
      if (agentData.state.current_post) {
        generatedPost = agentData.state.current_post;
      }
      
      // Extract hashtags
      if (agentData.state.suggested_hashtags) {
        const hashtagText = agentData.state.suggested_hashtags;
        const hashtagMatches = hashtagText.match(/#[\w]+/g);
        if (hashtagMatches) {
          hashtags = hashtagMatches;
        }
      }
      
      // Extract visual recommendations
      if (agentData.state.visual_recommendations) {
        visualSuggestions = [agentData.state.visual_recommendations];
      }
      
      // Debug: Log all state keys to see what's available
      console.log("Available agent state keys:", Object.keys(agentData.state));
    }
    
    // Final fallback: try to extract from messages if state extraction failed
    if (generatedPost === "No response generated" && Array.isArray(agentData) && agentData.length > 0) {
      // Get the last message (should be the final refined post)
      const lastMessage = agentData[agentData.length - 1];
      
      if (lastMessage?.content?.parts?.[0]?.text) {
        const responseText = lastMessage.content.parts[0].text;
        
        // Parse the response to extract different components
        generatedPost = responseText;
        
        // Extract hashtags if they exist (look for #hashtag patterns)
        const hashtagMatches = responseText.match(/#[\w]+/g);
        if (hashtagMatches) {
          hashtags = hashtagMatches;
        }
        
        // Look for visual suggestions in the response
        const visualMatch = responseText.match(/Visual[s]?.*?:(.*?)(?:\n|$)/gi);
        if (visualMatch) {
          visualSuggestions = visualMatch.map(match => 
            match.replace(/Visual[s]?.*?:/i, '').trim()
          ).filter(suggestion => suggestion.length > 0);
        }
      }
    }

    // NEW: Extract data from individual agent responses in the array
    if (Array.isArray(agentData)) {
      console.log("Searching through agent responses for data...");
      
      agentData.forEach((response, index) => {
        console.log(`Checking response ${index} from author: ${response.author}`);
        
        // Extract post content from PostRefinerAgent (final post)
        if (response.author === "PostRefinerAgent" && response.actions?.state_delta?.current_post) {
          generatedPost = response.actions.state_delta.current_post;
          console.log("Found refined post content");
        }
        
        // Extract hashtags from HashtagGenerator
        if (response.author === "HashtagGenerator" && response.actions?.state_delta?.suggested_hashtags) {
          const hashtagText = response.actions.state_delta.suggested_hashtags;
          const hashtagMatches = hashtagText.match(/#[\w]+/g);
          if (hashtagMatches) {
            hashtags = hashtagMatches;
            console.log("Found hashtags:", hashtags.length);
          }
        }
        
        // Extract visual recommendations from VisualFinder
        if (response.author === "VisualFinder" && response.actions?.state_delta?.visual_recommendations) {
          visualSuggestions = [response.actions.state_delta.visual_recommendations];
          console.log("Found visual recommendations");
        }
      });
    }
    
    // Additional debugging: Try to find visual recommendations in any part of the response
    if (visualSuggestions.length === 0 && agentData) {
      console.log("No visual suggestions found yet, searching entire response...");
      
      // Check if agentData is an array (messages) or object (state response)
      const searchText = JSON.stringify(agentData);
      
      // Look for any mentions of visual recommendations in the entire response
      const visualKeys = ['visual_recommendations', 'visualRecommendations', 'visual_suggestions', 'visualSuggestions'];
      
      for (const key of visualKeys) {
        if (searchText.includes(key)) {
          console.log(`Found potential visual data with key: ${key}`);
          
          // Try to extract from different possible locations
          if (agentData.state && agentData.state[key]) {
            visualSuggestions = [agentData.state[key]];
            console.log(`Extracted visual from agentData.state.${key}`);
            break;
          }
          
          if (agentData[key]) {
            visualSuggestions = [agentData[key]];
            console.log(`Extracted visual from agentData.${key}`);
            break;
          }
        }
      }
    }

    // Return structured response
    return NextResponse.json({
      ok: true,
      data: {
        post: generatedPost,
        hashtags,
        visualSuggestions,
        metadata: {
          topic,
          context,
          tone,
          generatedAt: new Date().toISOString(),
          sessionId
        }
      }
    });

  } catch (error) {
    console.error("Error generating post:", error);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: error.message || "Failed to generate LinkedIn post",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-post
 * Health check endpoint
 */
export async function GET() {
  try {
    // Test connection to agent server
    const healthResponse = await fetch(`${ADK_API_BASE}/health`, {
      method: "GET",
    });

    const isAgentHealthy = healthResponse.ok;

    return NextResponse.json({
      ok: true,
      status: "API route is working",
      agentServer: {
        url: ADK_API_BASE,
        healthy: isAgentHealthy,
        appName: APP_NAME
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      ok: false,
      status: "API route is working, but agent server is not reachable",
      error: error.message,
      agentServer: {
        url: ADK_API_BASE,
        healthy: false,
        appName: APP_NAME
      },
      timestamp: new Date().toISOString()
    });
  }
}