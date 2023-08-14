import { useState } from 'react';
import {Amplify, API} from 'aws-amplify';
import {
  Predictions,
  AmazonAIPredictionsProvider
} from '@aws-amplify/predictions';
import awsconfig from './aws-exports';
import '@aws-amplify/ui-react/styles.css';


Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

const useAnswerFetch = () => {
    const [answer, setAnswer] = useState([]);
    const [isFetchingAnswer, setIsFetchingAnswer] = useState(false);

    const fetchAnswer = async (author) => {
      setIsFetchingAnswer(true);
      
      const completion = await API.post('apigpt', '/call', {
        body: {
          input: {
            question: author
          }
        },
      });
      
      console.log("Listen Original");

      setAnswer(completion.Answer);

      Predictions.convert({
        textToSpeech:{
          source:{
            text: completion.Answer
          },
          voiceId: "Mia",
          languageCode: "es-MX"
        }
      })
      .then(result => {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        console.log({ AudioContext });
        const audioCtx = new AudioContext(); 
        const source = audioCtx.createBufferSource();
        audioCtx.decodeAudioData(result.audioStream, (buffer) => {
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(0);
        }, (err) => console.log({err}));
        setIsFetchingAnswer(false);
      })
      .catch(err => console.log(err));
    };

    return {
        answer,
        fetchAnswer,
        isFetchingAnswer, 
        setIsFetchingAnswer,
    };
};

export {
    useAnswerFetch,
}
