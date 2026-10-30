import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, AlertTriangle, Loader2, Info } from 'lucide-react';
import { AuthedShell } from '../components/layout';
import { Button, Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AiApi } from '../lib/api';
import type { AiMessage } from '../types';

const QUICK_PROMPTS = [
  'Summarize my farm performance this week',
  'Why might milk production drop?',
  'What vaccinations are due soon?',
  'Give me a breeding management tip',
];

export function AIAdvisorScreen() {
  const { mode, pushToast } = useApp();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(mode === 'live');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== 'live') {
      setInitializing(false);
      return;
    }
    (async () => {
      try {
        const res = await AiApi.createSession();
        setSessionId(res.session.id);
      } catch (err: any) {
        setInitError(err?.message || 'The AI Advisor service is unavailable right now.');
      } finally {
        setInitializing(false);
      }
    })();
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setInput('');
    const userMsg: AiMessage = { id: Date.now(), role: 'user', message: text };
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    try {
      let sid = sessionId;
      if (!sid) {
        const created = await AiApi.createSession();
        sid = created.session.id;
        setSessionId(sid);
        setInitError(null);
      }
      const res = await AiApi.chat(sid, text);
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', message: res.reply }]);
    } catch (err: any) {
      pushToast({ title: 'AI Advisor unavailable', description: err?.message || 'Please try again.', tone: 'error' });
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: 'assistant', message: 'Sorry, the AI Advisor service could not respond right now. Please try again shortly.' },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthedShell title="AI Advisor">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Advisory guidance only — not a substitute for professional veterinary diagnosis. Answers are based on your farm records.
          </span>
        </div>

        {initializing && (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting to AI Advisor…
          </div>
        )}

        {!initializing && initError && (
          <Card className="flex items-start gap-3 border-red-200 bg-red-50">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">AI Advisor unavailable</p>
              <p className="mt-0.5 text-xs text-red-600">{initError}</p>
            </div>
          </Card>
        )}

        {!initializing && (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.length === 0 && (
                <div className="space-y-2 pt-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-700">Ask about your farm</p>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button key={p} onClick={() => send(p)} className="rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-700 active:scale-[0.99]">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                    {m.message}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="sticky bottom-0 flex items-center gap-2 border-t border-slate-200 bg-slate-50 pt-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI Advisor…"
                className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <Button type="submit" size="md" disabled={!input.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthedShell>
  );
}
