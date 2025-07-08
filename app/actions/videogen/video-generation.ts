// Types for the response
interface VideoGenerationResponse {
  operationId: string;
  videoId?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  videoUrl?: string;
}

// Constants for API configuration
const API_BASE_URL = 'https://alkalimakersuite-pa.clients6.google.com';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

// Function to generate access token
async function generateAccessToken(): Promise<string> {
  const headers = new Headers();
  headers.append("accept", "*/*");
  headers.append("accept-language", "en-US,en;q=0.6");
  headers.append("authorization", "SAPISIDHASH 1746039788_ae6d9a16274d0e9ea1d24b9ced06f2776e812b96 SAPISID1PHASH 1746039788_ae6d9a16274d0e9ea1d24b9ced06f2776e812b96 SAPISID3PHASH 1746039788_ae6d9a16274d0e9ea1d24b9ced06f2776e812b96");
  headers.append("content-type", "application/json+protobuf");
  headers.append("cookie", "SOCS=CAISNQgQEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwNTE0LjA2X3AwGgJmaSADGgYIgOu0sgY; HSID=AnXUOCA2irF4Fye45; SSID=AV7sb9dR4mjVAsMOH; APISID=Zs97xeksIyeSIqRx/Ag7408EpVbynkZPzL; SAPISID=tmntsyZFgUhGT9GC/AKan-TEQVA4wzBM1v; __Secure-1PAPISID=tmntsyZFgUhGT9GC/AKan-TEQVA4wzBM1v; __Secure-3PAPISID=tmntsyZFgUhGT9GC/AKan-TEQVA4wzBM1v; SID=g.a000wAhXaE5nf4MMbENyFAj3wooX8h2fZ34LG7PT2hChDe2K0yA1Z97kTfmHLSSeve3k-v1HEAACgYKATgSARMSFQHGX2MiuXiXX2iZmd_R67dHhM0HgBoVAUF8yKrMmh_Uq0m9Ti9ecobnsrRq0076; __Secure-1PSID=g.a000wAhXaE5nf4MMbENyFAj3wooX8h2fZ34LG7PT2hChDe2K0yA1vwKOPZE22wqO7Sk8p7niWQACgYKAZ0SARMSFQHGX2Mi_9TWCqxW4VVLRB0V-npsLxoVAUF8yKqnvAziSs7YUYXywe5ucWBp0076; __Secure-3PSID=g.a000wAhXaE5nf4MMbENyFAj3wooX8h2fZ34LG7PT2hChDe2K0yA1AgcO6EjAnLrsHxccdFhtGgACgYKAV8SARMSFQHGX2MiaUTmNbaGZFNThgO4eRlbohoVAUF8yKqAMG751lAvbMGIcJ7yX_DH0076; AEC=AVcja2cYV_qVmfiZw2mBotITfMIqh27nxxF_cMHs8WOacNmIh4RYP8NoeA; NID=523=Ul2iq2D7UT9k0G1vtGnDOfaf73ZnSFICI4d1hxXMgfFUKizEFlHg4h1hWoUPUiFZYHPnu6Dtkb4Hbo8C57PczV1nFVbDVrnA8kzW9akEHWuiOrUwSKXoKNgOd_7tfdhjihpqjcOCWivbWFIdXs5aIS1t6iEQxWS5nSagUXsw5OeqGSQNnqf7oJ6VHflgKaG-xcwElV1QGvwOgDloKOM7SL747kr1MAc_UrLSEviWeyaQCJafL1KZZo4YrMpMVw3CR8pT76qADBv__er-AWJ6VYyNbE6or_9HkrPM7jVWGUmlISziY3EKcgLsTmG6iBGe0asy4JBYWqUcmPW3yYhj6l0h8WrLAlqaIDOsRGTp1E_AuffsE36rVCf-806DA2VOpILsyBjUm4ADeJv8uPiuJkvntmF_YDTJbLnjcP9cwdNz-T5WHdkh3lV0O7tahlcLODI5cOtwJU71vz6GiNoKDUkDJTVM9RQEqPZAfiI5L_3BRKKwqWCs3_4eiwwnvJa_-GiANIsreIDq7Q-nPvsniXp5LNok9tCIlfggA9JsDijfjm1n41KvoZScF8848wme3UI8yRROI269VQFOoNmM9EQoAGSyIi__1UMHdGVJNVg6cV5AJ7aGcsIX2onQt6a70PcxrpuZgIkdeh0nNdoX5flbRc4K3LT4Ls9T4jn07xY-x1ypAdU95xZyD9I3_mjVsR0Bv_4CvtGiNpQtabBL53oL5FNehgOX5eJNfya3AcyUfyZFb1lDlSuFcjP_VURiBzXUKYCngbFJuxCzE4_eB3MHGz6XFoBzDgqfpoblBY0LNwGIziyIQ4xBlXPzfs_MhyW1CZSzUeDiGPA79-njlLytdJ79pyGdbHIvrQUOvxYmcsn52PP4NpVSzV4S-FoYvSsgSb4BJs8nydzcTeZcnakGp7N0rFDDPz0HavJtp1kXdn2B82ikAjZ_UR6oBluyZU0b9IkluRj9aWgkbjhZS5ZiypdZU-MKzTS1jJcIEEINL0lsFa5aH4nOC-UOfMx5oKUS56LInXcnmmoQseJGi2xWsGJtiRKFPOCoGa-0tB8Kd93dGrwEWdsspheQ91v4TqdKUEndZ8rlMs_ViOX6-hYzOZFNVdfz3WONWard5EEODRSraJ9bXdkMkszUuvPv2S9WcK_M5p-hREV6_KzbGs6IU9CrwZPYcIe_rQ; __Secure-1PSIDTS=sidts-CjEBjplskNrgqa5iSoRtRH2s6FcPRrd94Cb578IaQqpCADejoLZNkZk3u_7YqYIS9VeiEAA; __Secure-3PSIDTS=sidts-CjEBjplskNrgqa5iSoRtRH2s6FcPRrd94Cb578IaQqpCADejoLZNkZk3u_7YqYIS9VeiEAA; SIDCC=AKEyXzXvzZ41JawICMV-EBasvnDwP2Ee-iDeyIo38iKkJXiw5lJxHq8ayDFpygp0PNEDVRItzIM; __Secure-1PSIDCC=AKEyXzWSYO8sXLqQLjxD0YMTGNLEPIgtPCcWV7CoWXRPBf3jDiSvQE10AVB9JaKkE-yk6qHuPjRJ; __Secure-3PSIDCC=AKEyXzXybnrcFbHtW3m8fXYSicFtyoWSD4XZfQei4HK1pUBD67le688oCp84OKkbIwszxnAoMo1x; SIDCC=AKEyXzUcmV7qnHiRNbk5-oOMhDRQ5Hj49exXFAwPIXr_zItrOd12WDGjPiFeY7F5ePDIP5L3-p4; __Secure-1PSIDCC=AKEyXzXaxbWWAHXcWEalx8pTNVsTpF7ORKFLyHh60XInu3MqIwdrJBJ5zdVUNI0c0zKQ_rAq9bpF; __Secure-3PSIDCC=AKEyXzXtRukB7p-xnNzW-Cg-BTDIdZPIguazTXCtYWcp4kNV4DeealVn_7sd75c3frO9zJmt0_YP");
  headers.append("origin", "https://aistudio.google.com");
  headers.append("priority", "u=1, i");
  headers.append("referer", "https://aistudio.google.com/");
  headers.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"");
  headers.append("sec-ch-ua-arch", "\"x86\"");
  headers.append("sec-ch-ua-bitness", "\"64\"");
  headers.append("sec-ch-ua-full-version-list", "\"Chromium\";v=\"128.0.0.0\", \"Not;A=Brand\";v=\"24.0.0.0\", \"Brave\";v=\"128.0.0.0\"");
  headers.append("sec-ch-ua-mobile", "?0");
  headers.append("sec-ch-ua-model", "\"\"");
  headers.append("sec-ch-ua-platform", "\"Linux\"");
  headers.append("sec-ch-ua-platform-version", "\"6.13.1\"");
  headers.append("sec-ch-ua-wow64", "?0");
  headers.append("sec-fetch-dest", "empty");
  headers.append("sec-fetch-mode", "cors");
  headers.append("sec-fetch-site", "same-site");
  headers.append("sec-gpc", "1");
  headers.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
  headers.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
  headers.append("x-goog-authuser", "0");
  headers.append("x-goog-ext-519733851-bin", "CAESAUwwATgEQAA=");
  headers.append("x-user-agent", "grpc-web-javascript/0.1");

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(["users/me"]),
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateAccessToken`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result[0]; // The access token is the first element in the response array
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to create headers
const createHeaders = async (authToken?: string) => {
  const headers = new Headers();
  headers.append("accept", "*/*");
  headers.append("accept-language", "en-US,en;q=0.6");
  headers.append("content-type", "application/json+protobuf");
  headers.append("origin", "https://aistudio.google.com");
  headers.append("priority", "u=1, i");
  headers.append("referer", "https://aistudio.google.com/");
  headers.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"");
  headers.append("sec-ch-ua-arch", "\"x86\"");
  headers.append("sec-ch-ua-bitness", "\"64\"");
  headers.append("sec-ch-ua-full-version-list", "\"Chromium\";v=\"128.0.0.0\", \"Not;A=Brand\";v=\"24.0.0.0\", \"Brave\";v=\"128.0.0.0\"");
  headers.append("sec-ch-ua-mobile", "?0");
  headers.append("sec-ch-ua-model", "\"\"");
  headers.append("sec-ch-ua-platform", "\"Linux\"");
  headers.append("sec-ch-ua-platform-version", "\"6.13.1\"");
  headers.append("sec-ch-ua-wow64", "?0");
  headers.append("sec-fetch-dest", "empty");
  headers.append("sec-fetch-mode", "cors");
  headers.append("sec-fetch-site", "same-site");
  headers.append("sec-gpc", "1");
  headers.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
  headers.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
  headers.append("x-goog-authuser", "0");
  headers.append("x-goog-ext-519733851-bin", "CAESAUwwATgEQAA=");
  headers.append("x-user-agent", "grpc-web-javascript/0.1");

  if (authToken) {
    headers.append("authorization", `Bearer ${authToken}`);
  } else {
    const accessToken = await generateAccessToken();
    headers.append("authorization", `Bearer ${accessToken}`);
  }

  return headers;
};

// Function to poll for video generation status
const pollVideoGeneration = async (operationId: string): Promise<VideoGenerationResponse> => {
  const headers = await createHeaders();
  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify([operationId]),
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GetGenerateVideoOperation`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Parse the response to get the video ID
    const videoId = result[1]?.[0]?.[0]?.[0];
    
    if (videoId) {
      return {
        operationId,
        videoId,
        status: 'completed'
      };
    }

    return {
      operationId,
      status: 'pending'
    };
  } catch (error) {
    return {
      operationId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get the video URL
const getVideoUrl = async (videoId: string): Promise<string> => {
  const headers = await createHeaders();
  const requestOptions = {
    method: "GET",
    headers,
  };

  try {
    const response = await fetch(
      `${DRIVE_API_URL}/${videoId}?alt=media`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the video URL from the response
    const videoUrl = response.url;
    return videoUrl;
  } catch (error) {
    throw new Error(`Failed to get video URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Main server action
export async function generateVideo(prompt: string, image: string): Promise<VideoGenerationResponse> {
  try {
    // Step 1: Initiate video generation
    const headers = await createHeaders();
    const requestBody = {
      prompt: prompt,
      image: image,
      options: {
        aspectRatio: "16:9",
        duration: 4,
        style: "cinematic",
        motion: "medium"
      }
    };

    const requestOptions = {
      method: "POST",
      headers,
      body: JSON.stringify([requestBody]),
    };

    const response = await fetch(
      `${API_BASE_URL}/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateVideo`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const operationId = result[0];

    // Step 2: Poll for video generation status
    let status: VideoGenerationResponse;
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 5000; // 5 seconds

    do {
      status = await pollVideoGeneration(operationId);
      if (status.status === 'completed' || status.status === 'failed') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    } while (attempts < maxAttempts);

    if (status.status === 'completed' && status.videoId) {
      const videoUrl = await getVideoUrl(status.videoId);
      return {
        ...status,
        videoUrl
      };
    }

    return status;
  } catch (error) {
    return {
      operationId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to get video URL (to be called after video generation is complete)
export async function getGeneratedVideoUrl(videoId: string): Promise<string> {
  return getVideoUrl(videoId);
}










