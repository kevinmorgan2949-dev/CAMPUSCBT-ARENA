<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GradeX 🚀 - Smart Library, CBT & Staked Arena</title>
  <!-- React and ReactDOM CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel for JSX compilation in browser -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Google Gen AI & Firebase SDK Imports -->
  <script type="importmap">
    {
      "imports": {
        "@google/genai": "https://esm.run/@google/genai",
        "firebase/app": "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js",
        "firebase/firestore": "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
      }
    }
  </script>
  <style>
    :root {
      --primary-color: #2563eb;
      --secondary-color: #d81b60;
      --bg-gradient: linear-gradient(135deg, #f0f4ff 0%, #fdf2f8 100%);
      --card-bg: #ffffff;
      --text-main: #1f2937;
      --text-muted: #4b5563;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-gradient);
      background-attachment: fixed;
      margin: 0;
      padding: 0;
      color: var(--text-main);
      min-height: 100vh;
    }

    header {
      background: linear-gradient(90deg, #1e40af, #2563eb);
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      margin: 0;
      font-size: 1.4rem;
      letter-spacing: 0.5px;
    }

    header p {
      margin: 6px 0 0 0;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .main-container {
      max-width: 550px;
      margin: 25px auto;
      padding: 0 15px;
    }

    .card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      margin-bottom: 20px;
      border: 1px solid rgba(229, 231, 235, 0.8);
    }

    h2 {
      color: var(--secondary-color);
      font-size: 1.3rem;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-box {
      background: #fff5f7;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
      border: 1px solid #ffd8e4;
    }

    .ai-box {
      background: #eff6ff;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #bfdbfe;
    }

    label {
      display: block;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 5px;
      color: var(--text-muted);
    }

    input[type="text"], input[type="number"], textarea {
      width: 100%;
      padding: 10px;
      margin: 5px 0 15px 0;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      background: #fff;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 0.95rem;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-create {
      background: var(--secondary-color);
      color: #fff;
    }

    .btn-ai {
      background: var(--primary-color);
      color: #fff;
    }

    .room-ready-box {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #bbf7d0;
    }

    .room-ready-box p {
      font-weight: bold;
      color: #166534;
      margin-top: 0;
    }

    .btn-whatsapp {
      background: #25d366;
      color: #fff;
      margin-top: 5px;
    }

    .room-empty-box {
      background: #f9fafb;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      color: #9ca3af;
      border: 1px dashed #d1d5db;
      font-size: 0.9rem;
    }

    .ai-result {
      background: #ffffff;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      margin-top: 10px;
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>

  <header>
    <h1>GradeX 🚀</h1>
    <p>Smart Library, CBT & Staked Arena</p>
  </header>

  <div class="main-container" id="root"></div>

  <!-- Main Application Script -->
  <script type="module">
    import { GoogleGenAI } from "@google/genai";
    import { initializeApp } from "firebase/app";
    import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAKbQaiTWkpnjQ5OYNKuHBT_UB7xXhhx_A",
      authDomain: "studio-5048925414-4748e.firebaseapp.com",
      projectId: "studio-5048925414-4748e",
      storageBucket: "studio-5048925414-4748e.firebasestorage.app",
      messagingSenderId: "933916912009",
      appId: "1:933916912009:web:39731845c3824c89af1958"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: "AIzaSyAkc3n8USamQikTOo8dwQOafEQwJXL6_Ek" });

    window.GradExServices = {
      // 1. Automatically generate CBT questions via Gemini
      generateQuestions: async (topic, count = 5) => {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate ${count} multiple-choice CBT questions for the topic: "${topic}". 
            You must return the response strictly as a valid JSON array of objects with this exact structure:
            [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "The correct option string matching one of the options"
              }
            ]`,
            config: {
              responseMimeType: "application/json"
            }
          });
          return JSON.parse(response.text);
        } catch (error) {
          console.error("AI Generation Error:", error);
          return null;
        }
      },

      // 2. Save room & questions to Firebase
      saveRoom: async (roomCode, roomData) => {
        try {
          await setDoc(doc(db, "stakedRooms", String(roomCode)), {
            ...roomData,
            createdAt: new Date()
          });
          return true;
        } catch (error) {
          console.error("Firebase Save Error:", error);
          return false;
        }
      },

      // 3. General AI Explanation helper
      explainText: async (studyText) => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Please explain this study text clearly and concisely for a student: "${studyText}"`,
        });
        return response.text;
      }
    };
  </script>

  <script type="text/babel">
    function App() {
      const [topic, setTopic] = React.useState('');
      const [stake, setStake] = React.useState('');
      const [createdRoom, setCreatedRoom] = React.useState(null);
      const [loadingRoom, setLoadingRoom] = React.useState(false);

      const [studyText, setStudyText] = React.useState('');
      const [aiExplanation, setAiExplanation] = React.useState('');
      const [loadingAi, setLoadingAi] = React.useState(false);
      const [aiError, setAiError] = React.useState('');

      // Handle Staked Room Creation with Automated AI Questions & Firebase Sync
      const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!topic || !stake) return;

        setLoadingRoom(true);
        try {
          // 1. Generate questions automatically via Gemini AI
          const questions = await window.GradExServices.generateQuestions(topic, 5);
          
          if (!questions || questions.length === 0) {
            alert("Failed to generate AI questions. Please try again.");
            setLoadingRoom(false);
            return;
          }

          // 2. Generate room code & shareable link
          const mockRoomCode = Math.floor(1000 + Math.random() * 9000);
          const generatedLink = `${window.location.origin}${window.location.pathname}?room=${mockRoomCode}`;

          // 3. Save to Firebase Firestore
          await window.GradExServices.saveRoom(mockRoomCode, {
            code: mockRoomCode,
            topic: topic,
            stake: stake,
            questions: questions,
            link: generatedLink
          });

          setCreatedRoom({
            code: mockRoomCode,
            topic: topic,
            stake: stake,
            link: generatedLink
          });
        } catch (err) {
          console.error("Room creation error:", err);
          alert("Error creating room. Check connection.");
        } finally {
          setLoadingRoom(false);
        }
      };

      const handleWhatsAppShare = () => {
        if (!createdRoom) return;

        const message = `🔥 Join my GradeX CBT Arena challenge room on "${createdRoom.topic}"! Stake: ₦${createdRoom.stake}. Play here: ${createdRoom.link}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
      };

      const handleAskGemini = async () => {
        if (!studyText.trim()) return;

        setLoadingAi(true);
        setAiError('');
        setAiExplanation('');

        try {
          const resultText = await window.GradExServices.explainText(studyText);
          setAiExplanation(resultText);
        } catch (err) {
          console.error("Gemini AI request failed:", err);
          setAiError("Gemini AI request failed. Please try again.");
        } finally {
          setLoadingAi(false);
        }
      };

      return (
        <div>
          {/* Money Bet Arena Section */}
          <div className="card">
            <h2>🏆 Money Bet Arena</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform takes a sustainable 10% commission. Winner takes 90% of the pool!</p>

            <form onSubmit={handleCreateRoom} className="form-box">
              <h3 style={{ fontSize: '0.95rem', marginTop: 0, color: 'var(--text-main)' }}>🔥 Create Staked Challenge Room</h3>
              
              <label>Enter Battle Topic</label>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="e.g. GNS 102" 
                required 
              />

              <label>Bet Stake Amount (₦)</label>
              <input 
                type="number" 
                value={stake} 
                onChange={(e) => setStake(e.target.value)} 
                placeholder="100" 
                required 
              />

              <button type="submit" disabled={loadingRoom} className="btn btn-create">
                {loadingRoom ? 'Generating AI Questions & Room...' : 'Stake & Create Link'}
              </button>
            </form>

            {createdRoom ? (
              <div className="room-ready-box">
                <p>✅ Room Ready! Share Link:</p>
                <input 
                  type="text" 
                  readOnly 
                  value={createdRoom.link} 
                  style={{ background: '#fff', marginBottom: '10px' }} 
                />
                <button 
                  type="button" 
                  onClick={handleWhatsAppShare} 
                  className="btn btn-whatsapp"
                >
                  💬 Share to WhatsApp
                </button>
              </div>
            ) : (
              <div className="room-empty-box">
                <p>Create a room above to generate your automated AI questions and invite link.</p>
              </div>
            )}
          </div>

          {/* Gemini AI Smart Explanation Section */}
          <div className="card">
            <h2>✨ Smart Study Assistant</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Highlight or paste tough notes to get instant AI breakdowns.</p>

            <div className="ai-box">
              <label>Paste Topic or Note Text</label>
              <textarea 
                value={studyText} 
                onChange={(e) => setStudyText(e.target.value)} 
                placeholder="e.g. Explain photosynthesis or summarize GNS 102 concepts..."
              />

              <button 
                type="button" 
                onClick={handleAskGemini} 
                disabled={loadingAi} 
                className="btn btn-ai"
              >
                {loadingAi ? 'Thinking...' : 'Ask Gemini AI to Explain'}
              </button>

              {aiError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px' }}>⚠️ {aiError}</p>}

              {aiExplanation && (
                <div className="ai-result">
                  <strong style={{ color: 'var(--primary-color)' }}>AI Explanation:</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{aiExplanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>

</body>
</html>
