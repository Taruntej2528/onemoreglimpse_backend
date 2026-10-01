import { Settings } from '../../utiles/models/Settings.js';

/**
 * Intelligent Prazna Studio AI Concierge Response Generator
 * Generates tailored luxury responses based on the studio's wedding packages & philosophy
 */
const generateStudioFallbackResponse = (message, systemPrompt) => {
  const q = (message || '').toLowerCase();

  if (q.includes('package') || q.includes('price') || q.includes('cost') || q.includes('investment') || q.includes('rate')) {
    return `Namaste! At Prazna Photography, we offer four bespoke collections tailored to royal celebrations:

1. **Intimate Sacred Vows (₹1,85,000)**: 4-Member Master Crew covering authentic rituals with fine-art documentary style and signature heirloom teaser.
2. **Timeless Classical Memoir (₹2,95,000)**: 6-Member Crew, 4K multi-camera coverage, drone aerial cinematography, and luxury leather album.
3. **Royal Heritage Grandeur (₹4,95,000)**: Our signature collection — 8-Member Master Team, broadcast wireless audio for Vedic mantras, editorial fine-art portraits, and 45-minute cinema film.
4. **Bespoke Luxury Celebration (₹6,50,000+)**: Multi-day palace wedding celebration coverage with senior creative director Praveen Kumar.

Would you like us to share our comprehensive 2026-2027 Destination Wedding Brochure, or check date availability for your celebration?`;
  }

  if (q.includes('destination') || q.includes('udaipur') || q.includes('hyderabad') || q.includes('bali') || q.includes('florence') || q.includes('venue') || q.includes('travel')) {
    return `We specialize in destination palace weddings worldwide! Over the past 25 years, we have documented celebrations across:

• **Royal Rajasthan**: Udaipur (Taj Lake Palace, The Leela, Jagmandir), Jaipur (Rambagh Palace), and Jodhpur (Umaid Bhawan).
• **South Heritage**: Hyderabad (Taj Falaknuma Palace), Bengaluru, and Chennai.
• **International Destinations**: Lake Como, Florence, Tuscany, Bali, and Dubai.

Our master crew travels with specialized travel rigs, backup camera systems, and drone flight licenses. May we know your wedding destination and dates?`;
  }

  if (q.includes('style') || q.includes('philosophy') || q.includes('documentary') || q.includes('candid')) {
    return `Our artistic philosophy is defined by: *"We don't simply record ceremonies; we curate timeless heirlooms."*

We reject stiff, uncomfortable poses. Instead, we capture the unscripted magic — the stolen glances, family tears of joy, and raw festive ecstasy. Every frame is hand-mastered with rich jewel tones, true skin warmth, and editorial cinematic contrast. Broadcast wireless microphones ensure sacred Vedic mantras and heartfelt toasts are preserved with crystalline fidelity.`;
  }

  if (q.includes('book') || q.includes('reserve') || q.includes('availability') || q.includes('date') || q.includes('contact')) {
    return `To preserve our signature artisanal quality, we strictly accept a limited number of royal celebrations each season.

You can hold your wedding dates provisionally for 48 hours right now:
1. Tap the **"Reserve Date via WhatsApp"** button in our booking form.
2. Or share your dates, venue, and estimated guest count right here, and our concierge will verify master crew availability immediately!`;
  }

  return `Namaste and welcome to Prazna Photography. For over two decades, our master cinematographers have documented sacred vows and royal celebrations across India and worldwide destinations.

How may I assist your wedding celebration today? I can guide you through our **Signature Collections**, **Destination Experience**, **Cinematography Philosophy**, or check **Date Availability**!`;
};

