import React, { useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

import { useVoice } from './useVoice';
import { useAnswerFetch } from './useAnswerFetch';

const App = () => {
  const { text, isListening, listen, voiceSupported } = useVoice();
  const { audioCtx, answer, isFetchingAnswer, fetchAnswer, isPlaying, source, setIsPlaying } = useAnswerFetch();

  useEffect(() => {
    if (text !== '') {
      fetchAnswer(text);
    }
  }, [text]);

  if (!voiceSupported) {
    return (
      <div className="app">
        <h1>Voice recognition is not supported by your browser, please re-try with a supported browser e.g. Chrome</h1>
      </div>
    );
  }

  const pauseAudio = () => {
    if (source.current && isPlaying) {
      source.current.stop();

      setIsPlaying(false);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app">
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <h2>Ask to GPT</h2>
          <h3>Click the Mic and say your question</h3>
          <div>
            <img
              className={`microphone ${isListening && 'isListening'}`}
              src="https://cdn-icons-png.flaticon.com/512/1186/1186128.png"
              alt="microphone"
              onClick={listen}
            />
          </div>
          <p>{text}</p>
          {isFetchingAnswer ? (
            'Consultando a GPT....'
          ) : (
            <ul>
              {answer}
              <button onClick={pauseAudio} disabled={!source.current || !isPlaying}>
                Pause
              </button>
            </ul>
          )}
        </div>
      )}
    </Authenticator>
  );
};

export default App;
