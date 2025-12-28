
const API_KEY = 'sk_de7b94b4be1afac0c13b4d5018f8021e221b1ee614fe6414';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - standard generic voice

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
        const err = await response.json();
        console.error("ElevenLabs Error:", err);
        return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("ElevenLabs API Call Failed", error);
    return null;
  }
};
