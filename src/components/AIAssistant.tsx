import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, Bot, User, Lightbulb, Loader2, FileText } from "lucide-react";
import { chat, generateTaskSuggestions, generateSprintSummary } from "../utils/gemini";
import { Task, TeamMember, ProjectMeta } from "../types";

interface AIAssistantProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  projectMeta: ProjectMeta;
  onAddTask?: (task: Omit<Task, "id" | "createdAt">) => void;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

const quickActions = [
  { id: "summary", label: "Sprint Summary", icon: FileText },
  { id: "suggest", label: "Suggest Tasks", icon: Lightbulb },
];

export default function AIAssistant({ tasks, teamMembers, projectMeta, onAddTask }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Hi! I'm your AI assistant for "${projectMeta.name}". Ask me anything or use a quick action below.` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function buildProjectContext(): string {
    const statusCounts = {
      "to-do": tasks.filter((t) => t.status === "to-do").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
    };
    return `Project: ${projectMeta.name}
Description: ${projectMeta.description}
Total Tasks: ${tasks.length}
To Do: ${statusCounts["to-do"]}, In Progress: ${statusCounts["in-progress"]}, Done: ${statusCounts.done}, Blocked: ${statusCounts.blocked}
Team: ${teamMembers.map((m) => `${m.name} (${m.role})`).join(", ")}`;
  }

  async function handleSend(message: string) {
    if (!message.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const context = buildProjectContext();
      const response = await chat(message, context);
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${errorMessage}` }]);
    }
    setIsLoading(false);
  }

  async function handleQuickAction(actionId: string) {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: `Run: ${actionId}` },
    ]);

    try {
      let response = "";
      const context = buildProjectContext();

      switch (actionId) {
        case "summary":
          response = await generateSprintSummary(
            tasks.map((t) => ({
              title: t.title,
              status: t.status,
              priority: t.priority,
              assignee: teamMembers.find((m) => m.id === t.assigneeId)?.name || "Unassigned",
            }))
          );
          break;
        case "suggest": {
          const suggestions = await generateTaskSuggestions(
            projectMeta.name,
            tasks.map((t) => t.title)
          );
          response = `Here are some suggested tasks:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
          break;
        }
        default:
          response = "Unknown action.";
      }

      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${errorMessage}` }]);
    }
    setIsLoading(false);
  }

  return (
    <>
      <button
        id="btn-ai-assistant-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
        title="AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[380px] h-[560px] bg-neutral-900 border border-neutral-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            id="ai-assistant-panel"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-700/50 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-sans font-bold text-white">AI Assistant</span>
                <span className="text-[10px] font-sans text-neutral-400">Gemini 2.0 Flash</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none" id="ai-messages-container">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-violet-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-sans leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-neutral-800 text-neutral-200 rounded-bl-md"
                    }`}
                  >
                    {msg.text.split("\n").map((line, j) => (
                      <React.Fragment key={j}>
                        {line}
                        {j < msg.text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-indigo-400" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="bg-neutral-800 rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-neutral-700/50 space-y-2 shrink-0">
              <div className="flex gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-[11px] font-sans font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your project..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700/50 rounded-xl text-sm font-sans text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
