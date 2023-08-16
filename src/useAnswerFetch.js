import { useState, useRef } from 'react';
import { Amplify, API } from 'aws-amplify';
import { Predictions, AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

export const useAnswerFetch = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [isFetchingAnswer, setIsFetchingAnswer] = useState(false);
  const source = useRef(null);
  const audioCtx = new AudioContext();
  const audioBuffer = useRef(null);

  const fetchAnswer = async (author) => {
    setIsFetchingAnswer(true);

    const completion = await API.post('apigpt', '/call', {
      body: {
        input: {
          question: author,
        },
      },
    });

    console.log('Listen Original');

    setAnswer(completion.Answer);

    Predictions.convert({
      textToSpeech: {
        source: {
          text: completion.Answer,
        },
        voiceId: 'Mia',
        languageCode: 'es-MX',
      },
    })
      .then(async (result) => {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        console.log({ AudioContext });
        audioBuffer.current = await audioCtx.decodeAudioData(result.audioStream);
        playAudio();

        setIsFetchingAnswer(false);
      })
      .catch((err) => console.log(err));
  };

  const playAudio = () => {
    if (!audioBuffer.current) {
      return;
    }

    source.current = audioCtx.createBufferSource();
    source.current.buffer = audioBuffer.current;
    source.current.connect(audioCtx.destination);
    source.current.start(0);
    setIsPlaying(true);
  };

  return {
    audioCtx,
    answer,
    fetchAnswer,
    isFetchingAnswer,
    setIsFetchingAnswer,
    isPlaying,
    source,
    setIsPlaying,
  };
};