export const ChatService = {
  /**
   * Get public AI widget configuration
   */
  async getPublicConfig() {
    const settings = await Settings.findOne({ isDefault: true }).lean();
    const ai = settings?.ai || {};

    return {
      enabled: ai.enabled !== false,
      hideWidgetWhenDisabled: Boolean(ai.hideWidgetWhenDisabled),
      activeProvider: ai.activeProvider || 'gemini',
      botName: ai.botName || 'Prazna AI Concierge',
      welcomeMessage:
        ai.welcomeMessage ||
        'Namaste! I am your Prazna Concierge. How may I assist with your wedding celebration or cinematic heirloom today?',
      quickQuestions: ai.quickQuestions?.length
        ? ai.quickQuestions
        : [
            'What is included in the Royal Heritage Grandeur collection?',
            'Do you travel to destination weddings like Udaipur or Bali?',
            'How far in advance should we reserve our wedding dates?',
            'What is your documentary cinematography style?',
          ],
    };
  },

  /**
   * Stream chat response using active AI provider (Gemini / OpenAI / Claude) or demo fallback
   */
  async streamChat({ message, history = [], onToken, onComplete, onError }) {
    onToken = typeof onToken === 'function' ? onToken : () => {};
    onComplete = typeof onComplete === 'function' ? onComplete : () => {};
    onError = typeof onError === 'function' ? onError : (err) => console.error('[ChatService Error]', err);

    try {
      const settings = await Settings.findOne({ isDefault: true }).lean();
      const ai = settings?.ai || {};

      if (ai.enabled === false) {
        return onComplete('The AI Concierge is currently offline. Please connect with our studio director directly via WhatsApp or submit a date inquiry form.');
      }

      const provider = ai.activeProvider || 'gemini';
      const systemPrompt = ai.systemPrompt || 'You are the luxury AI Concierge for Prazna Photography.';
      const providerConfig = ai.providers?.[provider] || {};
      const apiKey = providerConfig.apiKey?.trim();
      const model = providerConfig.model;

      // ---------------------------------------------------------------
      // 1. Google Gemini Streaming (Native REST SSE)
      // ---------------------------------------------------------------
      if (provider === 'gemini' && apiKey && !apiKey.toLowerCase().includes('dummy')) {
        const preferredModel = model?.trim() || 'gemini-3.5-flash';
        const candidateModels = [
          preferredModel,
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-flash-latest',
          'gemini-3.8-flash',
          'gemini-3.7-flash',
        ].filter((m, i, arr) => m && arr.indexOf(m) === i);

        const contents = [
          ...history.slice(-8).map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const payload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: providerConfig.temperature ?? 0.7,
            maxOutputTokens: 1024,
          },
        };

        let response = null;
        let activeModel = preferredModel;

        for (const candidate of candidateModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:streamGenerateContent?alt=sse&key=${apiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              response = res;
              activeModel = candidate;
              break;
            } else {
              const errText = await res.text();
              if (res.status === 503) {
                console.warn(`[Gemini Capacity Notice]: ${candidate} returned 503 (High Demand on Google servers). Switching to stable fallback model...`);
                continue;
              } else if (res.status === 404) {
                console.warn(`[Gemini Notice]: ${candidate} returned 404. Switching to next candidate...`);
                continue;
              } else {
                console.warn(`[Gemini API Warning on ${candidate} (Status ${res.status})]: ${errText.slice(0, 150)}`);
                break;
              }
            }
          } catch (fetchErr) {
            console.warn(`[Gemini Fetch Error on ${candidate}]:`, fetchErr.message);
          }
        }

        if (!response || !response.ok) {
          console.warn(`[Gemini API Failed for all models]. Falling back to studio concierge response.`);
          return this._streamSimulatedResponse(message, systemPrompt, onToken, onComplete, true);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              try {
                const data = JSON.parse(trimmed.slice(5).trim());
                const token = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (token) {
                  fullText += token;
                  onToken(token);
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        return onComplete(fullText);
      }

      // ---------------------------------------------------------------
      // 2. OpenAI / ChatGPT Streaming
      // ---------------------------------------------------------------
      if (provider === 'openai' && apiKey && !apiKey.toLowerCase().includes('dummy')) {
        const openaiModel = model || 'gpt-4o-mini';
        const url = 'https://api.openai.com/v1/chat/completions';

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map((h) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content,
          })),
          { role: 'user', content: message },
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages,
            stream: true,
            temperature: providerConfig.temperature ?? 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[OpenAI API Error ${response.status}] ${errText}. Falling back to studio concierge response.`);
          return this._streamSimulatedResponse(message, systemPrompt, onToken, onComplete, true);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim();
              if (dataStr === '[DONE]') break;
              try {
                const data = JSON.parse(dataStr);
                const token = data.choices?.[0]?.delta?.content;
                if (token) {
                  fullText += token;
                  onToken(token);
                }
              } catch {
                // skip
              }
            }
          }
        }

        return onComplete(fullText);
      }

      // ---------------------------------------------------------------
      // 3. Anthropic Claude Streaming
      // ---------------------------------------------------------------
      if (provider === 'claude' && apiKey && !apiKey.toLowerCase().includes('dummy')) {
        const claudeModel = model || 'claude-3-5-sonnet-20241022';
        const url = 'https://api.anthropic.com/v1/messages';

        const messages = [
          ...history.slice(-8).map((h) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content,
          })),
          { role: 'user', content: message },
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: claudeModel,
            system: systemPrompt,
            messages,
            max_tokens: 1024,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[Claude API Error ${response.status}] ${errText}. Falling back to studio concierge response.`);
          return this._streamSimulatedResponse(message, systemPrompt, onToken, onComplete, true);
        }

        let fullText = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              try {
                const data = JSON.parse(trimmed.slice(5).trim());
                if (data.type === 'content_block_delta' && data.delta?.text) {
                  fullText += data.delta.text;
                  onToken(data.delta.text);
                }
              } catch {
                // skip
              }
            }
          }
        }

        return onComplete(fullText);
      }

      // ---------------------------------------------------------------
      // 4. Default / Demo Concierge Stream (When Key is not yet set)
      // ---------------------------------------------------------------
      return this._streamSimulatedResponse(message, systemPrompt, onToken, onComplete, false);
    } catch (err) {
      console.error('[ChatService Error]', err);
      onError(err);
    }
  },

  /**
   * Smooth realistic streaming of concierge response for demo / test
   */
  async _streamSimulatedResponse(message, systemPrompt, onToken, onComplete, hadApiKeyError = false) {
    let fullResponse = generateStudioFallbackResponse(message, systemPrompt);

    if (hadApiKeyError) {
      fullResponse += '\n\n*(Note: Your AI provider API key is not yet configured or was rejected. You can update your live Gemini/OpenAI/Claude key in Admin Settings -> AI Concierge).*';
    }

    const words = fullResponse.split(' ');
    let fullText = '';

    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      fullText += chunk;
      onToken(chunk);
      // Realistic typing cadence (18ms per token)
      await new Promise((r) => setTimeout(r, 18));
    }

    onComplete(fullText);
  },
};
