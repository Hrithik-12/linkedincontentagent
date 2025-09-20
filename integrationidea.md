# 🔄 Next.js + Agent API Flow Explanation

## Complete Communication Flow

```
┌─────────────┐    HTTP POST    ┌─────────────┐    HTTP POST    ┌─────────────┐
│   React     │ ──────────────► │  Next.js    │ ──────────────► │   Python    │
│  Frontend   │                 │  API Route  │                 │   Agent     │
│             │ ◄────────────── │             │ ◄────────────── │   Server    │
└─────────────┘    JSON Response └─────────────┘    JSON Response └─────────────┘
```

## Step-by-Step Breakdown

### Step 1: Frontend Sends Request
**File: `app/page.js`**
```javascript
const sendMessage = async () => {
  // User types message and clicks "Send"
  const res = await fetch("/api/greet", {  // ← Calls Next.js API route
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),  // ← Sends: {"message": "Hello!"}
  });
  
  const data = await res.json();  // ← Receives: {"ok": true, "reply": "Hi there!"}
  setReply(data.reply);  // ← Displays agent response
};
```

### Step 2: Next.js API Route Processes Request
**File: `app/api/greet/route.js`**

```javascript
export async function POST(req) {
  try {
    // 1. Extract data from frontend request
    const body = await req.json();  // ← Gets: {"message": "Hello!"}
    const userMessage = body.message || `Please greet ${body.name || "Friend"}`;
    
    // 2. Ensure session exists on agent server
    await ensureSession();  // ← Creates session if needed
    
    // 3. Build payload for Python agent
    const payload = {
      app_name: "greeting_agent",     // ← Which agent to use
      user_id: "u_123",               // ← User identifier
      session_id: "s_123",            // ← Session identifier
      new_message: {
        role: "user",                 // ← Message role
        parts: [{ text: userMessage }] // ← Actual message text
      },
    };
    
    // 4. Send request to Python agent server
    const res = await fetch("http://localhost:8000/run", {  // ← ADK server endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),  // ← Send payload to agent
    });
    
    // 5. Process agent response
    const data = await res.json();  // ← Get agent's response
    
    // 6. Extract clean text from agent response
    let reply = "No response";
    if (Array.isArray(data) && data.length > 0) {
      const parts = data[0]?.content?.parts;
      if (parts && parts[0]?.text) {
        reply = parts[0].text;  // ← Extract: "Hi there! How are you?"
      }
    }
    
    // 7. Send clean response back to frontend
    return NextResponse.json({ ok: true, reply });  // ← Return: {"ok": true, "reply": "Hi there!"}
    
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },  // ← Return error if something fails
      { status: 500 }
    );
  }
}
```

### Step 3: Python Agent Server Processes Request
**Agent Server (running on port 8000)**

```python
# When request comes to http://localhost:8000/run
# The ADK server:
# 1. Finds the "greeting_agent" 
# 2. Processes the message: "Hello!"
# 3. Runs your agent code:

# File: greeting_agent/agent.py
root_agent = Agent(
    name="greeting_agent",
    model="gemini-2.0-flash",
    description="An agent that greets the user and asks for their name.",
    instruction="""
    You are a helpful assistant that greets the user. 
    Ask for the user's name and greet them by name.
    """
)

# 4. Agent generates response: "Hi there! What's your name?"
# 5. Returns structured response:
[
  {
    "content": {
      "parts": [
        {"text": "Hi there! What's your name?"}
      ]
    }
  }
]
```

### Step 4: Response Flows Back
```
Agent Response → Next.js API Route → Frontend Display
```

## 🔧 Key Components Explained

### 1. **Session Management**
```javascript
async function ensureSession() {
  // Creates a session on the agent server if it doesn't exist
  const res = await fetch(
    `http://localhost:8000/apps/greeting_agent/users/u_123/sessions/s_123`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: { foo: "bar" } }),
    }
  );
}
```

### 2. **Agent Payload Structure**
```javascript
const payload = {
  app_name: "greeting_agent",    // ← Must match your agent name
  user_id: "u_123",              // ← Unique user identifier
  session_id: "s_123",           // ← Session for conversation history
  new_message: {
    role: "user",                // ← "user" or "assistant"
    parts: [{ text: "Hello!" }]  // ← The actual message
  },
};
```

### 3. **Agent Response Structure**
```javascript
// Agent returns array of messages:
[
  {
    "content": {
      "parts": [
        {"text": "Hi there! What's your name?"}
      ]
    }
  }
]

// Next.js extracts the text:
const parts = data[0]?.content?.parts;
const reply = parts && parts[0]?.text;  // ← "Hi there! What's your name?"
```

## 🚀 How to Set This Up in Any Project

### 1. **Create Next.js API Route**
```javascript
// app/api/agent/route.js
import { NextResponse } from "next/server";

const ADK_API_BASE = "http://localhost:8000";
const APP_NAME = "your_agent_name";  // ← Change this to your agent name

export async function POST(req) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    // Build payload
    const payload = {
      app_name: APP_NAME,
      user_id: "u_123",
      session_id: "s_123",
      new_message: {
        role: "user",
        parts: [{ text: userMessage }],
      },
    };

    // Send to agent server
    const res = await fetch(`${ADK_API_BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Extract response
    let reply = "No response";
    if (Array.isArray(data) && data.length > 0) {
      const parts = data[0]?.content?.parts;
      if (parts && parts[0]?.text) {
        reply = parts[0].text;
      }
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
```

### 2. **Create Frontend Component**
```javascript
// app/page.js
"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {  // ← Calls your API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (data.ok) {
        setReply(data.reply);  // ← Display agent response
      } else {
        setReply(`Error: ${data.error}`);
      }
    } catch (err) {
      setReply(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
      {reply && <div>Agent: {reply}</div>}
    </div>
  );
}
```

### 3. **Start Agent Server**
```bash
# In your agents directory
python start_agent_server.py
```

### 4. **Start Next.js App**
```bash
# In your Next.js directory
npm run dev
```

## 🔍 Debugging Tips

### Check Agent Server Status
```bash
curl http://localhost:8000/health
```

### Test Agent Directly
```bash
curl -X POST http://localhost:8000/run \
  -H 'Content-Type: application/json' \
  -d '{
    "app_name": "greeting_agent",
    "user_id": "u_123", 
    "session_id": "s_123",
    "new_message": {
      "role": "user",
      "parts": [{"text": "Hello!"}]
    }
  }'
```

### Check Next.js API Route
```bash
curl -X POST http://localhost:3000/api/greet \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello!"}'
```

## 🎯 Key Points

1. **Next.js API routes** act as a bridge between your frontend and Python agents
2. **Agent server** runs on port 8000 and handles all agent logic
3. **Session management** keeps conversation context
4. **Error handling** ensures graceful failures
5. **Response parsing** extracts clean text from agent responses

This setup allows you to easily integrate any Python agent with any Next.js frontend! 🚀
