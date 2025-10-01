"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Sparkles, Hash, Image } from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    topic: "",
    context: "",
    tone: "professional"
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [agentMessage, setAgentMessage] = useState("🤖 Agent is thinking");

  // AI Agent thinking animation messages
  useEffect(() => {
    if (loading) {
      const messages = [
        "🤖 Agent is analyzing your topic...",
        "📊 Processing context and tone...", 
        "✨ Crafting the perfect post...",
        "🔍 Generating hashtags...",
        "🎨 Finding visual suggestions...",
        "🚀 Almost ready..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setAgentMessage(messages[i % messages.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setAgentMessage("🤖 Agent is thinking");
    }
  }, [loading]);

  // AI Agent Thinking Animation Component
  const ThinkingAnimation = () => {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-semibold text-lg">{agentMessage}</span>
        </div>
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></span>
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></span>
        </div>
        <p className="text-gray-500 text-sm animate-pulse">This may take a few seconds</p>
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePost = async (e) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      setError("Please enter a topic for your LinkedIn post");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.ok) {
        setResult(data.data);
      } else {
        setError(data.error || "Failed to generate post");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const copyFullPost = () => {
    if (!result) return;
    
    let fullText = result.post + "\n\n";
    if (result.hashtags && result.hashtags.length > 0) {
      fullText += result.hashtags.join(" ");
    }
    copyToClipboard(fullText, "full");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            LinkedIn Post Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create engaging LinkedIn posts with AI assistance. Generate content, hashtags, and visual suggestions instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Input Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create Your Post
            </h2>
            
            <div className="space-y-5">
              {/* Topic Input */}
              <div>
                <label htmlFor="topic" className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., AI in healthcare, remote work tips..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              {/* Context Input */}
              <div>
                <label htmlFor="context" className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Context
                </label>
                <textarea
                  id="context"
                  name="context"
                  value={formData.context}
                  onChange={handleInputChange}
                  placeholder="Provide any additional details or specific points..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="inspiring">Inspiring</option>
                  <option value="educational">Educational</option>
                  <option value="thought-provoking">Thought-provoking</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={generatePost}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Post</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                <div className="flex items-start">
                  <div className="text-red-600 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Generated Content
              </h2>
              {result && (
                <button
                  onClick={copyFullPost}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold"
                >
                  {copiedSection === "full" ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">Your generated post will appear here</p>
                <p className="text-sm text-gray-400 mt-2">Fill in the form and click generate to start</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-96">
                <ThinkingAnimation />
              </div>
            )}

            {result && (
              <div className="space-y-5">
                {/* Generated Post */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                      Post Content
                    </h3>
                    <button
                      onClick={() => copyToClipboard(result.post, "post")}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-all border border-gray-300 text-sm font-medium"
                    >
                      {copiedSection === "post" ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {result.post}
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900 flex items-center">
                        <Hash className="w-5 h-5 mr-2 text-purple-600" />
                        Hashtags
                      </h3>
                      <button
                        onClick={() => copyToClipboard(result.hashtags.join(" "), "hashtags")}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition-all border border-gray-300 text-sm font-medium"
                      >
                        {copiedSection === "hashtags" ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-full text-sm font-medium"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Suggestions */}
                {result.visualSuggestions && result.visualSuggestions.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                      <Image className="w-5 h-5 mr-2 text-green-600" />
                      Visual Suggestions
                    </h3>
                    <div className="space-y-4">
                      {result.visualSuggestions.map((suggestion, index) => {
                        // Extract only the core recommendation sections
                        const extractCoreContent = (text) => {
                          // Extract RECOMMENDED VISUAL section
                          const recommendedMatch = text.match(/\*\*RECOMMENDED VISUAL:\*\*([\s\S]*?)(?=\*\*ALTERNATIVE OPTIONS:\*\*|$)/i);
                          let recommended = '';
                          if (recommendedMatch) {
                            recommended = recommendedMatch[1].trim();
                          }
                          
                          // Extract ALTERNATIVE OPTIONS
                          const alternativeMatch = text.match(/\*\*ALTERNATIVE OPTIONS:\*\*([\s\S]*?)(?=\*\*VISUAL STRATEGY:\*\*|$)/i);
                          let alternative = '';
                          if (alternativeMatch) {
                            alternative = alternativeMatch[1].trim();
                          }
                          
                          // Extract VISUAL STRATEGY
                          const strategyMatch = text.match(/\*\*VISUAL STRATEGY:\*\*([\s\S]*?)$/i);
                          let strategy = '';
                          if (strategyMatch) {
                            strategy = strategyMatch[1].trim();
                          }
                          
                          return { recommended, alternative, strategy };
                        };

                        const content = extractCoreContent(suggestion);

                        return (
                          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                            {/* Header */}
                            <div className="mb-6 pb-4 border-b border-gray-100">
                              <h4 className="text-lg font-bold text-gray-900 flex items-center">
                                <Image className="w-5 h-5 mr-2 text-green-600" />
                                Visual Recommendation
                              </h4>
                            </div>

                            {/* Recommended Visual */}
                            {content.recommended && (
                              <div className="mb-6">
                                <h5 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  RECOMMENDED VISUAL
                                </h5>
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {content.recommended}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Alternative Options */}
                            {content.alternative && (
                              <div className="mb-6">
                                <h5 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  ALTERNATIVE OPTIONS
                                </h5>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {content.alternative}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Visual Strategy */}
                            {/* {content.strategy && (
                              <div className="mb-6">
                                <h5 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                  VISUAL STRATEGY
                                </h5>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {content.strategy}
                                  </div>
                                </div>
                              </div>
                            )} */}

                            {/* Copy Button */}
                            <div className="pt-4 border-t border-gray-100">
                              <button 
                                onClick={() => copyToClipboard(suggestion, `visual-${index}`)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all font-medium text-sm"
                              >
                                {copiedSection === `visual-${index}` ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Content
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(result.metadata.generatedAt).toLocaleString()}
                    </p>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-300">
                      {formData.tone}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}